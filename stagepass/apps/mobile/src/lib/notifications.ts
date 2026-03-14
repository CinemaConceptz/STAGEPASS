// STAGEPASS Mobile — Push Notifications via Expo Notifications
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://stagepass-web-[YOUR-HASH]-uc.a.run.app";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(idToken: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[FCM] Push notifications require a physical device");
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[FCM] Permission not granted");
    return null;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("stagepass-main", {
      name: "STAGEPASS",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00FFB2",
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = pushToken.data;

    // Register token with STAGEPASS backend
    await fetch(`${API_URL}/api/fcm/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ fcmToken: token, platform: Platform.OS }),
    });

    console.log("[FCM] Push token registered:", token.slice(0, 20) + "...");
    return token;
  } catch (err) {
    console.error("[FCM] Failed to get push token:", err);
    return null;
  }
}

// Set up notification response listener (tap on notification → navigate)
export function setupNotificationListeners(onNotification: (notification: any) => void) {
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotification(response.notification.request.content.data);
  });

  return () => Notifications.removeNotificationSubscription(responseListener);
}
