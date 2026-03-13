import { NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getUid(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(auth.split("Bearer ")[1]);
    return decoded.uid;
  } catch { return null; }
}

export async function POST(req: Request, { params }: { params: { creatorId: string } }) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = params;
  if (uid === creatorId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const db = getFirestore(adminApp);
  const followId = `${uid}_${creatorId}`;

  await db.collection("follows").doc(followId).set({ followerId: uid, creatorId, createdAt: new Date().toISOString() });
  await db.collection("creators").doc(creatorId).update({ followerCount: FieldValue.increment(1) }).catch(() => {});

  // Create notification for the creator being followed
  await db.collection("notifications").doc(creatorId).collection("items").add({
    type: "FOLLOW",
    title: "New follower",
    body: "Someone started following your channel.",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, following: true });
}

export async function DELETE(req: Request, { params }: { params: { creatorId: string } }) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = params;
  const db = getFirestore(adminApp);
  const followId = `${uid}_${creatorId}`;

  await db.collection("follows").doc(followId).delete();
  await db.collection("creators").doc(creatorId).update({ followerCount: FieldValue.increment(-1) }).catch(() => {});

  return NextResponse.json({ success: true, following: false });
}
