"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Copy, Radio, Eye, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LiveDashboard() {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    rtmpUrl: string;
    streamKey: string;
    playbackUrl: string;
    channelId: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("My Live Stream");
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
          title,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStreamInfo({
          rtmpUrl: data.streamUrl || data.rtmpUrl || `rtmp://live.stagepassaccess.com/live`,
          streamKey: data.streamKey || data.channelId || `stream_${user.uid}_${Date.now()}`,
          playbackUrl: data.playbackUrl,
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
    if (streamInfo?.channelId) {
      try {
        const idToken = await user?.getIdToken();
        await fetch(`/api/live/session/${streamInfo.channelId}/stop`, {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
        });
      } catch (e) {}
    }
    setIsLive(false);
    setStreamInfo(null);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="live-dashboard-heading">
            <Radio className={isLive ? "text-red-500 animate-pulse" : "text-stage-mutetext"} />
            Live Control Room
          </h1>
          <p className="text-stage-mutetext">Broadcast to your audience in real time.</p>
        </div>

        {!isLive ? (
          <Button variant="primary" size="lg" onClick={handleGoLive} disabled={loading} data-testid="start-broadcast-btn">
            {loading ? "Provisioning Channel..." : "Start Broadcast"}
          </Button>
        ) : (
          <Button variant="destructive" size="lg" onClick={handleEndStream} data-testid="end-stream-btn">
            End Stream
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2" data-testid="live-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!isLive && !streamInfo && (
        <div className="space-y-6">
          <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Stream Settings</h2>
            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Stream Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your stream a title"
                data-testid="stream-title-input"
              />
            </div>
          </div>

          <div className="bg-stage-panel border border-white/10 rounded-2xl p-12 text-center space-y-4">
            <Radio size={48} className="mx-auto text-stage-mutetext" />
            <h2 className="text-xl font-bold">Ready to broadcast?</h2>
            <p className="text-stage-mutetext max-w-sm mx-auto">
              Click "Start Broadcast" to provision your live stream channel. You'll receive RTMP credentials to connect OBS, Prism, or any streaming software.
            </p>
          </div>
        </div>
      )}

      {isLive && streamInfo && (
        <div className="space-y-6">
          {/* Setup Instructions */}
          <div className="bg-stage-mint/5 border border-stage-mint/20 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-stage-mint flex items-center gap-2">
              <AlertCircle size={18} />
              How to connect OBS Studio
            </h3>
            <ol className="text-sm text-stage-mutetext space-y-2 list-decimal list-inside">
              <li>Open <strong className="text-white">OBS Studio</strong></li>
              <li>Go to <strong className="text-white">Settings → Stream</strong> <span className="text-amber-400">(do NOT use the Auto-Configuration Wizard)</span></li>
              <li>Set Service to <strong className="text-white">"Custom..."</strong></li>
              <li>In the <strong className="text-white">Server</strong> field, paste the <strong className="text-white">RTMP Server URL</strong> below</li>
              <li>In the <strong className="text-white">Stream Key</strong> field, paste the <strong className="text-white">Stream Key</strong> below</li>
              <li>Click <strong className="text-white">OK</strong>, then click <strong className="text-white">Start Streaming</strong></li>
            </ol>
            <p className="text-xs text-amber-400/80 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Note: The OBS Auto-Configuration Wizard tests OBS's own servers — it is not related to your stream. Always use <strong>Settings → Stream</strong> for custom RTMP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RTMP Config */}
            <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Stream Config
              </h2>
              <div>
                <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">RTMP Server URL</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5">
                  <code className="text-xs text-stage-mint flex-1 break-all font-mono" data-testid="rtmp-url">{streamInfo.rtmpUrl}</code>
                  <button onClick={() => copyToClipboard(streamInfo.rtmpUrl, "rtmp")} className="shrink-0" data-testid="copy-rtmp-btn">
                    {copiedField === "rtmp" ? <Check size={14} className="text-stage-mint" /> : <Copy size={14} className="text-stage-mutetext hover:text-white" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">Stream Key</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5">
                  <code className="text-xs text-stage-mint flex-1 font-mono" data-testid="stream-key">{streamInfo.streamKey}</code>
                  <button onClick={() => copyToClipboard(streamInfo.streamKey, "key")} className="shrink-0" data-testid="copy-key-btn">
                    {copiedField === "key" ? <Check size={14} className="text-stage-mint" /> : <Copy size={14} className="text-stage-mutetext hover:text-white" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Playback */}
            <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Eye size={18} className="text-stage-mint" />
                Viewer Info
              </h2>
              <div>
                <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">Playback URL (HLS)</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5">
                  <code className="text-xs text-stage-mint flex-1 break-all font-mono" data-testid="playback-url">{streamInfo.playbackUrl}</code>
                  <button onClick={() => copyToClipboard(streamInfo.playbackUrl, "playback")} className="shrink-0" data-testid="copy-playback-btn">
                    {copiedField === "playback" ? <Check size={14} className="text-stage-mint" /> : <Copy size={14} className="text-stage-mutetext hover:text-white" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">Short Stream URL</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5">
                  <code className="text-xs text-stage-mint flex-1 font-mono" data-testid="short-stream-url">
                    {`${typeof window !== "undefined" ? window.location.origin : ""}/api/live/${streamInfo.channelId}/hls`}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/api/live/${streamInfo.channelId}/hls`, "shorturl")}
                    className="shrink-0"
                    data-testid="copy-shorturl-btn"
                    title="Copy short stream URL"
                  >
                    {copiedField === "shorturl" ? <Check size={14} className="text-stage-mint" /> : <Copy size={14} className="text-stage-mutetext hover:text-white" />}
                  </button>
                </div>
                <p className="text-xs text-stage-mutetext mt-1">Opens directly in VLC or any HLS player</p>
              </div>
              <div>
                <label className="block text-xs text-stage-mutetext mb-1 uppercase tracking-widest">Viewer Page</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5">
                  <code className="text-xs text-stage-mint flex-1 font-mono" data-testid="viewer-page-url">
                    {`${typeof window !== "undefined" ? window.location.origin : ""}/live/${streamInfo.channelId}`}
                  </code>
                  <button onClick={() => copyToClipboard(`${window.location.origin}/live/${streamInfo.channelId}`, "viewer")} className="shrink-0">
                    {copiedField === "viewer" ? <Check size={14} className="text-stage-mint" /> : <Copy size={14} className="text-stage-mutetext hover:text-white" />}
                  </button>
                </div>
                <p className="text-xs text-stage-mutetext mt-1">Share this link — viewers land directly on your stream</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
