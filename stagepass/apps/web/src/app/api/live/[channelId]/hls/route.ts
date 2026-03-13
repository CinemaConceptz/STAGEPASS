import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// GET /api/live/[channelId]/hls → redirects to the actual HLS manifest URL
// This acts as a short-form stream link
export async function GET(req: NextRequest, { params }: { params: { channelId: string } }) {
  try {
    const { channelId } = params;
    const db = getFirestore(adminApp);
    const snap = await db.collection("liveChannels").doc(channelId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const data = snap.data()!;
    const hlsUrl = data.playbackUrl;

    if (!hlsUrl) {
      return NextResponse.json({ error: "No playback URL for this stream" }, { status: 404 });
    }

    // Redirect to the actual HLS manifest
    return NextResponse.redirect(hlsUrl, 302);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
