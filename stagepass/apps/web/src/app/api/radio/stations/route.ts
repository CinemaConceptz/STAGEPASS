import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// GET /api/radio/stations — Admin SDK fetch bypasses Firestore security rules
export async function GET(req: NextRequest) {
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("radioStations").orderBy("createdAt", "desc").limit(20).get();
    const stations = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        genre: data.genre,
        description: data.description || "",
        artworkUrl: data.artworkUrl || null,
        ownerUid: data.ownerUid,
        ownerSlug: data.ownerSlug || "",
        ownerName: data.ownerName || "",
        featured: data.featured || false,
        listenerCount: data.listenerCount || 0,
        trackCount: (data.tracks || []).length,
        schedule: data.schedule || [],
        autoDjEnabled: data.autoDjEnabled !== false,
        autoDjShuffle: data.autoDjShuffle || false,
        crossfadeEnabled: data.crossfadeEnabled || false,
        crossfadeDuration: data.crossfadeDuration || 3,
        moodFilter: data.moodFilter || [],
      };
    });
    return NextResponse.json({ stations });
  } catch (err: any) {
    console.error("[radio/stations]", err);
    return NextResponse.json({ stations: [], error: err.message });
  }
}
