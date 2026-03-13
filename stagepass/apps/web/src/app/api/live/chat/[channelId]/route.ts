import { NextRequest, NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    return { uid: decoded.uid, name: decoded.name || decoded.email?.split("@")[0] || "Viewer" };
  } catch {
    return null;
  }
}

// GET /api/live/chat/[channelId] — fetch recent chat messages
export async function GET(req: NextRequest, { params }: { params: { channelId: string } }) {
  try {
    const db = getFirestore(adminApp);
    const snap = await db
      .collection("liveChats")
      .doc(params.channelId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limitToLast(100)
      .get();

    const messages = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        displayName: data.displayName,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ messages: [], error: err.message });
  }
}

// POST /api/live/chat/[channelId] — send a chat message
export async function POST(req: NextRequest, { params }: { params: { channelId: string } }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const db = getFirestore(adminApp);
    const msg = {
      userId: user.uid,
      displayName: user.name,
      text: text.trim().slice(0, 200),
      createdAt: new Date().toISOString(),
    };

    const ref = await db
      .collection("liveChats")
      .doc(params.channelId)
      .collection("messages")
      .add(msg);

    return NextResponse.json({ success: true, message: { id: ref.id, ...msg } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
