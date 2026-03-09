"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DrivePicker from "@/components/studio/DrivePicker";
import { Radio, Folder, Music } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";

export default function RadioStudio() {
  const [stationName, setStationName] = useState("");
  const [genre, setGenre] = useState("House");
  const [desc, setDesc] = useState("");
  const [folder, setFolder] = useState<{id: string, name: string, token: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDriveSelect = (file: any) => {
    // DrivePicker usually returns files, need to configure for Folders
    // For MVP, if file selected, we take its parent or just assume ID is folder
    // Adjust picker config in real implementation to "DocsView.setIncludeFolders(true)"
    setFolder(file);
  };

  const handleSave = async () => {
    if (!auth.currentUser || !folder) return;
    setLoading(true);

    try {
      // 1. Call API to scan folder
      const res = await fetch("/api/radio/station", {
        method: "POST",
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          stationName,
          genre,
          description: desc,
          driveFolderId: folder.id,
          token: folder.token
        })
      });
      const data = await res.json();

      if (data.success) {
        // 2. Save to Firestore
        await setDoc(doc(db, "radioStations", auth.currentUser.uid), data.station);
        alert("Station Created! Initializing Playlist...");
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
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Radio className="text-stage-mint" />
          Station Manager
        </h1>
        <p className="text-stage-mutetext">Launch your 24/7 audio broadcast.</p>
      </div>

      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Station Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Station Name</label>
            <Input value={stationName} onChange={e => setStationName(e.target.value)} placeholder="e.g. Deep Vibes Radio" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Genre</label>
            <select className="w-full rounded-xl border border-white/10 bg-stage-bg px-3 py-3 text-sm text-white" value={genre} onChange={e => setGenre(e.target.value)}>
              <option>House</option>
              <option>Techno</option>
              <option>Hip Hop</option>
              <option>Talk</option>
              <option>Jazz</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Description</label>
            <textarea 
              className="w-full rounded-xl border border-white/10 bg-stage-bg px-3 py-3 text-sm text-white h-24" 
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
          <Folder size={20} /> Music Source
        </h3>
        <p className="text-sm text-stage-mutetext">Select a Google Drive folder containing your MP3s.</p>
        
        {!folder ? (
          <DrivePicker onSelect={handleDriveSelect} />
        ) : (
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Folder className="text-stage-indigo" />
              <div>
                <p className="font-bold">{folder.name}</p>
                <p className="text-xs text-stage-mutetext">ID: {folder.id}</p>
              </div>
            </div>
            <button onClick={() => setFolder(null)} className="text-xs text-red-400">Change</button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="lg" onClick={handleSave} disabled={loading || !folder}>
          {loading ? "Scanning Drive..." : "Launch Station"}
        </Button>
      </div>
    </div>
  );
}
