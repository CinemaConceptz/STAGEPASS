"use client";

import { GoogleAuthProvider, linkWithPopup, reauthenticateWithPopup } from "firebase/auth";
import { auth } from "./client";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const STORAGE_KEY = "sp_drive_token";
const STORAGE_TS_KEY = "sp_drive_token_ts";

export function getStoredDriveToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const ts = parseInt(localStorage.getItem(STORAGE_TS_KEY) || "0", 10);
    if (Date.now() - ts > 50 * 60 * 1000) return null; // expired > 50 min
    return localStorage.getItem(STORAGE_KEY);
  } catch { return null; }
}

export function storeDriveToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(STORAGE_TS_KEY, Date.now().toString());
  } catch { /* no-op */ }
}

export async function connectGoogleDrive() {
  if (!auth.currentUser) throw new Error("No user logged in");

  const provider = new GoogleAuthProvider();
  SCOPES.forEach(scope => provider.addScope(scope));

  const isLinked = auth.currentUser.providerData.some(
    (p: { providerId: string }) => p.providerId === "google.com"
  );

  try {
    let result;
    if (isLinked) {
      result = await reauthenticateWithPopup(auth.currentUser, provider);
    } else {
      result = await linkWithPopup(auth.currentUser, provider);
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (token) storeDriveToken(token); // persist for radio playback
    return token;
  } catch (error: any) {
    if (error.code === "auth/credential-already-in-use") {
      throw new Error("This Google Account is already connected to another user. Please log out and sign in with Google.");
    }
    throw error;
  }
}

