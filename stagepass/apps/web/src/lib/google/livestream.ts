import { LivestreamServiceClient } from "@google-cloud/video-live-stream";

const client = new LivestreamServiceClient();

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const LOCATION = "us-central1"; 

export async function createLiveChannel(channelId: string) {
  if (!PROJECT_ID) throw new Error("Project ID missing");

  const parent = client.locationPath(PROJECT_ID, LOCATION);

  // 1. Create Input (RTMP Ingest)
  const inputId = `input-${channelId}`;
  const [inputOperation] = await client.createInput({
    parent,
    inputId,
    input: {
      type: "RTMP_PUSH",
    },
  });
  const [inputResponse] = await inputOperation.promise();

  // 2. Create Channel (Processing)
  const [channelOperation] = await client.createChannel({
    parent,
    channelId,
    channel: {
      inputAttachments: [
        {
          key: "my-input",
          input: inputResponse.name,
        },
      ],
      output: {
        uri: `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-live-output-prod"}/live/${channelId}/`,
      },
      elementaryStreams: [
        {
          key: "video-stream0",
          videoStream: {
            h264: {
              heightPixels: 720,
              widthPixels: 1280,
              bitrateBps: 2500000,
              frameRate: 30,
            },
          },
        },
        {
          key: "audio-stream0",
          audioStream: {
            codec: "aac",
            channelCount: 2,
            bitrateBps: 64000,
          },
        },
      ],
      muxStreams: [
        {
          key: "mux-video",
          container: "ts",
          elementaryStreams: ["video-stream0", "audio-stream0"],
        },
      ],
      manifests: [
        {
          fileName: "manifest.m3u8",
          type: "HLS",
          muxStreams: ["mux-video"],
          maxPlaylistSegments: 5,
        },
      ],
    },
  });
  
  const [channelResponse] = await channelOperation.promise();
  
  return {
    channelName: channelResponse.name,
    inputUri: inputResponse.uri, // This is the RTMP URL for OBS
  };
}

export async function startChannel(channelId: string) {
  const name = client.channelPath(PROJECT_ID!, LOCATION, channelId);
  const [operation] = await client.startChannel({ name });
  await operation.promise();
}

export async function stopChannel(channelId: string) {
  const name = client.channelPath(PROJECT_ID!, LOCATION, channelId);
  const [operation] = await client.stopChannel({ name });
  await operation.promise();
}
