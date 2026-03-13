import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0",
  authDomain: "stagepass-live-v1.firebaseapp.com",
  projectId: "stagepass-live-v1",
  storageBucket: "stagepass-live-v1.firebasestorage.app",
  messagingSenderId: "1005750289786",
  appId: "1:1005750289786:web:b77c70ef474707640d02c3",
};

const app = initializeApp(firebaseConfig);

// Use AsyncStorage for auth persistence on React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
