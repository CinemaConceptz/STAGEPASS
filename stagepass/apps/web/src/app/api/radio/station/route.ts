import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// Update station route to handle multi-track + artwork + schedule
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stationId, userId, stationName, genre, description, artworkUrl, tracks, token } = body;

    if (!stationId || !userId) {
      return NextResponse.json({ success: false, error: "Missing stationId or userId" }, { status: 400 });
    }

    const db = getFirestore(adminApp);
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-live-v1.firebasestorage.app";

    // Build track list from Drive files
    const trackList = (tracks || []).map((t: any, i: number) => ({
      id: `track-${i}-${Date.now()}`,
      title: (t.driveFileName || `Track ${i + 1}`).replace(/\.[^/.]+$/, ""),
      artist: "",
      driveFileId: t.driveFileId,
      mimeType: t.mimeType || "audio/mpeg",
      url: `https://storage.googleapis.com/${bucket}/radio/${stationId}/tracks/${t.driveFileId}`,
      durationMs: 180000, // Default 3 min, updated after processing
    }));

    const stationData: Record<string, any> = {
      stationId,
      ownerUid: userId,
      name: stationName || "My Station",
      genre: genre || "Other",
      description: description || "",
      trackCount: trackList.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoDjEnabled: true,
      autoDjShuffle: false,
    };

    if (artworkUrl) stationData.artworkUrl = artworkUrl;
    if (trackList.length > 0) stationData.tracks = trackList;

    await db.collection("radioStations").doc(stationId).set(stationData, { merge: true });

    // Optionally trigger track ingestion via Pub/Sub
    if (token && trackList.length > 0) {
      try {
        const { PubSub } = await import("@google-cloud/pubsub");
        const pubsub = new PubSub({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
        for (const track of trackList) {
          await pubsub.topic("stagepass-content-process").publishMessage({
            data: Buffer.from(JSON.stringify({
              type: "RADIO_TRACK",
              stationId,
              trackId: track.id,
              driveFileId: track.driveFileId,
              driveToken: token,
              bucket,
              outputPath: `radio/${stationId}/tracks/${track.driveFileId}`,
            })),
          });
        }
      } catch (e: any) {
        console.warn("[radio/station] Pub/Sub not available:", e.message);
      }
    }

    return NextResponse.json({ success: true, stationId, trackCount: trackList.length });
  } catch (error: any) {
    console.error("Radio station error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
