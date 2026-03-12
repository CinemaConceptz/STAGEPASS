import { Router, Request, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { requireAuth, adminApp } from "../middleware/auth";

export const radioRouter = Router();

// POST /radio/stations — create or update a station
radioRouter.post("/stations", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const { stationName, genre, description, audioUrl, driveFileId, driveFileName } = req.body;

  if (!stationName) return res.status(400).json({ error: "stationName is required" });

  const db = getFirestore(adminApp);
  const stationId = uid; // One station per creator for now

  await db.collection("radioStations").doc(stationId).set(
    {
      stationId,
      ownerUid: uid,
      name: stationName,
      genre: genre || "Other",
      description: description || "",
      audioUrl: audioUrl || null,
      driveFileId: driveFileId || null,
      driveFileName: driveFileName || null,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return res.json({ success: true, stationId });
});

// GET /radio/stations/global — list all active stations
radioRouter.get("/stations/global", async (_req: Request, res: Response) => {
  const db = getFirestore(adminApp);
  try {
    const snap = await db
      .collection("radioStations")
      .where("status", "==", "ACTIVE")
      .limit(20)
      .get();
    return res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /radio/stations/:stationId — get one station
radioRouter.get("/stations/:stationId", async (req: Request, res: Response) => {
  const db = getFirestore(adminApp);
  const snap = await db.collection("radioStations").doc(req.params.stationId).get();
  if (!snap.exists) return res.status(404).json({ error: "Station not found" });
  return res.json({ id: snap.id, ...snap.data() });
});

// GET /radio/stations/:stationId/now — now playing (deterministic loop)
radioRouter.get("/stations/:stationId/now", async (req: Request, res: Response) => {
  const db = getFirestore(adminApp);
  const snap = await db.collection("radioStations").doc(req.params.stationId).get();
  if (!snap.exists) return res.status(404).json({ error: "Station not found" });

  const data = snap.data()!;
  const tracks: any[] = data.tracks || [];
  if (tracks.length === 0) return res.json({ nowPlaying: null });

  const now = Date.now();
  const totalDuration = tracks.reduce((sum: number, t: any) => sum + (t.durationMs || 180000), 0);
  const loopPosition = now % totalDuration;

  let elapsed = 0;
  let track = tracks[0];
  let offsetMs = 0;
  for (const t of tracks) {
    const dur = t.durationMs || 180000;
    if (loopPosition < elapsed + dur) { track = t; offsetMs = loopPosition - elapsed; break; }
    elapsed += dur;
  }

  return res.json({ nowPlaying: { track, offsetMs, startTime: now - offsetMs } });
});
