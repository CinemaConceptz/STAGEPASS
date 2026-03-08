"use client";

import { GoogleAuthProvider, linkWithPopup, getAuth } from "firebase/auth";
import { auth } from "./client";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly"
];

export async function connectGoogleDrive() {
  if (!auth.currentUser) throw new Error("No user logged in");

  const provider = new GoogleAuthProvider();
  SCOPES.forEach(scope => provider.addScope(scope));

  try {
    // Link the existing user with Google credentials that have Drive scope
    const result = await linkWithPopup(auth.currentUser, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return credential?.accessToken;
  } catch (error: any) {
    if (error.code === 'auth/credential-already-in-use') {
       // If account already exists, we might need to just re-auth to get the token
       // For MVP, we'll assume the user might need to sign in again or we handle merge logic
       console.warn("Account already linked");
       // In a real app, you'd handle account merging here
    }
    throw error;
  }
}
