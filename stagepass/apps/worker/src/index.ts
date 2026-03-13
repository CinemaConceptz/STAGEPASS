import express from "express";
import { processContent } from "./processors/content";
import { generateRadioStream, processRadioTrack } from "./processors/radio-stream";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "stagepass-worker" }));

/**
 * Pub/Sub push endpoint.
 * Handles: CONTENT, RADIO_TRACK, RADIO_STREAM messages.
 */
app.post("/tasks/process-content", async (req, res) => {
  let payload: any;
  try {
    const envelope = req.body;
    if (envelope?.message?.data) {
      const decoded = Buffer.from(envelope.message.data, "base64").toString("utf8");
      payload = JSON.parse(decoded);
    } else {
      payload = req.body;
    }

    const messageType = payload?.type;

    // Route by message type
    if (messageType === "RADIO_STREAM") {
      console.log(`[worker] Radio stream request for station: ${payload.stationId}`);
      res.status(200).json({ status: "accepted", stationId: payload.stationId });
      await generateRadioStream(payload);
      return;
    }

    if (messageType === "RADIO_TRACK") {
      console.log(`[worker] Radio track ingest: ${payload.trackId}`);
      res.status(200).json({ status: "accepted", trackId: payload.trackId });
      await processRadioTrack(payload);
      return;
    }

    // Default: content processing
    if (!payload?.contentId) {
      console.error("[worker] Missing contentId in payload");
      return res.status(400).json({ error: "Missing contentId" });
    }

    console.log(`[worker] Processing content: ${payload.contentId}`);
    res.status(200).json({ status: "accepted", contentId: payload.contentId });
    await processContent(payload);
  } catch (err: any) {
    console.error("[worker] Handler error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
  }
});

/**
 * Direct endpoint to trigger HLS stream generation for a radio station.
 * POST /tasks/generate-radio-stream { stationId, bucket }
 */
app.post("/tasks/generate-radio-stream", async (req, res) => {
  try {
    const { stationId, bucket } = req.body;
    if (!stationId) {
      return res.status(400).json({ error: "Missing stationId" });
    }

    const gcsBucket = bucket || process.env.GCS_BUCKET || "stagepass-live-v1.firebasestorage.app";
    console.log(`[worker] Direct radio stream request for station: ${stationId}`);
    res.status(200).json({ status: "accepted", stationId });

    await generateRadioStream({ type: "RADIO_STREAM", stationId, bucket: gcsBucket });
  } catch (err: any) {
    console.error("[worker] Radio stream error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`[stagepass-worker] Listening on port ${PORT}`);
});
