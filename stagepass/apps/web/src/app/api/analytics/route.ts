import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(auth.split("Bearer ")[1]);
    uid = decoded.uid;
  } catch { return NextResponse.json({ error: "Invalid token" }, { status: 401 }); }

  const db = getFirestore(adminApp);

  const [contentSnap, followsSnap, liveSnap] = await Promise.all([
    db.collection("content").where("creatorId", "==", uid).get(),
    db.collection("follows").where("creatorId", "==", uid).get(),
    db.collection("liveChannels").where("ownerUid", "==", uid).get(),
  ]);

  const contents = contentSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  const totalViews = contents.reduce((s, c) => s + (c.viewCount || 0), 0);

  // Top performing content
  const topContent = [...contents]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  return NextResponse.json({
    totalContent: contents.length,
    totalViews,
    followers: followsSnap.size,
    totalStreams: liveSnap.size,
    topContent,
    recentContent: contents.slice(0, 10),
  });
}
