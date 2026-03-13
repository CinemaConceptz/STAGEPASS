import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("content").doc(params.id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data()!;
    if (data.status !== "READY") {
      // Return the direct URL even if not "signed" when processing
      return NextResponse.json({ url: data.playbackUrl, signed: false });
    }

    // Generate a V4 signed URL (1 hour expiry) for the HLS manifest
    const storage = new Storage();
    const bucket = data.bucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-live-v1.firebasestorage.app";
    const manifestPath = `${data.processedPath}/manifest.m3u8`;

    try {
      const [signedUrl] = await storage.bucket(bucket).file(manifestPath).getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return NextResponse.json({ url: signedUrl, signed: true, expiresIn: 3600 });
    } catch {
      // Fallback to public URL if signing fails (e.g. bucket is already public)
      return NextResponse.json({ url: data.playbackUrl, signed: false });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
