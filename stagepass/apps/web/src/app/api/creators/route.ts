import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// GET /api/creators?slug=xxx
export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const db = getFirestore(adminApp);
    const snap = await db.collection("creators").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return NextResponse.json({ creator: null });

    const d = snap.docs[0].data();
    return NextResponse.json({
      creator: {
        uid: snap.docs[0].id,
        slug: d.slug,
        displayName: d.displayName || slug,
        bio: d.bio || "",
        avatarUrl: d.avatarUrl || null,
        type: d.type || "CREATOR",
        followerCount: d.followerCount || 0,
        isAdmin: d.isAdmin || false,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
