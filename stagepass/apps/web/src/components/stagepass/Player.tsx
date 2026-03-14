"use client";

import { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { Volume2, VolumeX, Maximize2, Play, Pause, Loader } from "lucide-react";

interface PlayerProps {
  hlsUrl?: string | null;
  contentId?: string;
  driveFileId?: string | null;
  showListenerCount?: boolean;
  listenerCount?: number;
  className?: string;
}

export default function Player({
  hlsUrl,
  contentId,
  driveFileId,
  showListenerCount = false,
  listenerCount = 0,
  className = "",
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "processing">("loading");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const trySignedUrl = async () => {
      if (!contentId) { setStatus("processing"); return; }
      try {
        const res = await fetch(`/api/content/${contentId}/signed-url`);
        const data = await res.json();
        if (data.signedUrl) {
          video.src = data.signedUrl;
          setStatus("ready");
        } else {
          setStatus("processing");
        }
      } catch {
        setStatus("processing");
      }
    };

    if (hlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 30, startLevel: -1 });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus("ready"));
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) trySignedUrl();
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadeddata", () => setStatus("ready"));
        video.addEventListener("error", () => trySignedUrl());
      } else {
        trySignedUrl();
      }
    } else {
      trySignedUrl();
    }
  }, [hlsUrl, contentId]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || status !== "ready") return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch(() => {});
    }
  };

  // Processing / no source — show Drive iframe or processing message
  if (status === "processing") {
    if (driveFileId) {
      return (
        <div className={`relative aspect-video bg-black rounded-xl overflow-hidden ${className}`} data-testid="player-drive-embed">
          {/* Overlay blocks right-click, download button, and pop-out links */}
          <div
            className="absolute inset-0 z-10"
            style={{ pointerEvents: "none" }}
            onContextMenu={e => e.preventDefault()}
          />
          <iframe
            src={`https://drive.google.com/file/d/${driveFileId}/preview`}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          />
        </div>
      );
    }
    return (
      <div className={`relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center ${className}`} data-testid="player-processing">
        <div className="text-center space-y-3 px-6">
          <Loader size={32} className="mx-auto animate-spin text-stage-mint" />
          <p className="text-white font-medium">Video is being processed</p>
          <p className="text-xs text-stage-mutetext">
            Your upload is in the transcoding queue. This may take a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-black rounded-xl overflow-hidden group ${className}`} data-testid="player-video">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={togglePlay}
      />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="h-10 w-10 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
        </div>
      )}

      {status === "ready" && !playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          data-testid="player-play-overlay"
        >
          <div className="h-16 w-16 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint hover:scale-110 transition-transform">
            <Play size={28} fill="currentColor" />
          </div>
        </button>
      )}

      {status === "ready" && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <button onClick={togglePlay} className="text-white hover:text-stage-mint transition-colors" data-testid="player-play-btn">
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="text-white hover:text-stage-mint transition-colors" data-testid="player-mute-btn">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button onClick={toggleFullscreen} className="text-white hover:text-stage-mint transition-colors" data-testid="player-fullscreen-btn">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
