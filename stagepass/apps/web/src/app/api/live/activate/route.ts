import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// POST /api/live/activate — manually registers / refreshes a stream in Firestore
// Useful when the session was created but the Firestore write failed, or the doc is stale
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { channelId, title, playbackUrl, action } = await req.json();
    if (!channelId) {
      return NextResponse.json({ error: "channelId required" }, { status: 400 });
    }

    const db = getFirestore(adminApp);

    // Handle stream end
    if (action === "END") {
      await db.collection("liveChannels").doc(channelId).set({
        status: "ENDED",
        endedAt: new Date().toISOString(),
      }, { merge: true });
      return NextResponse.json({ success: true, status: "ENDED" });
    }

    if (!playbackUrl) {
      return NextResponse.json({ error: "playbackUrl required for activation" }, { status: 400 });
    }

    await db.collection("liveChannels").doc(channelId).set({
      channelId,
      ownerUid: uid,
      title: title || "Live Stream",
      status: "LIVE",
      playbackUrl,
      startedAt: new Date().toISOString(),
      listenerCount: 0,
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
