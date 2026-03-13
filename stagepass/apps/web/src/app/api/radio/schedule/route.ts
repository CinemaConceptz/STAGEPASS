import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// GET /api/radio/schedule?stationId=xxx — fetch schedule
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
    return NextResponse.json({
      success: true,
      schedule: data.schedule || [],
      autoDj: {
        enabled: data.autoDjEnabled !== false,
        shuffle: data.autoDjShuffle || false,
        crossfadeEnabled: data.crossfadeEnabled ?? false,
        crossfadeDuration: data.crossfadeDuration ?? 3,
        moodFilter: data.moodFilter ?? [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/radio/schedule — save schedule
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stationId, userId, schedule, autoDjEnabled, autoDjShuffle, crossfadeEnabled, crossfadeDuration, moodFilter } = body;

    if (!stationId || !userId) {
      return NextResponse.json({ error: "Missing stationId or userId" }, { status: 400 });
    }

    const db = getFirestore(adminApp);
    const stationRef = db.collection("radioStations").doc(stationId);
    const stationSnap = await stationRef.get();

    if (!stationSnap.exists) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    if (stationSnap.data()?.ownerUid !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await stationRef.update({
      schedule: schedule || [],
      autoDjEnabled: autoDjEnabled !== false,
      autoDjShuffle: autoDjShuffle || false,
      crossfadeEnabled: crossfadeEnabled ?? false,
      crossfadeDuration: crossfadeDuration ?? 3,
      moodFilter: moodFilter ?? [],
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
