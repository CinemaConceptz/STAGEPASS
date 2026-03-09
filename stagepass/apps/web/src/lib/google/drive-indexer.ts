import { google } from "googleapis";

// Helper to list audio files in a user's Drive folder
export async function listAudioFiles(accessToken: string, folderId: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'audio/' or mimeType = 'application/mp3') and trashed = false`,
    fields: "files(id, name, duration, webContentLink, size)",
    pageSize: 100
  });

  return res.data.files || [];
}
