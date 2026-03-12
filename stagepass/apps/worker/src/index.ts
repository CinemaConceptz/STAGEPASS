import express from "express";
import { processContent } from "./processors/content";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "stagepass-worker" }));

/**
 * Pub/Sub push endpoint.
 * Cloud Pub/Sub sends a POST with:
 *   { message: { data: "<base64-encoded-json>", messageId: "...", publishTime: "..." } }
 */
app.post("/tasks/process-content", async (req, res) => {
  let payload: any;
  try {
    // Decode the Pub/Sub message
    const envelope = req.body;
    if (envelope?.message?.data) {
      const decoded = Buffer.from(envelope.message.data, "base64").toString("utf8");
      payload = JSON.parse(decoded);
    } else {
      // Direct POST for testing
      payload = req.body;
    }

    if (!payload?.contentId) {
      console.error("[worker] Missing contentId in payload");
      return res.status(400).json({ error: "Missing contentId" });
    }

    console.log(`[worker] Processing content: ${payload.contentId}`);

    // Process async — return 200 immediately so Pub/Sub doesn't retry
    res.status(200).json({ status: "accepted", contentId: payload.contentId });

    // Now do the actual work
    await processContent(payload);
  } catch (err: any) {
    console.error("[worker] Handler error:", err);
    // If we haven't responded yet, do so
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`[stagepass-worker] Listening on port ${PORT}`);
});
