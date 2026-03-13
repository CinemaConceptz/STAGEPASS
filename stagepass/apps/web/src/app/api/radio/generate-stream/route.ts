import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// POST /api/radio/generate-stream — trigger server-side HLS generation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stationId, userId } = body;

    if (!stationId || !userId) {
      return NextResponse.json({ error: "Missing stationId or userId" }, { status: 400 });
    }

    // Verify ownership
    const db = getFirestore(adminApp);
    const stationSnap = await db.collection("radioStations").doc(stationId).get();
    if (!stationSnap.exists) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    if (stationSnap.data()?.ownerUid !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-live-v1.firebasestorage.app";

    // Try to trigger via worker service directly
    const workerUrl = process.env.WORKER_SERVICE_URL || "https://stagepass-worker-rmpe2fteqq-uc.a.run.app";

    try {
      const workerRes = await fetch(`${workerUrl}/tasks/generate-radio-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId, bucket }),
      });
      const workerData = await workerRes.json();

      if (workerData.status === "accepted") {
        return NextResponse.json({
          success: true,
          message: "HLS stream generation started. This may take a few minutes.",
          stationId,
        });
      }
    } catch (workerErr: any) {
      console.warn("[generate-stream] Worker not reachable, trying Pub/Sub:", workerErr.message);
    }

    // Fallback: Pub/Sub
    try {
      const { PubSub } = await import("@google-cloud/pubsub");
      const pubsub = new PubSub({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
      await pubsub.topic("stagepass-content-process").publishMessage({
        data: Buffer.from(JSON.stringify({
          type: "RADIO_STREAM",
          stationId,
          bucket,
        })),
      });

      return NextResponse.json({
        success: true,
        message: "HLS generation queued via Pub/Sub.",
        stationId,
      });
    } catch (pubsubErr: any) {
      return NextResponse.json(
        { success: false, error: `Could not trigger stream generation: ${pubsubErr.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
