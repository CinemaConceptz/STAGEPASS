import { Router, Request, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { Storage } from "@google-cloud/storage";
import { requireAuth, adminApp } from "../middleware/auth";

export const contentRouter = Router();
const TOPIC = "stagepass-content-process";
const BUCKET = process.env.GCS_BUCKET || "stagepass-live-v1.firebasestorage.app";

// POST /content/import-drive — queue a Drive file for processing
contentRouter.post("/import-drive", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const { fileId, fileName, title, driveToken, creatorSlug } = req.body;

  if (!fileId || !driveToken) {
    return res.status(400).json({ error: "fileId and driveToken are required" });
  }

  const db = getFirestore(adminApp);
  const contentId = `content-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const processedPath = `processed/${contentId}`;

  // Get creator info
  const creatorSnap = await db.collection("creators").doc(uid).get();
  const creator = creatorSnap.data();

  const record = {
    id: contentId,
    title: title || fileName?.replace(/\.[^/.]+$/, "") || "Untitled",
    type: "VIDEO",
    status: "QUEUED",
    ownerUid: uid,
    creatorId: uid,
    creatorName: creator?.displayName || "Creator",
    creatorSlug: creator?.slug || creatorSlug || "user",
    driveFileId: fileId,
    bucket: BUCKET,
    processedPath,
    thumbnailUrl: `https://storage.googleapis.com/${BUCKET}/${processedPath}/thumbnail.jpeg`,
    playbackUrl: `https://storage.googleapis.com/${BUCKET}/${processedPath}/manifest.m3u8`,
    createdAt: new Date().toISOString(),
  };

  await db.collection("content").doc(contentId).set(record);

  // Publish to Pub/Sub
  try {
    const pubsub = new PubSub({ projectId: process.env.FIREBASE_PROJECT_ID });
    await pubsub.topic(TOPIC).publishMessage({
      data: Buffer.from(JSON.stringify({
        contentId,
        driveFileId: fileId,
        driveToken,
        userId: uid,
        bucket: BUCKET,
        processedPath,
        rawPath: `uploads/${contentId}.mp4`,
      })),
    });
  } catch (err: any) {
    console.warn("[content] Pub/Sub publish failed:", err.message);
  }

  return res.json({ success: true, contentId, message: "Content queued for processing." });
});

// GET /content/signed-upload — mint a signed URL for direct browser upload
contentRouter.get("/signed-upload", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const { fileName, mimeType } = req.query as { fileName: string; mimeType: string };

  const contentId = `content-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const rawPath = `uploads/${contentId}/${fileName || "video.mp4"}`;

  const storage = new Storage();
  const [url] = await storage.bucket(BUCKET).file(rawPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: mimeType || "video/mp4",
  });

  return res.json({ success: true, contentId, rawPath, signedUrl: url });
});

// GET /content/:id
contentRouter.get("/:id", async (req: Request, res: Response) => {
  const db = getFirestore(adminApp);
  const snap = await db.collection("content").doc(req.params.id).get();
  if (!snap.exists) return res.status(404).json({ error: "Not found" });
  const d = snap.data()!;
  // Don't expose internal fields
  const { driveToken, ...safe } = d as any;
  return res.json(safe);
});

// GET /content/feed/recent
contentRouter.get("/feed/recent", async (_req: Request, res: Response) => {
  const db = getFirestore(adminApp);
  const snap = await db
    .collection("content")
    .where("status", "==", "READY")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();
  return res.json(snap.docs.map(d => {
    const { driveToken, ...safe } = d.data() as any;
    return { id: d.id, ...safe };
  }));
});
