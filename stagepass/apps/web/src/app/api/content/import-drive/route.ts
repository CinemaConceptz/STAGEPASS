import { NextResponse } from "next/server";
import { transferFileFromDrive } from "@/lib/google/storage";
import { createTranscodeJob } from "@/lib/google/transcoder";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, title, token, userId, creatorName } = body;

    if (!token || !fileId) {
      return NextResponse.json(
        { error: "Missing token or fileId" },
        { status: 400 }
      );
    }

    const contentId = `video-${Date.now()}`;
    const fileName = `${contentId}.mp4`;
    const rawPath = `uploads/${fileName}`;
    const processedPath = `processed/${contentId}/`;
    const outputBucket =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      "stagepass-live-v1.firebasestorage.app";

    // Create content record via Admin SDK (server-safe)
    const db = getFirestore(adminApp);
    await db.collection("content").doc(contentId).set({
      id: contentId,
      title: title || "Untitled Premiere",
      type: "VIDEO",
      status: "PROCESSING",
      creatorId: userId,
      creatorName: creatorName || "Creator",
      creatorSlug: "user",
      thumbnailUrl: `https://storage.googleapis.com/${outputBucket}/${processedPath}thumbnail.jpg`,
      playbackUrl: `https://storage.googleapis.com/${outputBucket}/${processedPath}manifest.m3u8`,
      createdAt: new Date().toISOString(),
    });

    // Transfer file from Drive → GCS
    const gcsUri = await transferFileFromDrive(token, fileId, rawPath);

    // Kick off Transcoder job
    const outputUri = `gs://${outputBucket}/${processedPath}`;
    const jobName = await createTranscodeJob(gcsUri as string, outputUri);

    return NextResponse.json({
      success: true,
      jobName,
      contentId,
      message: "Processing started. It will appear on your feed shortly.",
    });
  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
