import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, fileName, title, mood, token, userId, creatorName, creatorSlug, customThumbnailUrl } = body;

    if (!token || !fileId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: fileId, token, userId" },
        { status: 400 }
      );
    }

    const contentId = `content-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.GCS_BUCKET || "stagepass-live-v1.firebasestorage.app";
    const processedPath = `processed/${contentId}`;

    // Fetch file metadata + thumbnail from Drive API
    let driveThumbnail: string | null = null;
    let mimeType = "video/mp4";
    try {
      const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,mimeType,name,videoMediaMetadata`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (metaRes.ok) {
        const meta = await metaRes.json();
        // Drive returns 220px thumbnails; request larger
        driveThumbnail = meta.thumbnailLink
          ? meta.thumbnailLink.replace(/=s\d+/, "=s800")
          : null;
        mimeType = meta.mimeType || mimeType;
      }
    } catch (e) {
      console.warn("[import-drive] Failed to fetch Drive metadata:", e);
    }

    // Store both GCS (for after processing) and Drive (for immediate use) URLs
    const hlsUrl = `https://storage.googleapis.com/${bucket}/${processedPath}/manifest.m3u8`;
    const drivePreviewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    // Create Firestore doc
    const db = getFirestore(adminApp);
    await db.collection("content").doc(contentId).set({
      id: contentId,
      title: title || fileName?.replace(/\.[^/.]+$/, "") || "Untitled Premiere",
      type: mimeType.startsWith("audio") ? "AUDIO" : "VIDEO",
      status: "QUEUED",
      ownerUid: userId,
      creatorId: userId,
      creatorName: creatorName || "Creator",
      creatorSlug: creatorSlug || "user",
      driveFileId: fileId,
      mood: mood || "",
      bucket,
      processedPath,
      // Thumbnail: use Drive thumbnail immediately, GCS after processing
      thumbnailUrl: customThumbnailUrl || driveThumbnail || null,
      // Playback: HLS after processing, Drive preview as immediate fallback
      playbackUrl: hlsUrl,
      drivePreviewUrl,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    });

    // Try Pub/Sub for async worker processing
    try {
      const { PubSub } = await import("@google-cloud/pubsub");
      const pubsub = new PubSub({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID });
      await pubsub.topic("stagepass-content-process").publishMessage({
        data: Buffer.from(JSON.stringify({
          contentId,
          driveFileId: fileId,
          driveToken: token,
          userId,
          bucket,
          processedPath,
          rawPath: `uploads/${contentId}.mp4`,
        })),
      });
    } catch (pubSubErr: any) {
      console.warn("[import-drive] Pub/Sub not available:", pubSubErr.message);
    }

    return NextResponse.json({
      success: true,
      contentId,
      thumbnail: driveThumbnail,
      message: "Upload queued successfully.",
    });
  } catch (error: any) {
    console.error("[import-drive] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
