import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// GET /api/health — verify backend connectivity
export async function GET() {
  const checks: Record<string, string> = {};

  // Check 1: Admin SDK initialized
  try {
    const name = adminApp.name;
    checks.adminSdk = `OK (${name})`;
  } catch (e: any) {
    checks.adminSdk = `FAIL: ${e.message}`;
  }

  // Check 2: Firestore connectivity
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("users").limit(1).get();
    checks.firestore = `OK (${snap.size} docs sampled)`;
  } catch (e: any) {
    checks.firestore = `FAIL: ${e.message}`;
  }

  // Check 3: Environment variables
  checks.projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NOT SET";
  checks.gcsBucket = process.env.GCS_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "NOT SET";
  checks.workerUrl = process.env.WORKER_SERVICE_URL || "NOT SET";
  checks.hasGoogleApiKey = (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes("dummy")) ? "YES" : "NO";

  const allOk = checks.adminSdk.startsWith("OK") && checks.firestore.startsWith("OK");

  return NextResponse.json({
    status: allOk ? "HEALTHY" : "DEGRADED",
    checks,
    timestamp: new Date().toISOString(),
  });
}
