"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Settings } from "lucide-react";

interface PlayerProps {
  hlsUrl?: string;
  contentId?: string;
  showListenerCount?: boolean;
  listenerCount?: number;
}

export default function Player({ hlsUrl, contentId, showListenerCount, listenerCount }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>(hlsUrl);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [qualities, setQualities] = useState<{ id: number; height: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useEffect(() => {
    if (!contentId) { setPlaybackUrl(hlsUrl); return; }
    setLoadingUrl(true);
    fetch(`/api/content/${contentId}/signed-url`)
      .then(r => r.json())
      .then(data => {
        setPlaybackUrl(data.url || hlsUrl);
        setLoadingUrl(false);
      })
      .catch(() => {
        setPlaybackUrl(hlsUrl);
        setLoadingUrl(false);
      });
  }, [contentId, hlsUrl]);

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;
    const video = videoRef.current;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        capLevelToPlayerSize: true,
        abrEwmaDefaultEstimate: 500000,
      });
      hlsRef.current = hls;
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level, idx) => ({
          id: idx,
          height: level.height,
          label: level.height ? `${level.height}p` : `Level ${idx}`,
        }));
        setQualities(levels);
        setCurrentQuality(-1);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setErr("Playback error. Check the stream URL.");
      });

      return () => {
        hlsRef.current = null;
        hls.destroy();
      };
    }

    setErr("HLS not supported in this browser.");
  }, [playbackUrl]);

  const switchQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId; // -1 = auto
    }
    setCurrentQuality(levelId);
    setShowQualityMenu(false);
  };

  if (loadingUrl || (!playbackUrl && !err)) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center flex-col gap-2 text-stage-mutetext">
        <div className="h-10 w-10 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading Stage...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group" data-testid="video-player">
      <video ref={videoRef} controls playsInline className="w-full h-full object-contain" />

      {/* Quality Selector */}
      {qualities.length > 1 && (
        <div className="absolute bottom-14 right-3 z-10">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="bg-black/60 backdrop-blur-sm px-2 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-black/80 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
            data-testid="quality-selector-btn"
          >
            <Settings size={14} />
            {currentQuality === -1 ? "Auto" : qualities.find(q => q.id === currentQuality)?.label}
          </button>
          {showQualityMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-black/90 backdrop-blur-xl rounded-lg overflow-hidden border border-white/10 shadow-2xl min-w-[120px]" data-testid="quality-menu">
              <button
                onClick={() => switchQuality(-1)}
                className={`block w-full text-left px-3 py-2 text-xs hover:bg-white/10 ${currentQuality === -1 ? "text-stage-mint font-bold" : "text-white"}`}
              >
                Auto (ABR)
              </button>
              {qualities.map((q) => (
                <button
                  key={q.id}
                  onClick={() => switchQuality(q.id)}
                  className={`block w-full text-left px-3 py-2 text-xs hover:bg-white/10 ${currentQuality === q.id ? "text-stage-mint font-bold" : "text-white"}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showListenerCount && listenerCount !== undefined && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold" data-testid="listener-count">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          {listenerCount.toLocaleString()} watching
        </div>
      )}
      {err && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 font-mono text-sm px-4 text-center" data-testid="player-error">
          {err}
        </div>
      )}
    </div>
  );
}
