"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DrivePicker from "@/components/studio/DrivePicker";
import { Radio, Music, CheckCircle, ImageIcon, Upload } from "lucide-react";
import { auth } from "@/lib/firebase/client";

export default function RadioStudio() {
  const [stationName, setStationName] = useState("");
  const [genre, setGenre] = useState("House");
  const [desc, setDesc] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [audioFile, setAudioFile] = useState<{
    id: string;
    name: string;
    token: string;
    mimeType: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDriveSelect = (file: any) => {
    setAudioFile(file);
  };

  const handleSave = async () => {
    if (!auth?.currentUser || !audioFile) return;
    setLoading(true);

    try {
      const res = await fetch("/api/radio/station", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: auth.currentUser.uid,
          userId: auth.currentUser.uid,
          stationName,
          genre,
          description: desc,
          artworkUrl,
          driveFileId: audioFile.id,
          driveFileName: audioFile.name,
          token: audioFile.token,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="radio-studio-heading">
          <Radio className="text-stage-mint" />
          Station Manager
        </h1>
        <p className="text-stage-mutetext">Launch your 24/7 audio broadcast.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-stage-mint/10 border border-stage-mint/30 rounded-xl text-stage-mint" data-testid="radio-success-msg">
          <CheckCircle size={20} />
          <span className="font-medium">Station saved successfully!</span>
        </div>
      )}

      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Station Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Station Name</label>
            <Input
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="e.g. Deep Vibes Radio"
              data-testid="radio-station-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Genre</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-stage-bg px-3 py-3 text-sm text-white"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              data-testid="radio-genre-select"
            >
              <option>House</option>
              <option>Techno</option>
              <option>Hip Hop</option>
              <option>R&B</option>
              <option>Jazz</option>
              <option>Talk</option>
              <option>Electronic</option>
              <option>Ambient</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-stage-bg px-3 py-3 text-sm text-white h-24 resize-none"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tell listeners what your station is about..."
              data-testid="radio-description"
            />
          </div>
        </div>
      </div>

      {/* Artwork */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
          <ImageIcon size={18} /> Station Artwork
        </h3>
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 bg-black/30 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
            {artworkUrl ? (
              <img src={artworkUrl} alt="Artwork" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={24} className="text-stage-mutetext/40" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              value={artworkUrl}
              onChange={(e) => setArtworkUrl(e.target.value)}
              placeholder="Paste artwork image URL"
              data-testid="radio-artwork-url"
            />
            <p className="text-xs text-stage-mutetext">Square image recommended (500x500 or larger).</p>
          </div>
        </div>
      </div>

      {/* Audio Source */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
          <Music size={20} /> Audio Source
        </h3>
        <p className="text-sm text-stage-mutetext">
          Select a folder or audio file from your Google Drive, or upload files directly.
        </p>

        {!audioFile ? (
          <DrivePicker onSelect={handleDriveSelect} mode="audio" />
        ) : (
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Music className="text-stage-mint" size={20} />
              <div>
                <p className="font-bold">{audioFile.name}</p>
                <p className="text-xs text-stage-mutetext">{audioFile.mimeType}</p>
              </div>
            </div>
            <button
              onClick={() => setAudioFile(null)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
              data-testid="radio-change-audio"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={loading || !audioFile || !stationName}
          data-testid="radio-launch-btn"
        >
          {loading ? "Saving Station..." : "Launch Station"}
        </Button>
      </div>
    </div>
  );
}
