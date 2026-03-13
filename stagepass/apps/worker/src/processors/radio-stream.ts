import { Storage } from "@google-cloud/storage";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

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

interface RadioTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  driveFileId?: string;
  durationMs?: number;
}

interface RadioStreamPayload {
  type: "RADIO_STREAM";
  stationId: string;
  bucket: string;
}

// ─── Main: Generate HLS stream for a radio station ──────────────────────────
export async function generateRadioStream(payload: RadioStreamPayload): Promise<void> {
  const { stationId, bucket } = payload;
  const tmpDir = path.join(os.tmpdir(), `radio-${stationId}-${Date.now()}`);

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    // 1. Fetch station data from Firestore
    const stationSnap = await db.collection("radioStations").doc(stationId).get();
    if (!stationSnap.exists) {
      console.error(`[radio-stream] Station ${stationId} not found`);
      return;
    }

    const stationData = stationSnap.data()!;
    const tracks: RadioTrack[] = stationData.tracks || [];

    if (tracks.length === 0) {
      console.log(`[radio-stream] Station ${stationId} has no tracks, skipping`);
      return;
    }

    console.log(`[radio-stream] Generating HLS for station ${stationId} with ${tracks.length} tracks`);
    await updateStationStatus(stationId, "GENERATING");

    // 2. Download all tracks from GCS to tmp
    const localFiles: string[] = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const ext = ".mp3"; // Default extension
      const localPath = path.join(tmpDir, `track-${i}${ext}`);

      // Try GCS path first (radio/{stationId}/tracks/{driveFileId})
      const gcsPath = `radio/${stationId}/tracks/${track.driveFileId || track.id}`;
      try {
        await storage.bucket(bucket).file(gcsPath).download({ destination: localPath });
        localFiles.push(localPath);
        console.log(`[radio-stream] Downloaded track ${i}: ${track.title}`);
      } catch (e: any) {
        console.warn(`[radio-stream] Failed to download track ${i} from GCS: ${e.message}`);
        // Try direct URL download as fallback
        if (track.url && track.url.startsWith("http")) {
          try {
            const res = await fetch(track.url);
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(localPath, buffer);
            localFiles.push(localPath);
            console.log(`[radio-stream] Downloaded track ${i} from URL: ${track.title}`);
          } catch (urlErr: any) {
            console.warn(`[radio-stream] Failed URL download for track ${i}: ${urlErr.message}`);
          }
        }
      }
    }

    if (localFiles.length === 0) {
      console.error(`[radio-stream] No tracks could be downloaded for station ${stationId}`);
      await updateStationStatus(stationId, "FAILED", { error: "No tracks available" });
      return;
    }

    // 3. Create FFmpeg concat file
    const concatFilePath = path.join(tmpDir, "concat.txt");
    const concatContent = localFiles.map((f) => `file '${f}'`).join("\n");
    fs.writeFileSync(concatFilePath, concatContent);

    // 4. Run FFmpeg: concat → HLS
    const hlsOutputDir = path.join(tmpDir, "hls");
    fs.mkdirSync(hlsOutputDir, { recursive: true });
    const manifestPath = path.join(hlsOutputDir, "stream.m3u8");

    console.log(`[radio-stream] Running FFmpeg for ${localFiles.length} tracks...`);

    await execFileAsync("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", concatFilePath,
      "-c:a", "aac",
      "-b:a", "192k",
      "-ar", "44100",
      "-ac", "2",
      "-f", "hls",
      "-hls_time", "10",           // 10-second segments
      "-hls_list_size", "0",       // Keep all segments in manifest
      "-hls_segment_filename", path.join(hlsOutputDir, "segment_%04d.ts"),
      "-hls_flags", "independent_segments",
      manifestPath,
    ], { timeout: 600000 }); // 10 min timeout

    console.log(`[radio-stream] FFmpeg complete. Uploading to GCS...`);

    // 5. Upload HLS output to GCS
    const gcsPrefix = `radio/${stationId}/stream`;
    const hlsFiles = fs.readdirSync(hlsOutputDir);

    for (const file of hlsFiles) {
      const localFilePath = path.join(hlsOutputDir, file);
      const gcsPath = `${gcsPrefix}/${file}`;
      const contentType = file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp2t";

      await storage.bucket(bucket).upload(localFilePath, {
        destination: gcsPath,
        metadata: { contentType, cacheControl: "public, max-age=30" },
      });

      // Make public
      try {
        await storage.bucket(bucket).file(gcsPath).makePublic();
      } catch (e) {}
    }

    // 6. Update station with HLS playback URL
    const playbackUrl = `https://storage.googleapis.com/${bucket}/${gcsPrefix}/stream.m3u8`;
    await updateStationStatus(stationId, "LIVE", {
      hlsPlaybackUrl: playbackUrl,
      segmentCount: hlsFiles.filter((f) => f.endsWith(".ts")).length,
      lastStreamGenerated: new Date().toISOString(),
    });

    console.log(`[radio-stream] Station ${stationId} stream ready: ${playbackUrl}`);
  } catch (err: any) {
    console.error(`[radio-stream] Failed for station ${stationId}:`, err);
    await updateStationStatus(stationId, "FAILED", { error: err.message }).catch(() => {});
  } finally {
    // Cleanup tmp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

// ─── Process individual radio track (Drive → GCS) ──────────────────────────
export async function processRadioTrack(payload: {
  type: "RADIO_TRACK";
  stationId: string;
  trackId: string;
  driveFileId: string;
  driveToken: string;
  bucket: string;
  outputPath: string;
}): Promise<void> {
  const { stationId, trackId, driveFileId, driveToken, bucket, outputPath } = payload;

  try {
    console.log(`[radio-track] Ingesting track ${trackId} for station ${stationId}`);

    // Download from Drive
    const { google } = await import("googleapis");
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: driveToken });
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.get({ fileId: driveFileId, alt: "media" }, { responseType: "stream" });

    // Upload to GCS
    const gcsFile = storage.bucket(bucket).file(outputPath);
    const writeStream = gcsFile.createWriteStream({
      metadata: { contentType: "audio/mpeg" },
      resumable: false,
    });

    const { Readable } = await import("stream");
    await new Promise<void>((resolve, reject) => {
      (res.data as any).pipe(writeStream).on("finish", resolve).on("error", reject);
    });

    // Make public
    try { await gcsFile.makePublic(); } catch (e) {}

    // Get file duration using ffprobe
    const tmpFile = path.join(os.tmpdir(), `probe-${trackId}.mp3`);
    await storage.bucket(bucket).file(outputPath).download({ destination: tmpFile });

    let durationMs = 180000; // default 3 min
    try {
      const { stdout } = await execFileAsync("ffprobe", [
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        tmpFile,
      ]);
      const probe = JSON.parse(stdout);
      if (probe.format?.duration) {
        durationMs = Math.round(parseFloat(probe.format.duration) * 1000);
      }
    } catch (probeErr) {
      console.warn(`[radio-track] ffprobe failed for ${trackId}, using default duration`);
    }

    // Update track duration in Firestore
    const stationRef = db.collection("radioStations").doc(stationId);
    const stationSnap = await stationRef.get();
    if (stationSnap.exists) {
      const tracks = stationSnap.data()!.tracks || [];
      const updatedTracks = tracks.map((t: any) =>
        t.id === trackId ? { ...t, durationMs, url: `https://storage.googleapis.com/${bucket}/${outputPath}` } : t
      );
      await stationRef.update({ tracks: updatedTracks });
    }

    // Cleanup
    try { fs.unlinkSync(tmpFile); } catch (e) {}

    console.log(`[radio-track] Track ${trackId} ready (${Math.round(durationMs / 1000)}s)`);
  } catch (err: any) {
    console.error(`[radio-track] Failed for track ${trackId}:`, err);
  }
}

async function updateStationStatus(stationId: string, status: string, extra: Record<string, any> = {}) {
  await db.collection("radioStations").doc(stationId).update({
    streamStatus: status,
    ...extra,
    updatedAt: new Date().toISOString(),
  });
}
