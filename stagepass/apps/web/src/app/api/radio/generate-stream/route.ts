import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/radio/generate-stream
 * Triggers HLS stream generation for a radio station.
 * Calls the media worker service directly, or falls back to updating Firestore
 * so the worker can pick it up via a scheduled job.
 */
export async function POST(req: NextRequest) {
  try {
    const { stationId, userId } = await req.json();
    if (!stationId) {
      return NextResponse.json({ success: false, error: "Missing stationId" }, { status: 400 });
    }

    const db = getFirestore(adminApp);

    // Verify station exists
    const stationSnap = await db.collection("radioStations").doc(stationId).get();
    if (!stationSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Station not found. Please launch your station first." },
        { status: 404 }
      );
    }

    const stationData = stationSnap.data()!;
    const tracks = stationData.tracks || [];

    if (tracks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Station has no tracks. Add tracks before generating a stream." },
        { status: 400 }
      );
    }

    // Get worker URL from environment
    const workerUrl =
      process.env.WORKER_SERVICE_URL ||
      process.env.MEDIA_WORKER_URL ||
      `https://stagepass-worker-${process.env.GCLOUD_PROJECT || "stagepass-live-v1"}.run.app`;

    const bucket =
      process.env.GCS_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      "stagepass-live-v1.firebasestorage.app";

    // Strategy 1: Call the worker directly
    let workerCalled = false;
    try {
      // On Cloud Run, get ID token for service-to-service auth
      let headers: Record<string, string> = { "Content-Type": "application/json" };

      try {
        const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${workerUrl}`;
        const tokenRes = await fetch(metadataUrl, {
          headers: { "Metadata-Flavor": "Google" },
        });
        if (tokenRes.ok) {
          const idToken = await tokenRes.text();
          headers["Authorization"] = `Bearer ${idToken}`;
        }
      } catch {
        // Not on Cloud Run, skip auth
      }

      const workerRes = await fetch(`${workerUrl}/tasks/generate-radio-stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({ stationId, bucket }),
      });

      if (workerRes.ok) {
        workerCalled = true;
        console.log(`[generate-stream] Worker called successfully for station ${stationId}`);
      } else {
        console.warn(`[generate-stream] Worker returned ${workerRes.status}`);
      }
    } catch (workerErr: any) {
      console.warn(`[generate-stream] Worker unreachable: ${workerErr.message}`);
    }

    // Strategy 2: If worker not available, try Pub/Sub
    if (!workerCalled) {
      try {
        const { PubSub } = await import("@google-cloud/pubsub");
        const pubsub = new PubSub();
        const topicName = process.env.PUBSUB_TOPIC || "stagepass-tasks";

        await pubsub.topic(topicName).publishMessage({
          json: { type: "RADIO_STREAM", stationId, bucket },
        });

        workerCalled = true;
        console.log(`[generate-stream] Published to Pub/Sub for station ${stationId}`);
      } catch (pubsubErr: any) {
        console.warn(`[generate-stream] Pub/Sub failed: ${pubsubErr.message}`);
      }
    }

    // Strategy 3: Queue in Firestore for the worker to pick up
    if (!workerCalled) {
      await db.collection("radioStations").doc(stationId).update({
        streamStatus: "QUEUED",
        streamRequestedAt: new Date().toISOString(),
      });
      console.log(`[generate-stream] Queued in Firestore for station ${stationId}`);
    }

    // Update station status
    await db.collection("radioStations").doc(stationId).update({
      streamStatus: workerCalled ? "GENERATING" : "QUEUED",
      lastStreamRequest: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: workerCalled ? "GENERATING" : "QUEUED",
      message: workerCalled
        ? "HLS stream generation started. Your station will be live in a few minutes."
        : "Stream generation queued. The media worker will process it when available.",
    });
  } catch (error: any) {
    console.error("[generate-stream] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
