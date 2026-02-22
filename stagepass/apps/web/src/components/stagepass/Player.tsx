"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Card from "@/components/ui/Card";

export default function Player({ hlsUrl }: { hlsUrl?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        capLevelToPlayerSize: true
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setErr("Playback error. Try again.");
      });
      return () => hls.destroy();
    }

    setErr("HLS not supported in this browser.");
  }, [hlsUrl]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {!hlsUrl ? (
        <div className="w-full h-full flex items-center justify-center text-stage-mutetext flex-col gap-2">
          <div className="h-10 w-10 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest">Loading Stage...</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full object-contain"
          poster="/poster-placeholder.jpg" 
        />
      )}
      {err && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 font-mono text-sm">
          {err}
        </div>
      )}
    </div>
  );
}