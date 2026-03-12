import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, fileName, title, token, userId, creatorName, creatorSlug } = body;

    if (!token || !fileId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: fileId, token, userId" },
        { status: 400 }
      );
    }

    const contentId = `content-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-live-v1.firebasestorage.app";
    const processedPath = `processed/${contentId}`;
    const playbackUrl = `https://storage.googleapis.com/${bucket}/${processedPath}/manifest.m3u8`;
    const thumbnailUrl = `https://storage.googleapis.com/${bucket}/${processedPath}/thumbnail.jpeg`;

    // 1. Create Firestore doc with QUEUED status
    const db = getFirestore(adminApp);
    await db.collection("content").doc(contentId).set({
      id: contentId,
      title: title || fileName?.replace(/\.[^/.]+$/, "") || "Untitled Premiere",
      type: "VIDEO",
      status: "QUEUED",
      ownerUid: userId,
      creatorId: userId,
      creatorName: creatorName || "Creator",
      creatorSlug: creatorSlug || "user",
      driveFileId: fileId,
      bucket,
      processedPath,
      thumbnailUrl,
      playbackUrl,
      createdAt: new Date().toISOString(),
    });

    // 2. Try to publish to Pub/Sub for async worker processing
    // If Pub/Sub is not configured, the worker won't trigger but the record is saved
    try {
      const { PubSub } = await import("@google-cloud/pubsub");
      const pubsub = new PubSub({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
      const topicName = "stagepass-content-process";
      const message = Buffer.from(
        JSON.stringify({
          contentId,
          driveFileId: fileId,
          driveToken: token,
          userId,
          bucket,
          processedPath,
          rawPath: `uploads/${contentId}.mp4`,
        })
      );
      await pubsub.topic(topicName).publishMessage({ data: message });
    } catch (pubSubErr: any) {
      // Pub/Sub not configured — log but don't fail the request
      console.warn("[import-drive] Pub/Sub not available:", pubSubErr.message);
    }

    return NextResponse.json({
      success: true,
      contentId,
      message: "Upload queued. Your content will appear once processing is complete.",
    });
  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
