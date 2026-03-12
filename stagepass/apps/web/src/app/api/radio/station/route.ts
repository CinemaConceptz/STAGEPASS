import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      stationId,
      userId,
      stationName,
      genre,
      description,
      driveFileId,
      driveFileName,
    } = body;

    if (!stationId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing stationId or userId" },
        { status: 400 }
      );
    }

    const db = getFirestore(adminApp);

    const stationData = {
      stationId,
      ownerUid: userId,
      name: stationName || "My Station",
      genre: genre || "Other",
      description: description || "",
      driveFileId: driveFileId || null,
      driveFileName: driveFileName || null,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("radioStations").doc(stationId).set(stationData, { merge: true });

    return NextResponse.json({ success: true, stationId });
  } catch (error: any) {
    console.error("Radio station error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
