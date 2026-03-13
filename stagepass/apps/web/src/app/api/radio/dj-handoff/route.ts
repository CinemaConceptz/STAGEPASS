import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/radio/dj-handoff
 * Allows a live DJ to take over from Auto-DJ during their scheduled slot.
 *
 * Body: { stationId, action: "TAKE_OVER" | "RELEASE", liveStreamUrl? }
 *
 * When a DJ takes over:
 *   - Sets station.liveDj = { uid, displayName, startedAt, liveStreamUrl }
 *   - Radio page switches from Auto-DJ tracks to the DJ's live stream
 *
 * When a DJ releases:
 *   - Clears station.liveDj
 *   - Radio page switches back to Auto-DJ
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { stationId, action, liveStreamUrl } = await req.json();
    if (!stationId) return NextResponse.json({ error: "Missing stationId" }, { status: 400 });

    const db = getFirestore(adminApp);
    const stationRef = db.collection("radioStations").doc(stationId);
    const stationSnap = await stationRef.get();

    if (!stationSnap.exists) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const stationData = stationSnap.data()!;

    // Verify the user owns this station or is the scheduled DJ
    if (stationData.ownerUid !== uid) {
      // Check if user is scheduled for a show right now
      const schedule = stationData.schedule || [];
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const isScheduledDj = schedule.some((slot: any) => {
        if (slot.day !== dayOfWeek) return false;
        const startMin = (slot.startHour || 0) * 60 + (slot.startMinute || 0);
        const endMin = (slot.endHour || 23) * 60 + (slot.endMinute || 59);
        return currentMinutes >= startMin && currentMinutes <= endMin && slot.djId === uid;
      });

      if (!isScheduledDj) {
        return NextResponse.json({ error: "You are not authorized to DJ on this station right now." }, { status: 403 });
      }
    }

    if (action === "TAKE_OVER") {
      await stationRef.update({
        liveDj: {
          uid,
          displayName: decoded.name || decoded.email?.split("@")[0] || "DJ",
          startedAt: new Date().toISOString(),
          liveStreamUrl: liveStreamUrl || null,
        },
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        status: "LIVE_DJ",
        message: "You are now live on this station. Auto-DJ has been paused.",
      });
    } else if (action === "RELEASE") {
      await stationRef.update({
        liveDj: null,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        status: "AUTO_DJ",
        message: "You've handed back to Auto-DJ.",
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Use TAKE_OVER or RELEASE." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[dj-handoff] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/radio/dj-handoff?stationId=xxx — check current DJ status
export async function GET(req: NextRequest) {
  try {
    const stationId = req.nextUrl.searchParams.get("stationId");
    if (!stationId) return NextResponse.json({ error: "Missing stationId" }, { status: 400 });

    const db = getFirestore(adminApp);
    const snap = await db.collection("radioStations").doc(stationId).get();
    if (!snap.exists) return NextResponse.json({ error: "Station not found" }, { status: 404 });

    const data = snap.data()!;
    return NextResponse.json({
      liveDj: data.liveDj || null,
      isLiveDj: !!data.liveDj,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
