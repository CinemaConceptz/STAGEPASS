import { NextResponse } from "next/server";
import { createLiveChannel, startChannel } from "@/lib/google/livestream";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title } = body; // In prod, get userId from auth token

    const channelId = `user-${userId}-${Date.now()}`;

    // 1. Provision Infrastructure
    const { inputUri, channelName } = await createLiveChannel(channelId);

    // 2. Start the Channel (Spin up encoders)
    await startChannel(channelId);

    return NextResponse.json({ 
      success: true, 
      streamUrl: inputUri,  // OBS URL
      streamKey: "", // Usually appended to URL or separate depending on config
      playbackUrl: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/live/${channelId}/manifest.m3u8`
    });

  } catch (error: any) {
    console.error("Live Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
