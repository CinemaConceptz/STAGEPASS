import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const db = getFirestore(adminApp);
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const roles = userSnap.data()?.roles || [];
    if (!roles.includes("admin")) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

// GET /api/admin/stats — fetch platform stats (admin only)
export async function GET(req: NextRequest) {
  const uid = await verifyAdmin(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getFirestore(adminApp);
    const [usersSnap, contentSnap, stationsSnap, liveSnap] = await Promise.all([
      db.collection("users").limit(500).get(),
      db.collection("content").orderBy("createdAt", "desc").limit(50).get(),
      db.collection("radioStations").get(),
      db.collection("liveChannels").get(),
    ]);

    const recentContent = contentSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "Untitled",
        creatorName: data.creatorName || "Unknown",
        status: data.status || "UNKNOWN",
        viewCount: data.viewCount || 0,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({
      totalUsers: usersSnap.size,
      totalContent: contentSnap.size,
      totalStations: stationsSnap.size,
      totalLiveSessions: liveSnap.size,
      recentContent,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/stats — update content status (admin only)
export async function PUT(req: NextRequest) {
  const uid = await verifyAdmin(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { contentId, status } = await req.json();
    if (!contentId || !status) return NextResponse.json({ error: "Missing contentId or status" }, { status: 400 });

    const db = getFirestore(adminApp);
    await db.collection("content").doc(contentId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
