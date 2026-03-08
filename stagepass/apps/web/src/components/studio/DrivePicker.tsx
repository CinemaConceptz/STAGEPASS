"use client";

import { useState, useEffect } from "react";
import useDrivePicker from "react-google-drive-picker";
import Button from "@/components/ui/Button";
import { connectGoogleDrive } from "@/lib/firebase/drive";
import { UploadCloud } from "lucide-react";

interface DrivePickerProps {
  onSelect: (file: { id: string; name: string; mimeType: string; token: string }) => void;
}

export default function DrivePicker({ onSelect }: DrivePickerProps) {
  const [openPicker, authResponse] = useDrivePicker();
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
    
    // Check if we need to load script (handled by hook usually)
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
      viewId: "DOCS_VIDEOS", // Only show videos/media
      token: token,
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      callbackFunction: (data) => {
        if (data.action === "picked") {
          const file = data.docs[0];
          onSelect({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            token: token
          });
        }
      },
    });
  };

  if (!token) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-stage-panel/50">
        <UploadCloud className="mx-auto h-12 w-12 text-stage-mutetext mb-4" />
        <h3 className="text-lg font-bold mb-2">Import from Drive</h3>
        <p className="text-sm text-stage-mutetext mb-4">Connect your Google Drive to import high-quality masters.</p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <Button variant="primary" onClick={handleConnect}>
          Connect Google Drive
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center p-8 border-2 border-dashed border-stage-mint/30 rounded-2xl bg-stage-panel/50 hover:bg-stage-panel transition-colors">
      <UploadCloud className="mx-auto h-12 w-12 text-stage-mint mb-4" />
      <h3 className="text-lg font-bold mb-2">Drive Connected</h3>
      <p className="text-sm text-stage-mutetext mb-4">Ready to select content for premiere.</p>
      <Button variant="secondary" onClick={handleOpen}>
        Select Video File
      </Button>
    </div>
  );
}
