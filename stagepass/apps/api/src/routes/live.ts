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

    // Parse GCP RTMP URI into OBS-compatible Server + Stream Key
    // inputRes.uri format: "rtmp://<IP>/<app>/<stream_key>"
    const fullUri = inputRes.uri || "";
    const lastSlash = fullUri.lastIndexOf("/");
    const rtmpServer = lastSlash > 7 ? fullUri.substring(0, lastSlash) : fullUri;
    const streamKey = lastSlash > 7 ? fullUri.substring(lastSlash + 1) : channelId;

    // Record in Firestore
    const db = getFirestore(adminApp);
    await db.collection("liveChannels").doc(channelId).set({
      channelId,
      ownerUid: uid,
      title: title || "Live Stream",
      status: "LIVE",
      ingestUrl: fullUri,
      rtmpServer,
      streamKey,
      playbackUrl,
      startedAt: new Date().toISOString(),
    });

    // Notify all followers
    try {
      const followsSnap = await db.collection("follows").where("creatorId", "==", uid).get();
      const creatorSnap = await db.collection("creators").doc(uid).get();
      const creatorName = creatorSnap.data()?.displayName || "A creator";
      const batch = db.batch();
      followsSnap.docs.forEach(d => {
        const followerId = d.data().followerId;
        const notifRef = db.collection("notifications").doc(followerId).collection("items").doc();
        batch.set(notifRef, {
          type: "LIVE",
          title: `${creatorName} is live`,
          body: `${creatorName} just started streaming: "${title || "Live Stream"}"`,
          read: false,
          link: `/live`,
          createdAt: new Date().toISOString(),
        });
      });
      if (!followsSnap.empty) await batch.commit();
    } catch (notifErr) {
      console.warn("[live] Could not send notifications:", notifErr);
    }

    return res.json({
      success: true,
      channelId,
      streamUrl: rtmpServer,   // OBS "Server" field: rtmp://IP/app
      streamKey,               // OBS "Stream Key" field: the key part only
      fullRtmpUri: fullUri,    // Full URI for reference
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
