"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Copy, Eye, Radio, Play } from "lucide-react";

export default function LiveDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{ url: string; playback: string } | null>(null);

  const handleGoLive = async () => {
    setLoading(true);
    try {
      // Call our API to provision the Google Cloud Channel
      const res = await fetch("/api/live/session", {
        method: "POST",
        body: JSON.stringify({ userId: "demo", title: "My Live Stream" })
      });
      const data = await res.json();
      
      if (data.success) {
        setStreamInfo({
          url: data.streamUrl,
          playback: data.playbackUrl
        });
        setIsLive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className={isLive ? "text-red-500 animate-pulse" : "text-stage-mutetext"} />
            Live Control Room
          </h1>
          <p className="text-stage-mutetext">Manage your broadcast.</p>
        </div>
        
        {!isLive ? (
          <Button variant="primary" size="lg" onClick={handleGoLive} disabled={loading}>
            {loading ? "Provisioning Satellite..." : "Start Broadcast"}
          </Button>
        ) : (
          <Button variant="destructive" size="lg" onClick={() => setIsLive(false)}>
            End Stream
          </Button>
        )}
      </div>

      {isLive && streamInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stream Key / Ingest Info */}
          <div className="bg-stage-panel rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold border-b border-white/10 pb-2">Encoder Settings (OBS)</h3>
            
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-stage-mutetext">Stream URL (Server)</label>
              <div className="flex gap-2">
                <Input value={streamInfo.url} readOnly className="font-mono text-xs bg-black/50" />
                <Button variant="secondary" className="px-3"><Copy size={16} /></Button>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-200">
              ⚠️ <strong>Important:</strong> Paste this URL into OBS Settings under "Stream". Start streaming in OBS to go live.
            </div>
          </div>

          {/* Preview Monitor */}
          <div className="bg-black rounded-2xl border border-white/10 overflow-hidden relative group aspect-video flex items-center justify-center">
             <div className="text-center space-y-2">
               <div className="h-12 w-12 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto">
                 <Play size={24} className="ml-1" />
               </div>
               <p className="text-sm font-mono text-stage-mutetext">Waiting for signal...</p>
             </div>
             
             {/* Overlay */}
             <div className="absolute top-4 right-4 flex gap-2">
               <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">LIVE</span>
               <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                 <Eye size={10} /> 0
               </span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
