import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function mapContent(d: FirebaseFirestore.DocumentData, id: string) {
  return {
    id,
    title: d.title || "Untitled",
    type: d.type || "VIDEO",
    status: d.status,
    thumbnail: d.thumbnailUrl || d.thumbnail || null,
    thumbnailUrl: d.thumbnailUrl || d.thumbnail || null,
    creatorId: d.creatorId || d.ownerUid,
    creatorName: d.creatorName || "Unknown",
    creatorSlug: d.creatorSlug || "user",
    playbackUrl: d.playbackUrl || null,
    driveFileId: d.driveFileId || null,
    viewCount: d.viewCount || 0,
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

// GET /api/content/feed?creatorId=xxx&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");
    const limitN = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const db = getFirestore(adminApp);
    let ref: FirebaseFirestore.Query = db.collection("content")
      .orderBy("createdAt", "desc")
      .limit(limitN);

    if (creatorId) {
      ref = db.collection("content")
        .where("creatorId", "==", creatorId)
        .orderBy("createdAt", "desc")
        .limit(limitN);
    }

    const snap = await ref.get();
    const items = snap.docs.map(d => mapContent(d.data(), d.id));

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("[content/feed]", err);
    return NextResponse.json({ items: [], error: err.message });
  }
}
