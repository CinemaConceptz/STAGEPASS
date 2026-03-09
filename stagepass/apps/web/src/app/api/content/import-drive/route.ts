import { NextResponse } from "next/server";
import { transferFileFromDrive } from "@/lib/google/storage";
import { createTranscodeJob } from "@/lib/google/transcoder";
import { db } from "@/lib/firebase/client"; // Use server-admin if possible, but client sdk works for now
// In real prod, use firebase-admin for backend writes to bypass client rules limits

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, title, token, userId } = body;

    if (!token || !fileId) {
      return NextResponse.json({ error: "Missing token or fileId" }, { status: 400 });
    }

    // 1. Define paths
    const fileName = `${fileId}.mp4`; // Simplify extension logic for MVP
    const rawPath = `uploads/${fileName}`;
    const processedPath = `processed/${fileId}/`;

    // 2. Start Transfer (Drive -> GCS)
    // Note: In serverless, we await this. For big files, use Cloud Tasks.
    // For MVP/Demo, we assume files < 500MB or container stays alive.
    const gcsUri = await transferFileFromDrive(token, fileId, rawPath);

    // 3. Start Transcode Job
    // The bucket name needs to be dynamic or configured. 
    // The previous step returned the full gs:// uri.
    // We need a separate output bucket or folder.
    
    // Construct Output URI (assuming same bucket for simplicity, or separate)
    // Fix: We need the bucket name from the import step to be correct.
    const outputBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-raw-media-prod";
    const outputUri = `gs://${outputBucket}/${processedPath}`;

    // Trigger Job
    const jobName = await createTranscodeJob(gcsUri as string, outputUri);

    return NextResponse.json({ 
      success: true, 
      jobName, 
      message: "Transfer and Transcode started." 
    });

  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
