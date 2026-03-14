import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FeedScreen from "../screens/FeedScreen";
import RadioScreen from "../screens/RadioScreen";
import LiveScreen from "../screens/LiveScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../lib/theme";
import { auth } from "../lib/firebase";
import { registerForPushNotifications, setupNotificationListeners } from "../lib/notifications";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

type IconName = "home" | "home-outline" | "radio" | "radio-outline" | "videocam" | "videocam-outline" | "person" | "person-outline";
const tabIcons: Record<string, { focused: IconName; unfocused: IconName }> = {
  Feed: { focused: "home", unfocused: "home-outline" },
  Radio: { focused: "radio", unfocused: "radio-outline" },
  Live: { focused: "videocam", unfocused: "videocam-outline" },
  Profile: { focused: "person", unfocused: "person-outline" },
};

export default function MainNavigator() {
  const navigation = useNavigation() as any;

  // Register FCM push notifications once logged in
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    user.getIdToken().then((idToken) => {
      registerForPushNotifications(idToken).catch(() => {});
    });

    // Navigate based on notification tap
    const cleanup = setupNotificationListeners((data) => {
      if (data?.link === "/live") navigation.navigate("Live");
      else if (data?.link?.includes("/content/")) navigation.navigate("Feed");
      else navigation.navigate("Feed");
    });

    return cleanup;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.mutetext,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
        tabBarIcon: ({ focused, color }) => {
          const icons = tabIcons[route.name];
          return <Ionicons name={focused ? icons.focused : icons.unfocused} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Radio" component={RadioScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
