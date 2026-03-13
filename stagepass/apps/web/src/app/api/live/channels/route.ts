import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// GET /api/live/channels — Admin SDK query bypasses Firestore security rules & index requirements
export async function GET() {
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("liveChannels")
      .where("status", "==", "LIVE")
      .limit(10)
      .get();

    const channels = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.startedAt > a.startedAt ? 1 : -1));

    return NextResponse.json({ channels });
  } catch (err: any) {
    console.error("[live/channels]", err);
    return NextResponse.json({ channels: [], error: err.message });
  }
}
