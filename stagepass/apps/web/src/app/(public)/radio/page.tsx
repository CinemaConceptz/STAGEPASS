"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Play, Music2 } from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function RadioPage() {
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stations
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stage-mutetext">
            Initializing satellite uplink... (No stations yet)
          </div>
        ) : (
          stations.map((station) => (
            <div key={station.id} className="bg-stage-panel border border-white/10 rounded-2xl p-6 hover:border-stage-mint/50 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-stage-mint uppercase">
                  {station.genre}
                </span>
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              
              <div className="aspect-square bg-black/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                <Music2 size={48} className="text-stage-mutetext/20" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint">
                    <Play fill="currentColor" />
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-xl">{station.name}</h3>
              <p className="text-sm text-stage-mutetext">{station.trackCount || 0} tracks queued</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
