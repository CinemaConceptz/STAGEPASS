"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ScheduleGrid from "@/components/radio/ScheduleGrid";
import { Play, Music2, Pause, Volume2, VolumeX, Star, Radio, Headphones, SkipForward, Shuffle, Calendar, Zap } from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { ScheduleSlot, getActiveScheduleSlot } from "@/lib/radio/scheduler";

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  description?: string;
  artworkUrl?: string;
  trackCount?: number;
  featured?: boolean;
  ownerName?: string;
  listenerCount?: number;
  schedule?: ScheduleSlot[];
  autoDjEnabled?: boolean;
  autoDjShuffle?: boolean;
}

export default function RadioPage() {
  const { user } = useAuth();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const featuredStation = stations.find(s => s.featured) || stations[0];
  const regularStations = stations.filter(s => s.id !== featuredStation?.id);

  useEffect(() => {
    const fetchStations = async () => {
      if (!db) { setLoading(false); return; }
      try {
        const q = query(collection(db, "radioStations"), limit(20));
        const snap = await Promise.race([
          getDocs(q),
          new Promise<any>((resolve) => setTimeout(() => resolve({ docs: [] }), 8000))
        ]);
        setStations(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchStations();
  }, []);

  const playStation = async (id: string) => {
    if (activeStation === id) {
      audioRef.current?.pause();
      setActiveStation(null);
      setNowPlaying(null);
      return;
    }

    setActiveStation(id);
    try {
      const res = await fetch(`/api/radio/station/now?stationId=${id}`);
      const data = await res.json();
      if (data.success && data.nowPlaying) {
        const station = stations.find(s => s.id === id);
        const activeSlot = station?.schedule ? getActiveScheduleSlot(station.schedule) : null;
        setNowPlaying({
          ...data.nowPlaying,
          stationName: station?.name,
          showName: activeSlot?.showName,
          mode: activeSlot ? "SCHEDULED" : "AUTO_DJ",
        });
        if (audioRef.current) {
          audioRef.current.src = data.nowPlaying.track.url;
          const offsetSec = data.nowPlaying.offsetMs / 1000;
          audioRef.current.currentTime = offsetSec;
          audioRef.current.play();
        }
      }
    } catch (e) { console.error(e); }
  };

  const skipTrack = () => {
    if (activeStation && nowPlaying?.nextTrack) {
      setNowPlaying((prev: any) => ({ ...prev, track: prev.nextTrack }));
      if (audioRef.current) {
        audioRef.current.src = nowPlaying.nextTrack.url;
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter" data-testid="radio-heading">
          STAGEPASS <span className="text-stage-indigo">RADIO</span>
        </h1>
        <p className="text-lg text-stage-mutetext max-w-lg mx-auto">
          Global Creator Broadcast Network. Tune in live or let Auto-DJ keep the music flowing.
        </p>
        {!user ? (
          <Link href="/signup">
            <Button variant="primary" size="lg" className="rounded-full px-8 mt-4" data-testid="radio-signup-btn">
              <Headphones className="mr-2 h-5 w-5" /> Start Your Radio Show Today
            </Button>
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link href="/studio/radio">
              <Button variant="primary" size="lg" className="rounded-full px-8" data-testid="radio-create-btn">
                <Radio className="mr-2 h-5 w-5" /> Launch Station
              </Button>
            </Link>
            <Link href="/studio/radio/schedule">
              <Button variant="secondary" size="lg" className="rounded-full px-8" data-testid="radio-schedule-btn">
                <Calendar className="mr-2 h-5 w-5" /> Manage Schedule
              </Button>
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-stage-mutetext">
          <div className="h-10 w-10 mx-auto border-2 border-white/20 border-t-stage-mint rounded-full animate-spin mb-4" />
          Loading stations...
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Radio size={56} className="mx-auto text-stage-mutetext/30" />
          <p className="text-xl text-stage-mutetext">No radio stations are live right now.</p>
          <Link href={user ? "/studio/radio" : "/signup"}>
            <Button variant="secondary" size="lg" className="mt-4" data-testid="radio-empty-cta">
              {user ? "Create Your Station" : "Sign Up Now"}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Station */}
          {featuredStation && (
            <div
              className="relative bg-gradient-to-br from-stage-indigo/20 via-stage-panel to-stage-mint/10 border border-white/10 rounded-3xl p-8 md:p-12 hover:border-stage-mint/40 transition-all group overflow-hidden"
              data-testid="radio-featured-station"
            >
              {activeStation === featuredStation.id && (
                <div className="absolute inset-0 bg-stage-mint/5 pointer-events-none animate-pulse" />
              )}
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Station of the Month</span>
              </div>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div
                  className="h-32 w-32 md:h-40 md:w-40 bg-black/40 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden cursor-pointer"
                  onClick={() => playStation(featuredStation.id)}
                >
                  {featuredStation.artworkUrl ? (
                    <img src={featuredStation.artworkUrl} alt={featuredStation.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music2 size={48} className="text-stage-mutetext/30" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-16 w-16 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint">
                      {activeStation === featuredStation.id ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full text-stage-mint uppercase">{featuredStation.genre}</span>
                  <h2 className="text-3xl md:text-4xl font-black">{featuredStation.name}</h2>
                  <p className="text-stage-mutetext max-w-lg">{featuredStation.description || "Tune in for the best vibes."}</p>
                  <div className="flex items-center gap-4 text-xs text-stage-mutetext">
                    <span>{featuredStation.trackCount || 0} tracks</span>
                    {featuredStation.autoDjEnabled !== false && (
                      <span className="flex items-center gap-1 text-stage-mint"><Zap size={12} /> Auto-DJ</span>
                    )}
                  </div>
                  {/* Inline Schedule */}
                  {featuredStation.schedule && featuredStation.schedule.length > 0 && (
                    <div className="mt-4 bg-black/20 rounded-xl p-4">
                      <ScheduleGrid schedule={featuredStation.schedule} stationName={featuredStation.name} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Station Grid */}
          {regularStations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">All Stations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="radio-station-grid">
                {regularStations.map((station) => (
                  <div key={station.id} className="bg-stage-panel border border-white/10 rounded-2xl p-5 hover:border-stage-mint/50 transition-all group relative overflow-hidden" data-testid={`radio-station-${station.id}`}>
                    {activeStation === station.id && <div className="absolute inset-0 bg-stage-mint/5 pointer-events-none animate-pulse" />}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-stage-mint uppercase">{station.genre}</span>
                      <div className="flex items-center gap-2">
                        {station.autoDjEnabled !== false && <Zap size={12} className="text-stage-mint" />}
                        {activeStation === station.id && <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
                      </div>
                    </div>

                    <div
                      className="aspect-square bg-black/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden cursor-pointer"
                      onClick={() => playStation(station.id)}
                    >
                      {station.artworkUrl ? (
                        <img src={station.artworkUrl} alt={station.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 size={40} className="text-stage-mutetext/20" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-14 w-14 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint">
                          {activeStation === station.id ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg">{station.name}</h3>
                    <p className="text-sm text-stage-mutetext mt-1">{station.trackCount || 0} tracks</p>

                    {/* Schedule toggle */}
                    {station.schedule && station.schedule.length > 0 && (
                      <button
                        onClick={() => setExpandedSchedule(expandedSchedule === station.id ? null : station.id)}
                        className="mt-2 text-xs text-stage-mint hover:underline flex items-center gap-1"
                        data-testid={`station-schedule-toggle-${station.id}`}
                      >
                        <Calendar size={12} /> {expandedSchedule === station.id ? "Hide" : "Show"} Schedule
                      </button>
                    )}
                    {expandedSchedule === station.id && station.schedule && (
                      <div className="mt-3 bg-black/20 rounded-xl p-3">
                        <ScheduleGrid schedule={station.schedule} stationName={station.name} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mini Player */}
      {activeStation && nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-stage-panel/95 backdrop-blur-xl border-t border-white/10 p-4 z-50 shadow-2xl" data-testid="radio-mini-player">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="h-12 w-12 bg-stage-mint rounded-lg flex items-center justify-center text-black font-bold shrink-0">
                <Music2 size={20} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate" data-testid="mini-player-track">
                  {nowPlaying.track?.title || "Unknown Track"}
                  {nowPlaying.track?.artist ? ` — ${nowPlaying.track.artist}` : ""}
                </p>
                <p className="text-xs text-stage-mutetext truncate flex items-center gap-2">
                  <span className="uppercase tracking-widest">{nowPlaying.stationName || "On Air"}</span>
                  {nowPlaying.mode === "AUTO_DJ" && (
                    <span className="inline-flex items-center gap-1 text-stage-mint"><Zap size={10} /> Auto-DJ</span>
                  )}
                  {nowPlaying.showName && (
                    <span className="text-stage-indigo">{nowPlaying.showName}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => { if (audioRef.current) audioRef.current.muted = !muted; setMuted(!muted); }} className="text-stage-mutetext hover:text-white transition-colors p-2" data-testid="mini-player-mute">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button onClick={skipTrack} className="text-stage-mutetext hover:text-white transition-colors p-2" data-testid="mini-player-skip">
                <SkipForward size={20} />
              </button>
              <button onClick={() => playStation(activeStation)} className="bg-white text-black rounded-full p-2.5 hover:scale-110 transition-transform" data-testid="mini-player-pause">
                <Pause size={18} fill="currentColor" />
              </button>
            </div>
          </div>
          <audio ref={audioRef} onEnded={() => { if (activeStation) playStation(activeStation); }} />
        </div>
      )}
    </div>
  );
}
