import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";
import { getNowPlaying, getActiveScheduleSlot, Track, ScheduleSlot } from "@/lib/radio/scheduler";

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
      artist: t.artist || "",
      url: t.url,
      durationMs: t.durationMs || t.duration || 180000,
    }));

    const schedule: ScheduleSlot[] = data.schedule || [];
    const autoDjEnabled = data.autoDjEnabled !== false;
    const autoDjShuffle = data.autoDjShuffle || false;

    // Check if a scheduled show is currently active
    const activeSlot = getActiveScheduleSlot(schedule);

    // Get now playing from Auto-DJ
    const nowPlaying = getNowPlaying(tracks, autoDjShuffle);

    return NextResponse.json({
      success: true,
      nowPlaying: nowPlaying ? {
        ...nowPlaying,
        mode: activeSlot ? "SCHEDULED" : autoDjEnabled ? "AUTO_DJ" : "IDLE",
        activeShow: activeSlot ? { name: activeSlot.showName, description: activeSlot.description } : null,
      } : null,
      station: {
        name: data.name,
        genre: data.genre,
        trackCount: tracks.length,
        autoDjEnabled,
        autoDjShuffle,
        hasSchedule: schedule.length > 0,
      },
    });
  } catch (error: any) {
    console.error("Auto-DJ Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
