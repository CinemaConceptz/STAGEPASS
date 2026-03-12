"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Copy, Radio, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LiveDashboard() {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    url: string;
    playback: string;
    channelId: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleGoLive = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/live/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          title: "Live Stream",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStreamInfo({
          url: data.streamUrl,
          playback: data.playbackUrl,
          channelId: data.channelId,
        });
        setIsLive(true);
      } else {
        setError(data.error || "Failed to start stream.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    setIsLive(false);
    setStreamInfo(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className={isLive ? "text-red-500 animate-pulse" : "text-stage-mutetext"} />
            Live Control Room
          </h1>
          <p className="text-stage-mutetext">Broadcast to your audience in real time.</p>
        </div>

        {!isLive ? (
          <Button variant="primary" size="lg" onClick={handleGoLive} disabled={loading}>
            {loading ? "Provisioning Channel..." : "Start Broadcast"}
          </Button>
        ) : (
          <Button variant="destructive" size="lg" onClick={handleEndStream}>
            End Stream
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLive && !streamInfo && (
        <div className="bg-stage-panel border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <Radio size={48} className="mx-auto text-stage-mutetext" />
          <h2 className="text-xl font-bold">Ready to broadcast?</h2>
          <p className="text-stage-mutetext max-w-sm mx-auto">
            Click &ldquo;Start Broadcast&rdquo; to provision your Google Cloud live stream channel and receive your OBS stream key.
          </p>
        </div>
      )}

      {isLive && streamInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stream Config */}
          <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Stream Config (OBS)
            </h2>
            <div>
              <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">RTMP URL</label>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                <code className="text-xs text-stage-mint flex-1 break-all">{streamInfo.url}</code>
                <button onClick={() => copyToClipboard(streamInfo.url)}>
                  <Copy size={14} className="text-stage-mutetext hover:text-white" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">Stream Key</label>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                <code className="text-xs text-stage-mint flex-1">live</code>
                <button onClick={() => copyToClipboard("live")}>
                  <Copy size={14} className="text-stage-mutetext hover:text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Playback */}
          <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Eye size={18} className="text-stage-mint" />
              Viewer Playback
            </h2>
            <div>
              <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">HLS URL</label>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                <code className="text-xs text-stage-mint flex-1 break-all">{streamInfo.playback}</code>
                <button onClick={() => copyToClipboard(streamInfo.playback)}>
                  <Copy size={14} className="text-stage-mutetext hover:text-white" />
                </button>
              </div>
            </div>
            <p className="text-xs text-stage-mutetext">
              The stream will appear on the Live page once your broadcast starts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
