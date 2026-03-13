"use client";

import { useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import Button from "@/components/ui/Button";
import { connectGoogleDrive } from "@/lib/firebase/drive";
import { UploadCloud, Music, Video, CheckSquare, Square } from "lucide-react";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  token: string;
}

interface DrivePickerProps {
  onSelect: (file: DriveFile) => void;
  onSelectMultiple?: (files: DriveFile[]) => void;
  mode?: "video" | "audio" | "folder";
  multiselect?: boolean;
  label?: string;
}

export default function DrivePicker({
  onSelect,
  onSelectMultiple,
  mode = "video",
  multiselect = false,
  label,
}: DrivePickerProps) {
  const [openPicker] = useDrivePicker();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    try {
      const accessToken = await connectGoogleDrive();
      if (accessToken) setToken(accessToken);
    } catch (err: any) {
      setError("Failed to connect Google Drive: " + err.message);
    }
  };

  const handleOpen = () => {
    if (!token) return;

    const viewId =
      mode === "video"
        ? "DOCS_VIDEOS"
        : mode === "folder"
        ? "FOLDERS"
        : "DOCS";

    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
      viewId,
      token,
      showUploadView: false,
      showUploadFolders: mode === "folder",
      supportDrives: true,
      multiselect: multiselect || mode === "audio",
      callbackFunction: (data) => {
        if (data.action === "picked" && data.docs.length > 0) {
          const files: DriveFile[] = data.docs.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            token: token!,
          }));

          if ((multiselect || mode === "audio") && onSelectMultiple) {
            onSelectMultiple(files);
          } else {
            onSelect(files[0]);
          }
        }
      },
    });
  };

  const buttonLabel =
    label ||
    (mode === "audio"
      ? "Select Audio Files"
      : mode === "folder"
      ? "Select Folder"
      : "Select Video File");

  const Icon = mode === "audio" ? Music : mode === "folder" ? UploadCloud : Video;

  if (!token) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-stage-panel/50">
        <UploadCloud className="mx-auto h-12 w-12 text-stage-mutetext mb-4" />
        <h3 className="text-lg font-bold mb-2">Import from Drive</h3>
        <p className="text-sm text-stage-mutetext mb-4">
          Connect your Google Drive to import your content.
        </p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <Button variant="primary" onClick={handleConnect} data-testid="drive-connect-btn">
          Connect Google Drive
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center p-8 border-2 border-dashed border-stage-mint/30 rounded-2xl bg-stage-panel/50 hover:bg-stage-panel transition-colors">
      <Icon className="mx-auto h-12 w-12 text-stage-mint mb-4" />
      <h3 className="text-lg font-bold mb-2">Drive Connected</h3>
      <p className="text-sm text-stage-mutetext mb-4">
        {mode === "audio"
          ? "Select multiple audio files (MP3, WAV, FLAC, etc)."
          : mode === "folder"
          ? "Ready to select a folder."
          : "Ready to select your video content."}
      </p>
      <Button variant="secondary" onClick={handleOpen} data-testid="drive-open-btn">
        {buttonLabel}
      </Button>
    </div>
  );
}
