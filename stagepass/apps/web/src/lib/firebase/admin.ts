import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let adminApp: ReturnType<typeof initializeApp>;

if (getApps().length > 0) {
  adminApp = getApps()[0]!;
} else {
  try {
    if (projectId && clientEmail && privateKey) {
      console.log("[admin] Initializing with service account cert for project:", projectId);
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      console.log("[admin] Initializing with Application Default Credentials. Project:", projectId || "auto-detect");
      adminApp = initializeApp({
        credential: applicationDefault(),
        ...(projectId ? { projectId } : {}),
      });
    }
    console.log("[admin] Firebase Admin SDK initialized successfully");
  } catch (err: any) {
    console.error("[admin] CRITICAL: Firebase Admin SDK failed to initialize:", err.message);
    // Initialize with ADC as last resort
    adminApp = initializeApp({
      credential: applicationDefault(),
    });
  }
}

export { adminApp };
