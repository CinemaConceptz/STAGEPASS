import { Storage } from "@google-cloud/storage";
import { TranscoderServiceClient } from "@google-cloud/video-transcoder";
import { google } from "googleapis";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Readable } from "stream";

// ─── Firebase Admin ──────────────────────────────────────────────────────────
const projectId = process.env.FIREBASE_PROJECT_ID || "stagepass-live-v1";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const adminApp =
  getApps().length > 0
    ? getApps()[0]!
    : initializeApp(
        projectId && clientEmail && privateKey
          ? { credential: cert({ projectId, clientEmail, privateKey }) }
          : { credential: applicationDefault() }
      );

const db = getFirestore(adminApp);
const storage = new Storage();
const transcoderClient = new TranscoderServiceClient();
const LOCATION = "us-central1";

// ─── Status helpers ──────────────────────────────────────────────────────────
async function setStatus(contentId: string, status: string, extra: object = {}) {
  await db.collection("content").doc(contentId).update({ status, ...extra, updatedAt: new Date().toISOString() });
  console.log(`[worker] ${contentId} → ${status}`);
}

// ─── Main processor ──────────────────────────────────────────────────────────
export async function processContent(payload: {
  contentId: string;
  driveFileId: string;
  driveToken: string;
  userId: string;
  bucket: string;
  processedPath: string;
  rawPath: string;
}) {
  const { contentId, driveFileId, driveToken, bucket, processedPath, rawPath } = payload;

  try {
    await setStatus(contentId, "INGESTING");

    // Step 1 ── Download from Google Drive → GCS raw bucket
    const gcsInputUri = await transferDriveToGCS(driveToken, driveFileId, bucket, rawPath);
    console.log(`[worker] Uploaded to GCS: ${gcsInputUri}`);

    await setStatus(contentId, "TRANSCODING");

    // Step 2 ── Run Transcoder API job (GCS → HLS)
    const outputUri = `gs://${bucket}/${processedPath}/`;
    const jobName = await startTranscodeJob(gcsInputUri, outputUri);
    console.log(`[worker] Transcoder job started: ${jobName}`);

    // Step 3 ── Poll Transcoder job until SUCCEEDED or FAILED
    await pollTranscodeJob(jobName);

    // Step 4 ── Mark content as READY
    const playbackUrl = `https://storage.googleapis.com/${bucket}/${processedPath}/manifest.m3u8`;
    const thumbnailUrl = `https://storage.googleapis.com/${bucket}/${processedPath}/thumbnail.jpeg`;

    await setStatus(contentId, "READY", { playbackUrl, thumbnailUrl });
    console.log(`[worker] Content READY: ${contentId}`);

    // Step 5 ── Make processed objects publicly readable
    try {
      await storage.bucket(bucket).file(`${processedPath}/manifest.m3u8`).makePublic();
      const [files] = await storage.bucket(bucket).getFiles({ prefix: processedPath });
      await Promise.all(files.map(f => f.makePublic().catch(() => {})));
    } catch (publicErr) {
      console.warn("[worker] Could not make files public (may need bucket ACL):", publicErr);
    }
  } catch (err: any) {
    console.error(`[worker] Processing failed for ${contentId}:`, err);
    await setStatus(contentId, "FAILED", { error: err.message }).catch(() => {});
  }
}

// ─── Drive → GCS ─────────────────────────────────────────────────────────────
async function transferDriveToGCS(
  accessToken: string,
  fileId: string,
  bucket: string,
  destPath: string
): Promise<string> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth });

  const meta = await drive.files.get({ fileId, fields: "mimeType,name,size" });
  const mimeType = meta.data.mimeType || "video/mp4";

  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });

  const gcsFile = storage.bucket(bucket).file(destPath);
  const writeStream = gcsFile.createWriteStream({
    metadata: { contentType: mimeType },
    resumable: false,
  });

  await new Promise<void>((resolve, reject) => {
    (res.data as Readable)
      .pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });

  return `gs://${bucket}/${destPath}`;
}

// ─── Transcoder Job ───────────────────────────────────────────────────────────
async function startTranscodeJob(inputUri: string, outputUri: string): Promise<string> {
  const parent = transcoderClient.locationPath(projectId, LOCATION);
  const [response] = await transcoderClient.createJob({
    parent,
    job: {
      inputUri,
      outputUri,
      config: {
        elementaryStreams: [
          {
            key: "video-hd",
            videoStream: {
              h264: { heightPixels: 720, widthPixels: 1280, bitrateBps: 2500000, frameRate: 30 },
            },
          },
          {
            key: "video-sd",
            videoStream: {
              h264: { heightPixels: 360, widthPixels: 640, bitrateBps: 800000, frameRate: 30 },
            },
          },
          {
            key: "audio",
            audioStream: { codec: "aac", bitrateBps: 128000, channelCount: 2, sampleRateHertz: 44100 },
          },
        ],
        muxStreams: [
          { key: "hd-hls", container: "ts", elementaryStreams: ["video-hd", "audio"] },
          { key: "sd-hls", container: "ts", elementaryStreams: ["video-sd", "audio"] },
        ],
        manifests: [
          { fileName: "manifest.m3u8", type: "HLS", muxStreams: ["hd-hls", "sd-hls"] },
        ],
        // Generate thumbnail at 5 seconds
        spriteSheets: [
          {
            filePrefix: "thumbnail",
            spriteHeightPixels: 270,
            spriteWidthPixels: 480,
            columnCount: 1,
            rowCount: 1,
            startTimeOffset: { seconds: 5 },
          },
        ],
      },
    },
  });
  return response.name!;
}

// ─── Poll job status ──────────────────────────────────────────────────────────
async function pollTranscodeJob(jobName: string): Promise<void> {
  const MAX_WAIT_MS = 30 * 60 * 1000; // 30 minutes
  const POLL_INTERVAL_MS = 15 * 1000; // 15 seconds
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    const [job] = await transcoderClient.getJob({ name: jobName });
    const state = (job.state as any)?.toString() || "";

    if (state.includes("SUCCEEDED") || state === "4") {
      return;
    }
    if (state.includes("FAILED") || state === "5") {
      const errDetail = JSON.stringify(job.error || {});
      throw new Error(`Transcoder job failed: ${errDetail}`);
    }

    console.log(`[worker] Job state: ${state} — waiting...`);
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error("Transcoder job timed out after 30 minutes");
}
