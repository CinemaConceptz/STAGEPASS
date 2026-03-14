// STAGEPASS — Firebase Cloud Messaging Service Worker
// This file MUST be at the root of the public directory

importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0",
  authDomain: "stagepass-live-v1.firebaseapp.com",
  projectId: "stagepass-live-v1",
  storageBucket: "stagepass-live-v1.firebasestorage.app",
  messagingSenderId: "1005750289786",
  appId: "1:1005750289786:web:b77c70ef474707640d02c3",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification || {};
  self.registration.showNotification(title || "STAGEPASS", {
    body: body || "",
    icon: icon || "/icon.png",
    badge: "/badge.png",
    data: { click_action: click_action || "/" },
    actions: [{ action: "open", title: "View" }],
  });
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.click_action || "/";
  event.waitUntil(clients.openWindow(url));
});
