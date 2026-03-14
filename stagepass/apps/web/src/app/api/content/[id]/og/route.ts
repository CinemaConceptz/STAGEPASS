import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// /api/content/[id]/og — Returns OG meta JSON for use by social crawlers
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("content").doc(params.id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const d = snap.data()!;
    return NextResponse.json({
      id: params.id,
      title: d.title || "Untitled Premiere",
      description: `Watch "${d.title}" by ${d.creatorName || "a creator"} on STAGEPASS`,
      creatorName: d.creatorName || "",
      thumbnail: d.thumbnailUrl || null,
      url: `https://stagepassaccess.com/content/${params.id}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
