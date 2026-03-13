import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(adminApp);
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email || "";

    const db = getFirestore(adminApp);

    // Check if already admin
    const userSnap = await db.collection("users").doc(uid).get();
    if (userSnap.exists && userSnap.data()?.isAdmin) {
      return NextResponse.json({ success: true, message: "Already an admin" });
    }

    // Allow if: no admins exist yet, OR email matches ADMIN_EMAIL env
    const existingAdmins = await db.collection("users").where("isAdmin", "==", true).limit(1).get();
    const adminEmail = process.env.ADMIN_EMAIL || "";
    const isFirstAdmin = existingAdmins.empty;
    const isWhitelisted = adminEmail && email.toLowerCase() === adminEmail.toLowerCase();

    if (!isFirstAdmin && !isWhitelisted) {
      return NextResponse.json(
        { success: false, error: "An admin already exists. Ask your platform administrator to grant access." },
        { status: 403 }
      );
    }

    await db.collection("users").doc(uid).set({ isAdmin: true }, { merge: true });

    return NextResponse.json({
      success: true,
      message: isFirstAdmin ? "You are now the first admin!" : "Admin access granted.",
    });
  } catch (err: any) {
    console.error("[admin/claim]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
