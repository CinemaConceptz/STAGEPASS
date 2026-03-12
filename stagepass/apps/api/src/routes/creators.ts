import { Router, Request, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { requireAuth, adminApp } from "../middleware/auth";

export const creatorsRouter = Router();

// POST /creators — create or update a creator profile
creatorsRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const { slug, displayName, bio, type, avatarUrl } = req.body;

  if (!slug || !displayName) return res.status(400).json({ error: "slug and displayName required" });

  const db = getFirestore(adminApp);

  // Check slug uniqueness
  const existing = await db.collection("creators").where("slug", "==", slug).limit(1).get();
  if (!existing.empty && existing.docs[0].id !== uid) {
    return res.status(409).json({ error: "Slug already taken" });
  }

  await db.collection("creators").doc(uid).set(
    {
      uid,
      slug,
      displayName,
      bio: bio || "",
      type: type || "Creator",
      avatarUrl: avatarUrl || null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return res.json({ success: true, slug });
});

// GET /creators/:slug
creatorsRouter.get("/:slug", async (req: Request, res: Response) => {
  const db = getFirestore(adminApp);
  const snap = await db.collection("creators").where("slug", "==", req.params.slug).limit(1).get();
  if (snap.empty) return res.status(404).json({ error: "Creator not found" });
  return res.json({ id: snap.docs[0].id, ...snap.docs[0].data() });
});
