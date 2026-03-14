import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { adminApp } from "./admin";

interface NotifPayload {
  title: string;
  body: string;
  link?: string;
  type?: string;
  imageUrl?: string;
}

// Save notification to Firestore AND send FCM push if token available
export async function sendNotification(toUid: string, payload: NotifPayload) {
  const db = getFirestore(adminApp);
  const now = new Date().toISOString();

  // 1. Store in Firestore notifications
  await db.collection("notifications").doc(toUid).collection("items").add({
    ...payload,
    read: false,
    createdAt: now,
  });

  // 2. Send FCM push if token available
  try {
    const userSnap = await db.collection("users").doc(toUid).get();
    const fcmToken = userSnap.data()?.latestFcmToken;
    if (!fcmToken) return;

    const messaging = getMessaging(adminApp);
    await messaging.send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      },
      webpush: payload.link ? {
        fcmOptions: { link: payload.link },
        notification: {
          title: payload.title,
          body: payload.body,
          click_action: payload.link,
        },
      } : undefined,
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      android: {
        notification: {
          sound: "default",
          clickAction: payload.link || "/",
          channelId: "stagepass-main",
        },
      },
    });
  } catch (fcmErr: any) {
    // FCM send failure is non-fatal — notification is already in Firestore
    console.warn("[sendNotification] FCM send failed (non-fatal):", fcmErr.message);
  }
}
