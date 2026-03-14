import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { fcmToken, platform = "web" } = await req.json();
    if (!fcmToken) return NextResponse.json({ success: false, error: "fcmToken required" }, { status: 400 });

    const db = getFirestore(adminApp);
    // Store the FCM token under users/{uid}/fcmTokens collection
    await db.collection("users").doc(uid)
      .collection("fcmTokens")
      .doc(fcmToken.slice(-20)) // Use last 20 chars as doc ID to avoid duplicates
      .set({ token: fcmToken, platform, updatedAt: new Date().toISOString() });

    // Also update user doc with latest token for easy access
    await db.collection("users").doc(uid).set(
      { latestFcmToken: fcmToken, notificationsEnabled: true },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[fcm/register]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
