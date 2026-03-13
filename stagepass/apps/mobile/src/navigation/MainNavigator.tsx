import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FeedScreen from "../screens/FeedScreen";
import RadioScreen from "../screens/RadioScreen";
import LiveScreen from "../screens/LiveScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../lib/theme";

const Tab = createBottomTabNavigator();

type IconName = "home" | "home-outline" | "radio" | "radio-outline" | "videocam" | "videocam-outline" | "person" | "person-outline";

const tabIcons: Record<string, { focused: IconName; unfocused: IconName }> = {
  Feed: { focused: "home", unfocused: "home-outline" },
  Radio: { focused: "radio", unfocused: "radio-outline" },
  Live: { focused: "videocam", unfocused: "videocam-outline" },
  Profile: { focused: "person", unfocused: "person-outline" },
};

export default function MainNavigator() {
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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={22} color={color} />;
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
