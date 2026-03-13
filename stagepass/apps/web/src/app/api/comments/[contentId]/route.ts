import { NextRequest, NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getUid(req: NextRequest): Promise<{ uid: string; name: string } | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    return { uid: decoded.uid, name: decoded.name || decoded.email?.split("@")[0] || "User" };
  } catch {
    return null;
  }
}

// GET /api/comments/[contentId] — fetch comments for a content item
export async function GET(req: NextRequest, { params }: { params: { contentId: string } }) {
  try {
    const db = getFirestore(adminApp);
    const snap = await db
      .collection("comments")
      .where("contentId", "==", params.contentId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const comments = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        text: data.text,
        userId: data.userId,
        displayName: data.displayName,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ comments: [], error: err.message });
  }
}

// POST /api/comments/[contentId] — add a comment
export async function POST(req: NextRequest, { params }: { params: { contentId: string } }) {
  const user = await getUid(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

    const db = getFirestore(adminApp);
    const comment = {
      contentId: params.contentId,
      userId: user.uid,
      displayName: user.name,
      text: text.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("comments").add(comment);

    // Increment comment count on the content document
    await db
      .collection("content")
      .doc(params.contentId)
      .update({ commentCount: FieldValue.increment(1) })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      comment: { id: ref.id, ...comment },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
