import { LivestreamServiceClient } from "@google-cloud/livestream";

const client = new LivestreamServiceClient();

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const LOCATION = "us-central1"; 

export async function createLiveChannel(channelId: string) {
  if (!PROJECT_ID) throw new Error("Project ID missing");

  const parent = client.locationPath(PROJECT_ID, LOCATION);

  // 1. Create Input (RTMP Ingest)
  const inputId = `input-${channelId}`;
  
  const createInputResponse = await client.createInput({
    parent,
    inputId,
    input: {
      type: "RTMP_PUSH",
    },
  });
  const inputOperation = createInputResponse[0];
  const [inputResponse] = await inputOperation.promise();

  // 2. Create Channel (Processing)
  const createChannelResponse = await client.createChannel({
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
        },
      ],
    },
  });
  
  const channelOperation = createChannelResponse[0];
  const [channelResponse] = await channelOperation.promise();
  
  return {
    channelName: channelResponse.name,
    inputUri: inputResponse.uri, 
  };
}

export async function startChannel(channelId: string) {
  const name = client.channelPath(PROJECT_ID!, LOCATION, channelId);
  const startResponse = await client.startChannel({ name });
  const operation = startResponse[0];
  await operation.promise();
}

export async function stopChannel(channelId: string) {
  const name = client.channelPath(PROJECT_ID!, LOCATION, channelId);
  const stopResponse = await client.stopChannel({ name });
  const operation = stopResponse[0];
  await operation.promise();
}
