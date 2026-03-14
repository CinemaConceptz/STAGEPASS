import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getUid(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// GET /api/profile — fetch current user's profile
export async function GET(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getFirestore(adminApp);
    const userSnap = await db.collection("users").doc(uid).get();
    const creatorSnap = await db.collection("creators").doc(uid).get();

    const userData = userSnap.exists ? userSnap.data() : null;
    const creatorData = creatorSnap.exists ? creatorSnap.data() : null;

    return NextResponse.json({
      success: true,
      profile: userData
        ? {
            uid,
            displayName: userData.displayName || "",
            bio: userData.bio || "",
            avatarUrl: userData.avatarUrl || "",
            socialLinks: userData.socialLinks || {},
            driveLinked: userData.driveLinked || false,
            driveLinkedAt: userData.driveLinkedAt || null,
            roles: userData.roles || [],
            isAdmin: (userData.roles || []).includes("admin"),
          }
        : null,
      creator: creatorData
        ? {
            slug: creatorData.slug || "",
            type: creatorData.type || "MUSIC",
            verified: creatorData.verified || false,
            followerCount: creatorData.followerCount || 0,
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/profile — update current user's profile
export async function PUT(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { displayName, bio, avatarUrl, socialLinks, driveLinked, driveLinkedAt } = body;

    const db = getFirestore(adminApp);
    const now = new Date().toISOString();

    // Update users collection
    const userUpdate: Record<string, any> = { updatedAt: now };
    if (displayName !== undefined) userUpdate.displayName = displayName;
    if (bio !== undefined) userUpdate.bio = bio;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (socialLinks !== undefined) userUpdate.socialLinks = socialLinks;
    if (driveLinked !== undefined) userUpdate.driveLinked = driveLinked;
    if (driveLinkedAt !== undefined) userUpdate.driveLinkedAt = driveLinkedAt;
    await db.collection("users").doc(uid).set(userUpdate, { merge: true });

    // Update creators collection
    const creatorUpdate: Record<string, any> = { updatedAt: now };
    if (displayName !== undefined) creatorUpdate.displayName = displayName;
    if (bio !== undefined) creatorUpdate.bio = bio;
    if (avatarUrl !== undefined) creatorUpdate.avatarUrl = avatarUrl;
    await db.collection("creators").doc(uid).set(creatorUpdate, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
