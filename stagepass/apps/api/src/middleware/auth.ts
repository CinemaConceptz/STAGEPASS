import { Request, Response, NextFunction } from "express";
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin once
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const adminApp =
  getApps().length > 0
    ? getApps()[0]!
    : initializeApp(
        projectId && clientEmail && privateKey
          ? { credential: cert({ projectId, clientEmail, privateKey }) }
          : { credential: applicationDefault() }
      );

/** Verifies Bearer token and attaches uid + email to req */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const token = auth.split("Bearer ")[1];
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    (req as any).uid = decoded.uid;
    (req as any).email = decoded.email;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
