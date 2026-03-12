import { Router, Request, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { LivestreamServiceClient } from "@google-cloud/livestream";
import { requireAuth, adminApp } from "../middleware/auth";

export const liveRouter = Router();

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "stagepass-live-v1";
const LOCATION = "us-central1";
const BUCKET = process.env.GCS_BUCKET || "stagepass-live-v1.firebasestorage.app";

// POST /live/session — provision a live channel
liveRouter.post("/session", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const { title } = req.body;

  const client = new LivestreamServiceClient();
  const channelId = `ch-${uid}-${Date.now()}`;

  try {
    const parent = client.locationPath(PROJECT_ID, LOCATION);
    const inputId = `inp-${channelId}`;

    // Create input endpoint
    const [inputOp] = await client.createInput({ parent, inputId, input: { type: "RTMP_PUSH" } });
    const [inputRes] = await inputOp.promise();

    // Create channel
    const [channelOp] = await client.createChannel({
      parent,
      channelId,
      channel: {
        inputAttachments: [{ key: "primary", input: inputRes.name }],
        output: { uri: `gs://${BUCKET}/live/${channelId}/` },
        elementaryStreams: [
          { key: "vs", videoStream: { h264: { heightPixels: 720, widthPixels: 1280, bitrateBps: 2500000, frameRate: 30 } } },
          { key: "as", audioStream: { codec: "aac", channelCount: 2, bitrateBps: 64000 } },
        ],
        muxStreams: [{ key: "hls", container: "ts", elementaryStreams: ["vs", "as"] }],
        manifests: [{ fileName: "manifest.m3u8", type: "HLS", muxStreams: ["hls"] }],
      },
    });
    const [channelRes] = await channelOp.promise();

    // Start channel
    const [startOp] = await client.startChannel({ name: channelRes.name! });
    await startOp.promise();

    const playbackUrl = `https://storage.googleapis.com/${BUCKET}/live/${channelId}/manifest.m3u8`;

    // Record in Firestore
    const db = getFirestore(adminApp);
    await db.collection("liveChannels").doc(channelId).set({
      channelId,
      ownerUid: uid,
      title: title || "Live Stream",
      status: "LIVE",
      ingestUrl: inputRes.uri,
      playbackUrl,
      startedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      channelId,
      streamUrl: inputRes.uri,
      streamKey: "live",
      playbackUrl,
    });
  } catch (err: any) {
    console.error("[live] session error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /live/session/:channelId/stop
liveRouter.post("/session/:channelId/stop", requireAuth, async (req: Request, res: Response) => {
  const client = new LivestreamServiceClient();
  const { channelId } = req.params;
  const name = client.channelPath(PROJECT_ID, LOCATION, channelId);
  try {
    const [op] = await client.stopChannel({ name });
    await op.promise();
    const db = getFirestore(adminApp);
    await db.collection("liveChannels").doc(channelId).update({ status: "ENDED", endedAt: new Date().toISOString() });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
