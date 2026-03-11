"use client";

import { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { Play, Music2, Pause, Volume2 } from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function RadioPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, "radioStations"), limit(10));
        const snap = await getDocs(q);
        setStations(snap.docs.map(d => ({id: d.id, ...d.data()})));
      } catch (e) {
        console.error(e);
      }
    };
    fetchStations();
  }, []);

  const playStation = async (id: string) => {
    if (activeStation === id) {
      audioRef.current?.pause();
      setActiveStation(null);
      return;
    }

    setActiveStation(id);
    
    // Call Auto-DJ API
    const res = await fetch(`/api/radio/station/now?stationId=${id}`);
    const data = await res.json();

    if (data.success && data.nowPlaying) {
      setNowPlaying(data.nowPlaying);
      if (audioRef.current) {
        audioRef.current.src = data.nowPlaying.track.url;
        // Sync Logic: Jump to current offset
        const offsetSec = data.nowPlaying.offsetMs / 1000;
        audioRef.current.currentTime = offsetSec;
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
          STAGEPASS <span className="text-stage-indigo">LIVE</span>
        </h1>
        <p className="text-xl text-stage-mutetext">
          Global Creator Broadcast Network.
        </p>
      </div>

      {/* Mini Player */}
      {activeStation && nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-stage-panel border-t border-white/10 p-4 z-50 flex items-center justify-between px-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-stage-mint rounded flex items-center justify-center text-black font-bold animate-pulse">
              <Music2 />
            </div>
            <div>
              <p className="font-bold text-white">{nowPlaying.track.title}</p>
              <p className="text-xs text-stage-mutetext uppercase tracking-widest">On Air</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => playStation(activeStation)} className="bg-white text-black rounded-full p-2 hover:scale-110 transition-transform">
               <Pause fill="currentColor" />
             </button>
             <Volume2 className="text-stage-mutetext" />
          </div>
          <audio ref={audioRef} onEnded={() => playStation(activeStation)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station) => (
          <div key={station.id} onClick={() => playStation(station.id)} className="bg-stage-panel border border-white/10 rounded-2xl p-6 hover:border-stage-mint/50 transition-all group cursor-pointer relative overflow-hidden">
            {activeStation === station.id && (
              <div className="absolute inset-0 bg-stage-mint/5 pointer-events-none animate-pulse" />
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-stage-mint uppercase">
                {station.genre}
              </span>
              {activeStation === station.id && <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
            </div>
            
            <div className="aspect-square bg-black/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
              <Music2 size={48} className="text-stage-mutetext/20" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-14 w-14 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint">
                  {activeStation === station.id ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                </div>
              </div>
            </div>

            <h3 className="font-bold text-xl">{station.name}</h3>
            <p className="text-sm text-stage-mutetext">{station.trackCount || 0} tracks queued</p>
          </div>
        ))}
      </div>
    </div>
  );
}
