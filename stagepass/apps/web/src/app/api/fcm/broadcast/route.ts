import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// POST /api/fcm/broadcast — Send a push to all followers (admin or system use)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { title, body, link, targetUids } = await req.json();
    if (!title || !body) return NextResponse.json({ error: "title and body required" }, { status: 400 });

    const db = getFirestore(adminApp);
    const messaging = getMessaging(adminApp);

    // Get FCM tokens for target UIDs
    let uidsToNotify: string[] = [];

    if (targetUids && Array.isArray(targetUids)) {
      uidsToNotify = targetUids;
    } else {
      // Notify all followers of the sender
      const followsSnap = await db.collection("follows")
        .where("creatorId", "==", uid)
        .limit(500)
        .get();
      uidsToNotify = followsSnap.docs.map(d => d.data().followerId);
    }

    if (uidsToNotify.length === 0) return NextResponse.json({ success: true, sent: 0 });

    // Fetch FCM tokens in batches
    const tokenDocs = await Promise.all(
      uidsToNotify.map(u => db.collection("users").doc(u).get())
    );

    const fcmTokens = tokenDocs
      .map(d => d.data()?.latestFcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return NextResponse.json({ success: true, sent: 0, note: "No FCM tokens found" });

    // Send multicast message
    const response = await messaging.sendEachForMulticast({
      tokens: fcmTokens.slice(0, 500),
      notification: { title, body },
      webpush: link ? { fcmOptions: { link } } : undefined,
    });

    return NextResponse.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (err: any) {
    console.error("[fcm/broadcast]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
