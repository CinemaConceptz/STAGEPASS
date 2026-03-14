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
    // Try to copy each track to GCS immediately for public playback
    const trackList: any[] = [];
    for (let i = 0; i < (tracks || []).length; i++) {
      const t = tracks[i];
      const trackId = `track-${i}-${Date.now()}`;
      const gcsPath = `radio/${stationId}/tracks/${t.driveFileId}`;
      const gcsUrl = `https://storage.googleapis.com/${bucket}/${gcsPath}`;
      const driveUrl = `https://drive.google.com/uc?export=download&id=${t.driveFileId}`;

      let finalUrl = driveUrl; // Default fallback

      // Try to copy from Drive to GCS using provided token for immediate public playback
      if (token) {
        try {
          const driveRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${t.driveFileId}?alt=media`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (driveRes.ok) {
            const contentType = driveRes.headers.get("content-type") || t.mimeType || "audio/mpeg";
            const audioBuffer = await driveRes.arrayBuffer();
            if (audioBuffer.byteLength > 0) {
              const { Storage } = await import("@google-cloud/storage");
              const storage = new Storage();
              const fileRef = storage.bucket(bucket).file(gcsPath);
              await fileRef.save(Buffer.from(audioBuffer), {
                contentType,
                metadata: { cacheControl: "public, max-age=31536000" },
              });
              await fileRef.makePublic();
              finalUrl = gcsUrl;
              console.log(`[radio/station] Copied track ${t.driveFileId} to GCS: ${gcsUrl}`);
            }
          }
        } catch (gcsErr: any) {
          console.warn(`[radio/station] GCS copy failed for ${t.driveFileId}:`, gcsErr.message);
          // Fall back to Drive URL
        }
      }

      trackList.push({
        id: trackId,
        title: (t.driveFileName || `Track ${i + 1}`).replace(/\.[^/.]+$/, ""),
        artist: "",
        driveFileId: t.driveFileId,
        mimeType: t.mimeType || "audio/mpeg",
        url: finalUrl,
        driveUrl,
        mood: t.mood || "",
        durationMs: 180000,
      });
    }

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

    // Also try Pub/Sub for async worker processing (optional, won't block if unavailable)
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
