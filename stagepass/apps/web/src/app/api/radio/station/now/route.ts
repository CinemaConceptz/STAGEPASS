import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { getNowPlaying, Track } from "@/lib/radio/scheduler";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    if (!stationId) return NextResponse.json({ error: "Missing stationId" }, { status: 400 });

    // 1. Fetch Station Playlist
    // Note: In a real high-scale app, cache this in Redis/Memory
    const stationRef = doc(db, "radioStations", stationId);
    const snap = await getDoc(stationRef);
    
    if (!snap.exists()) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const data = snap.data();
    const tracks: Track[] = data.tracks.map((t: any) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      durationMs: t.duration || 180000
    }));

    // 2. Calculate Sync State
    const nowPlaying = getNowPlaying(tracks);

    return NextResponse.json({ success: true, nowPlaying });

  } catch (error: any) {
    console.error("Auto-DJ Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
