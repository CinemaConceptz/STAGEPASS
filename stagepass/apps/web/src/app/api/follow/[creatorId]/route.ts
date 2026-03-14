import { NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";
import { sendNotification } from "@/lib/firebase/sendNotification";

export const dynamic = "force-dynamic";

async function getUid(req: Request): Promise<{ uid: string; name?: string } | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(auth.split("Bearer ")[1]);
    return { uid: decoded.uid, name: decoded.name || "Someone" };
  } catch { return null; }
}

export async function GET(req: Request, { params }: { params: { creatorId: string } }) {
  const user = await getUid(req);
  if (!user) return NextResponse.json({ following: false, followerCount: 0 });

  const { creatorId } = params;
  const db = getFirestore(adminApp);

  const [followSnap, creatorSnap] = await Promise.all([
    db.collection("follows").doc(`${user.uid}_${creatorId}`).get(),
    db.collection("creators").doc(creatorId).get(),
  ]);

  return NextResponse.json({
    following: followSnap.exists,
    followerCount: creatorSnap.data()?.followerCount || 0,
  });
}

export async function POST(req: Request, { params }: { params: { creatorId: string } }) {
  const user = await getUid(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = params;
  if (user.uid === creatorId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const db = getFirestore(adminApp);
  const followId = `${user.uid}_${creatorId}`;

  await db.collection("follows").doc(followId).set({
    followerId: user.uid,
    creatorId,
    createdAt: new Date().toISOString(),
  });

  // Use set+merge so it works even if the creator doc doesn't exist yet
  await db.collection("creators").doc(creatorId).set(
    { followerCount: FieldValue.increment(1) },
    { merge: true }
  );

  // Send FCM push notification to the creator
  await sendNotification(creatorId, {
    type: "FOLLOW",
    title: "New follower",
    body: `${user.name || "Someone"} started following your channel.`,
    link: "/studio/analytics",
  }).catch(() => {});

  return NextResponse.json({ success: true, following: true });
}

export async function DELETE(req: Request, { params }: { params: { creatorId: string } }) {
  const user = await getUid(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = params;
  const db = getFirestore(adminApp);

  await db.collection("follows").doc(`${user.uid}_${creatorId}`).delete();
  await db.collection("creators").doc(creatorId).set(
    { followerCount: FieldValue.increment(-1) },
    { merge: true }
  );

  return NextResponse.json({ success: true, following: false });
}
