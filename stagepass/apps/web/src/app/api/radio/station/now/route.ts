import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";
import { getNowPlaying, Track } from "@/lib/radio/scheduler";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    if (!stationId) {
      return NextResponse.json({ error: "Missing stationId" }, { status: 400 });
    }

    const db = getFirestore(adminApp);
    const snap = await db.collection("radioStations").doc(stationId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const data = snap.data()!;
    const tracks: Track[] = (data.tracks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      durationMs: t.duration || 180000,
    }));

    const nowPlaying = getNowPlaying(tracks);

    return NextResponse.json({ success: true, nowPlaying });
  } catch (error: any) {
    console.error("Auto-DJ Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
