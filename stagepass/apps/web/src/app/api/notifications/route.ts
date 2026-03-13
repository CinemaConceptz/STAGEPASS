import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getUid(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return (await getAuth(adminApp).verifyIdToken(token)).uid;
  } catch { return null; }
}

// GET — fetch last 20 notifications for current user
export async function GET(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ items: [] });

  const db = getFirestore(adminApp);
  const snap = await db.collection("notifications").doc(uid)
    .collection("items").orderBy("createdAt", "desc").limit(20).get();

  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ items });
}

// POST — mark all notifications as read
export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ success: false });

  const db = getFirestore(adminApp);
  const snap = await db.collection("notifications").doc(uid)
    .collection("items").where("read", "==", false).get();

  if (!snap.empty) {
    const batch = db.batch();
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
  }

  return NextResponse.json({ success: true });
}
