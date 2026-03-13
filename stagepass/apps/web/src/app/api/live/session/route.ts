import { NextResponse } from "next/server";
import { createLiveChannel, startChannel } from "@/lib/google/livestream";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// Sanitize ID for GCP: lowercase, alphanumeric + hyphens, 1-63 chars, must start/end with alphanumeric
function sanitizeGcpId(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")  // Replace invalid chars with hyphens
    .replace(/-+/g, "-")           // Collapse multiple hyphens
    .replace(/^-/, "")             // Strip leading hyphen
    .replace(/-$/, "")             // Strip trailing hyphen
    .slice(0, 63);                 // Max 63 chars
}

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

    // Build a GCP-safe channel ID
    const ts = Date.now().toString(36); // shorter timestamp
    const uid = userId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const channelId = sanitizeGcpId(`ch-${uid}-${ts}`);
    const streamKey = `sk-${uid}-${ts}`;

    // 1. Provision Live Stream channel
    const { inputUri, channelName } = await createLiveChannel(channelId);

    // 2. Start the channel
    await startChannel(channelId);

    // Parse GCP's inputUri into OBS-compatible Server + Stream Key
    // GCP format: "rtmp://<IP>/<app>/<gcp-stream-key>"
    // OBS needs: Server = "rtmp://<IP>/<app>", Stream Key = "<gcp-stream-key>"
    const fullRtmpUri = inputUri || `rtmp://live.stagepassaccess.com/live`;
    const lastSlash = fullRtmpUri.lastIndexOf("/");
    const rtmpServer = lastSlash > 7 ? fullRtmpUri.substring(0, lastSlash) : fullRtmpUri;
    const gcpStreamKey = lastSlash > 7 ? fullRtmpUri.substring(lastSlash + 1) : streamKey;

    // 3. Record the live session in Firestore
    const db = getFirestore(adminApp);
    const playbackUrl = `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/live/${channelId}/manifest.m3u8`;

    await db.collection("liveChannels").doc(channelId).set({
      channelId,
      ownerUid: userId,
      title: title || "Live Stream",
      status: "LIVE",
      ingestUrl: fullRtmpUri,
      rtmpServer,
      streamKey: gcpStreamKey,
      playbackUrl,
      startedAt: new Date().toISOString(),
      listenerCount: 0,
    });

    return NextResponse.json({
      success: true,
      channelId,
      streamUrl: rtmpServer,   // OBS "Server" field
      rtmpUrl: rtmpServer,
      streamKey: gcpStreamKey, // OBS "Stream Key" field (GCP-generated key from inputUri)
      fullRtmpUri,
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
