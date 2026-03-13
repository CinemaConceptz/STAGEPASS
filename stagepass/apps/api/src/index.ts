import express from "express";
import cors from "cors";
import { contentRouter } from "./routes/content";
import { liveRouter } from "./routes/live";
import { radioRouter } from "./routes/radio";
import { butlerRouter } from "./routes/butler";
import { creatorsRouter } from "./routes/creators";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "stagepass-api" }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/content", contentRouter);
app.use("/live", liveRouter);
app.use("/radio", radioRouter);
app.use("/butler", butlerRouter);
app.use("/creators", creatorsRouter);
app.use("/admin", adminRouter);

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API Error]", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[stagepass-api] Listening on port ${PORT}`);
});

export default app;
