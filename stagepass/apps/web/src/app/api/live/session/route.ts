import { NextResponse } from "next/server";
import { createLiveChannel, startChannel } from "@/lib/google/livestream";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const channelId = `user-${userId}-${Date.now()}`;
    const streamKey = `sk_${channelId}`;

    // 1. Provision Live Stream channel
    const { inputUri, channelName } = await createLiveChannel(channelId);

    // 2. Start the channel
    await startChannel(channelId);

    // Parse RTMP URL and key from inputUri
    // Format typically: rtmp://input-endpoint/live/stream-key
    const rtmpUrl = inputUri || `rtmp://live.stagepassaccess.com/live`;

    // 3. Record the live session in Firestore
    const db = getFirestore(adminApp);
    const playbackUrl = `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/live/${channelId}/manifest.m3u8`;

    await db.collection("liveChannels").doc(channelId).set({
      channelId,
      ownerUid: userId,
      title: title || "Live Stream",
      status: "LIVE",
      ingestUrl: rtmpUrl,
      streamKey,
      playbackUrl,
      startedAt: new Date().toISOString(),
      listenerCount: 0,
    });

    return NextResponse.json({
      success: true,
      channelId,
      streamUrl: rtmpUrl,
      rtmpUrl,
      streamKey,
      playbackUrl,
    });
  } catch (error: any) {
    console.error("Live session error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
