"use client";

import { useState } from "react";
import DrivePicker from "@/components/studio/DrivePicker";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { Music2 } from "lucide-react";

const MOODS = ["Chill", "Hype", "Deep", "Smooth", "Energy"] as const;
const MOOD_COLORS: Record<string, string> = {
  Chill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Hype: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Deep: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Smooth: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Energy: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function UploadPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<{ name: string; id: string } | null>(null);
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [status, setStatus] = useState("IDLE");

  const handleDriveSelect = async (file: any) => {
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, "")); 
  };

  const handleImport = async () => {
    if (!selectedFile || !user) return;
    setStatus("IMPORTING");

    try {
      const res = await fetch("/api/content/import-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          title: title,
          mood: mood || undefined,
          token: (selectedFile as any).token,
          userId: user.uid,
          creatorName: user.displayName
        })
      });
      
      if (res.ok) {
        setStatus("DONE");
        alert("Success! Your video is processing and will appear on the Home Page shortly.");
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
            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1 flex items-center gap-1.5">
                <Music2 size={14} /> Mood Tag <span className="text-xs opacity-50">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {MOODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    data-testid={`mood-tag-${m.toLowerCase()}`}
                    onClick={() => setMood(mood === m ? "" : m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${mood === m ? MOOD_COLORS[m] : "bg-white/5 text-stage-mutetext border-white/10 hover:bg-white/10"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              variant="primary" 
              onClick={handleImport}
              disabled={status === "IMPORTING" || status === "PROCESSING" || status === "DONE"}
            >
              {status === "IDLE" && "Start Import"}
              {status === "IMPORTING" && "Processing..."}
              {status === "DONE" && "Success! (Check Home)"}
              {status === "ERROR" && "Error - Try Again"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
