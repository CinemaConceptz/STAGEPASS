"use client";

import { useState } from "react";
import DrivePicker from "@/components/studio/DrivePicker";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<{ name: string; id: string } | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("IDLE"); // IDLE, IMPORTING, PROCESSING, DONE

  const handleDriveSelect = async (file: any) => {
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, "")); // remove extension
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setStatus("IMPORTING");

    try {
      // Call our API to start the backend transfer
      const res = await fetch("/api/content/import-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          title: title,
          token: (selectedFile as any).token // In prod, pass this securely or use refresh token from session
        })
      });
      
      if (res.ok) {
        setStatus("PROCESSING");
      } else {
        setStatus("ERROR");
      }
    } catch (e) {
      setStatus("ERROR");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">New Premiere</h1>
        <p className="text-stage-mutetext">Import high-fidelity content from your storage.</p>
      </div>

      {!selectedFile ? (
        <DrivePicker onSelect={handleDriveSelect} />
      ) : (
        <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
            <div className="h-12 w-12 bg-stage-indigo/20 rounded flex items-center justify-center text-stage-indigo font-bold">
              MP4
            </div>
            <div className="flex-1">
              <p className="font-bold truncate">{selectedFile.name}</p>
              <p className="text-xs text-stage-mutetext">Ready to import</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-xs text-red-400 hover:underline">
              Change
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              variant="primary" 
              onClick={handleImport}
              disabled={status === "IMPORTING" || status === "PROCESSING"}
            >
              {status === "IDLE" && "Start Import"}
              {status === "IMPORTING" && "Transferring..."}
              {status === "PROCESSING" && "Processing..."}
              {status === "DONE" && "Done"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
