import { TranscoderServiceClient } from "@google-cloud/video-transcoder";

const client = new TranscoderServiceClient();

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const LOCATION = "us-central1"; // Must match bucket region

export async function createTranscodeJob(inputUri: string, outputUri: string) {
  if (!PROJECT_ID) throw new Error("Project ID missing");

  const parent = client.locationPath(PROJECT_ID, LOCATION);

  const request = {
    parent,
    job: {
      inputUri, // gs://bucket/path/video.mp4
      outputUri, // gs://bucket/path/processed/
      config: {
        elementaryStreams: [
          {
            key: "video-stream0",
            videoStream: {
              h264: {
                heightPixels: 720,
                widthPixels: 1280,
                bitrateBps: 2500000, // 2.5 Mbps
                frameRate: 30,
              },
            },
          },
          {
            key: "audio-stream0",
            audioStream: {
              codec: "aac",
              bitrateBps: 64000,
            },
          },
        ],
        muxStreams: [
          {
            key: "sd-mp4",
            container: "mp4",
            elementaryStreams: ["video-stream0", "audio-stream0"],
          },
          {
            key: "media-hls",
            container: "ts", // HLS segments
            elementaryStreams: ["video-stream0", "audio-stream0"],
          }
        ],
        manifests: [
          {
            fileName: "manifest.m3u8",
            type: "HLS",
            muxStreams: ["media-hls"],
          },
        ],
      },
    },
  };

  // @ts-ignore - Types for Google Cloud libs can be finicky
  const [response] = await client.createJob(request);
  console.log(`[Transcode] Job started: ${response.name}`);
  return response.name;
}
