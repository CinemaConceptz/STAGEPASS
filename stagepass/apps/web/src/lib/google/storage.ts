import { Storage } from "@google-cloud/storage";
import { google } from "googleapis";
import { Readable } from "stream";

const storage = new Storage();
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagepass-raw-media-prod"; 
// Note: In prod, verify this bucket name matches your Terraform output exactly

export async function transferFileFromDrive(
  accessToken: string,
  fileId: string,
  destinationPath: string
) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth });

  console.log(`[Import] Fetching file stream from Drive: ${fileId}`);

  // 1. Get file metadata (size, mimeType)
  const fileMeta = await drive.files.get({
    fileId,
    fields: "size, mimeType, name",
  });

  // 2. Get readable stream
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destinationPath);

  // 3. Pipe to GCS
  return new Promise((resolve, reject) => {
    const destStream = file.createWriteStream({
      metadata: {
        contentType: fileMeta.data.mimeType || "video/mp4",
        metadata: {
          originalDriveId: fileId,
          importedAt: new Date().toISOString(),
        },
      },
    });

    (res.data as Readable)
      .pipe(destStream)
      .on("finish", () => {
        console.log(`[Import] Upload complete: gs://${bucketName}/${destinationPath}`);
        resolve(`gs://${bucketName}/${destinationPath}`);
      })
      .on("error", (err) => {
        console.error("[Import] Upload failed:", err);
        reject(err);
      });
  });
}
