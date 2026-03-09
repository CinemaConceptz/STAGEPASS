import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client"; // Use admin in prod
import { doc, setDoc } from "firebase/firestore";
import { listAudioFiles } from "@/lib/google/drive-indexer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, stationName, genre, description, driveFolderId, token } = body;

    // 1. Index the folder (find tracks)
    const tracks = await listAudioFiles(token, driveFolderId);

    // 2. Create/Update Station Doc
    const stationData = {
      ownerUid: userId,
      name: stationName,
      genre,
      description,
      driveFolderId,
      trackCount: tracks.length,
      tracks: tracks.map(t => ({
        id: t.id,
        title: t.name,
        url: t.webContentLink, // Note: Direct links expire or have quotas. Better to import.
        duration: 0 // Drive doesn't always give duration easily without probing
      })),
      updatedAt: new Date().toISOString()
    };

    // Store in 'radioStations' collection
    // In prod: use Admin SDK to write
    // For now, we return data for frontend to write if using client SDK, 
    // or we assume this API has admin privs (which it should in Cloud Run).
    // Let's assume we write via client for MVP simplicity or just return success
    
    return NextResponse.json({ success: true, station: stationData });

  } catch (error: any) {
    console.error("Radio Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
