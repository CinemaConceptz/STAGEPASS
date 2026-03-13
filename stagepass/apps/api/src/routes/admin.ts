import { Router, Request, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { requireAuth, adminApp } from "../middleware/auth";

export const adminRouter = Router();

// POST /admin/claim — allows first-ever user OR env-whitelisted email to become admin
adminRouter.post("/claim", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const email = (req as any).email;
  const db = getFirestore(adminApp);

  try {
    // Check if user is already admin
    const userSnap = await db.collection("users").doc(uid).get();
    if (userSnap.exists && userSnap.data()?.isAdmin) {
      return res.json({ success: true, message: "Already an admin" });
    }

    // Check if any admins already exist
    const existingAdmins = await db.collection("users").where("isAdmin", "==", true).limit(1).get();

    // Allow claim if: no admins exist yet, OR email matches ADMIN_EMAIL env
    const adminEmail = process.env.ADMIN_EMAIL;
    const isFirstAdmin = existingAdmins.empty;
    const isWhitelisted = adminEmail && email && email.toLowerCase() === adminEmail.toLowerCase();

    if (!isFirstAdmin && !isWhitelisted) {
      return res.status(403).json({
        success: false,
        error: "Admin claim not allowed. An admin already exists. Contact the platform administrator.",
      });
    }

    // Grant admin
    await db.collection("users").doc(uid).set({ isAdmin: true }, { merge: true });

    return res.json({
      success: true,
      message: isFirstAdmin ? "Admin claim successful (first admin)" : "Admin claim successful (whitelisted email)",
    });
  } catch (err: any) {
    console.error("[admin] claim error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /admin/status — check if current user is admin
adminRouter.get("/status", requireAuth, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const db = getFirestore(adminApp);
  try {
    const snap = await db.collection("users").doc(uid).get();
    return res.json({ isAdmin: snap.exists && snap.data()?.isAdmin === true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
