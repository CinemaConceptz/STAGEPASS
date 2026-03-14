"use client";

import { getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

// Register the service worker and get FCM token
export async function registerFCMToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const sw = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(getApp());
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw });
    return token || null;
  } catch (err) {
    console.warn("[FCM] Registration failed:", err);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === "undefined") return () => {};
  try {
    const messaging = getMessaging(getApp());
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
