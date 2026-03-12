"use client";

import { GoogleAuthProvider, linkWithPopup, reauthenticateWithPopup } from "firebase/auth";
import { auth } from "./client";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly"
];

export async function connectGoogleDrive() {
  if (!auth.currentUser) throw new Error("No user logged in");

  const provider = new GoogleAuthProvider();
  SCOPES.forEach(scope => provider.addScope(scope));

  // Check if already linked
  const isLinked = auth.currentUser.providerData.some(
    (p: { providerId: string }) => p.providerId === "google.com"
  );

  try {
    let result;
    if (isLinked) {
      // If already linked, re-authenticate to refresh/get the token with scopes
      console.log("Account already linked, refreshing token...");
      result = await reauthenticateWithPopup(auth.currentUser, provider);
    } else {
      // First time linking
      console.log("Linking new Google account...");
      result = await linkWithPopup(auth.currentUser, provider);
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    return credential?.accessToken;
  } catch (error: any) {
    if (error.code === 'auth/credential-already-in-use') {
       throw new Error("This Google Account is already connected to another user. Please log out and sign in with Google.");
    }
    throw error;
  }
}
