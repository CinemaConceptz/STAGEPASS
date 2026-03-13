"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface PlayerProps {
  hlsUrl?: string;
  contentId?: string;
  showListenerCount?: boolean;
  listenerCount?: number;
}

export default function Player({ hlsUrl, contentId, showListenerCount, listenerCount }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>(hlsUrl);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    // If a contentId is provided, fetch a fresh (optionally signed) URL
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
      const hls = new Hls({ lowLatencyMode: true, capLevelToPlayerSize: true });
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setErr("Playback error. Check the stream URL.");
      });
      return () => hls.destroy();
    }

    setErr("HLS not supported in this browser.");
  }, [playbackUrl]);

  if (loadingUrl || (!playbackUrl && !err)) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center flex-col gap-2 text-stage-mutetext">
        <div className="h-10 w-10 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading Stage...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <video ref={videoRef} controls playsInline className="w-full h-full object-contain" />
      {showListenerCount && listenerCount !== undefined && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          {listenerCount.toLocaleString()} watching
        </div>
      )}
      {err && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 font-mono text-sm px-4 text-center">
          {err}
        </div>
      )}
    </div>
  );
}
