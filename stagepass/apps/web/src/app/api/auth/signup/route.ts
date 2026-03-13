import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// POST /api/auth/signup — create user + creator documents after Firebase Auth signup
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { displayName, creatorType, email } = await req.json();
    if (!displayName) {
      return NextResponse.json({ error: "displayName is required" }, { status: 400 });
    }

    const slug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);

    const db = getFirestore(adminApp);

    // Create user document
    await db.collection("users").doc(uid).set({
      uid,
      email: email || decoded.email || "",
      displayName,
      username: slug,
      creatorType: creatorType || "MUSIC",
      roles: ["creator"],
      socialLinks: {},
      driveLinked: false,
      createdAt: new Date().toISOString(),
    });

    // Create creator document
    await db.collection("creators").doc(uid).set({
      uid,
      ownerUid: uid,
      slug,
      displayName,
      type: creatorType || "MUSIC",
      verified: false,
      followerCount: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    console.error("[auth/signup] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
