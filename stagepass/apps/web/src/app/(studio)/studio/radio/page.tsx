"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DrivePicker, { DriveFile } from "@/components/studio/DrivePicker";
import ImageUploader from "@/components/studio/ImageUploader";
import { Radio, Music, CheckCircle, X, CheckSquare, Square, Calendar } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MOODS = ["Chill", "Hype", "Deep", "Smooth", "Energy"] as const;
const MOOD_COLORS: Record<string, string> = {
  Chill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Hype: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Deep: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Smooth: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Energy: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function RadioStudio() {
  const router = useRouter();
  const [stationName, setStationName] = useState("");
  const [genre, setGenre] = useState("House");
  const [desc, setDesc] = useState("");
  const [artworkData, setArtworkData] = useState("");
  const [audioFiles, setAudioFiles] = useState<DriveFile[]>([]);
  const [trackMoods, setTrackMoods] = useState<Record<string, string>>({}); // fileId → mood
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stationExists, setStationExists] = useState(false);
  const [hlsStatus, setHlsStatus] = useState("");

  const handleDriveSelectMultiple = (files: DriveFile[]) => {
    setAudioFiles((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const newFiles = files.filter((f) => !existingIds.has(f.id));
      return [...prev, ...newFiles];
    });
  };

  const handleDriveSelectSingle = (file: DriveFile) => {
    handleDriveSelectMultiple([file]);
  };

  const toggleFile = (id: string) => {
    setAudioFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const removeAllFiles = () => setAudioFiles([]);

  const handleSave = async () => {
    if (!auth?.currentUser || audioFiles.length === 0) return;
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
          artworkUrl: artworkData,
          tracks: audioFiles.map((f) => ({
            driveFileId: f.id,
            driveFileName: f.name,
            mimeType: f.mimeType,
            mood: trackMoods[f.id] || "",
          })),
          token: audioFiles[0].token,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setStationExists(true);
        setTimeout(() => {
          router.push("/radio");
        }, 1500);
      } else {
        alert(data.error || "Failed to save station.");
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
        <Link href="/studio/radio/schedule" className="text-sm text-stage-mint hover:underline flex items-center gap-1.5 mt-1">
          <Calendar size={14} /> Manage Show Schedule &amp; Auto-DJ
        </Link>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-stage-mint/10 border border-stage-mint/30 rounded-xl text-stage-mint" data-testid="radio-success-msg">
          <CheckCircle size={20} />
          <span className="font-medium">Station saved successfully!</span>
        </div>
      )}

      {/* Station Details */}
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

      {/* Artwork - File Upload */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Station Artwork</h3>
        <ImageUploader
          value={artworkData}
          onChange={setArtworkData}
          label="Square image recommended (500x500 or larger). PNG, JPG, WebP. Max 5MB."
        />
      </div>

      {/* Audio Source - Multi-select */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
          <Music size={20} /> Audio Tracks
        </h3>
        <p className="text-sm text-stage-mutetext">
          Select multiple audio files from your Google Drive. Use checkboxes to pick tracks for your station playlist.
        </p>

        {/* Selected files list */}
        {audioFiles.length > 0 && (
          <div className="space-y-2" data-testid="radio-selected-tracks">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-stage-mint">
                {audioFiles.length} track{audioFiles.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={removeAllFiles}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                data-testid="radio-clear-all"
              >
                Clear All
              </button>
            </div>
            {audioFiles.map((file, idx) => (
              <div key={file.id} className="p-3 bg-black/30 rounded-xl group space-y-2" data-testid={`radio-track-${idx}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleFile(file.id)} className="shrink-0" data-testid={`radio-track-checkbox-${idx}`}>
                    <CheckSquare size={18} className="text-stage-mint" />
                  </button>
                  <Music size={16} className="text-stage-mint shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-stage-mutetext">{file.mimeType}</p>
                  </div>
                  <button onClick={() => toggleFile(file.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-stage-mutetext hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
                {/* Mood Tag Row */}
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {MOODS.map(mood => {
                    const active = trackMoods[file.id] === mood;
                    return (
                      <button key={mood}
                        onClick={() => setTrackMoods(prev => ({ ...prev, [file.id]: active ? "" : mood }))}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${active ? MOOD_COLORS[mood] : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10"}`}>
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <DrivePicker
          onSelect={handleDriveSelectSingle}
          onSelectMultiple={handleDriveSelectMultiple}
          mode="audio"
          multiselect
          label={audioFiles.length > 0 ? "Add More Tracks" : "Select Audio Files"}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="secondary"
            size="lg"
            disabled={!stationExists}
            onClick={async () => {
              if (!auth?.currentUser) return;
              setHlsStatus("generating");
              try {
                const res = await fetch("/api/radio/generate-stream", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ stationId: auth.currentUser.uid, userId: auth.currentUser.uid }),
                });
                const data = await res.json();
                if (data.success) {
                  setHlsStatus("success");
                  alert("HLS stream generation started! It may take a few minutes for your station to go live.");
                } else {
                  setHlsStatus("error");
                  alert(data.error || "Failed to generate stream. Make sure the media worker is deployed.");
                }
              } catch (e) {
                setHlsStatus("error");
                console.error(e);
              }
            }}
            data-testid="radio-generate-stream-btn"
          >
            {hlsStatus === "generating" ? "Generating..." : "Generate HLS Stream"}
          </Button>
          {!stationExists && (
            <p className="text-xs text-stage-mutetext">Launch your station first to enable HLS generation.</p>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={loading || audioFiles.length === 0 || !stationName}
          data-testid="radio-launch-btn"
        >
          {loading ? "Saving Station..." : `Launch Station (${audioFiles.length} tracks)`}
        </Button>
      </div>
    </div>
  );
}
