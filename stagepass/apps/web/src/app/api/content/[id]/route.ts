import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function mapContent(d: FirebaseFirestore.DocumentData, id: string) {
  return {
    id,
    title: d.title || "Untitled",
    type: d.type || "VIDEO",
    status: d.status,
    thumbnail: d.thumbnailUrl || d.thumbnail || null,
    thumbnailUrl: d.thumbnailUrl || d.thumbnail || null,
    creatorId: d.creatorId || d.ownerUid,
    creatorName: d.creatorName || "Unknown",
    creatorSlug: d.creatorSlug || "user",
    playbackUrl: d.playbackUrl || null,
    driveFileId: d.driveFileId || null,
    drivePreviewUrl: d.drivePreviewUrl || null,
    mood: d.mood || "",
    viewCount: d.viewCount || 0,
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

// GET /api/content/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("content").doc(params.id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item: mapContent(snap.data()!, snap.id) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
