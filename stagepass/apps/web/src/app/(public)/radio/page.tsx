"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ScheduleGrid from "@/components/radio/ScheduleGrid";
import { Play, Music2, Pause, Volume2, VolumeX, Radio, Headphones, SkipForward, Calendar, Layers } from "lucide-react";
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
  crossfadeEnabled?: boolean;
  crossfadeDuration?: number;
  moodFilter?: string[];
}

export default function RadioPage() {
  const { user } = useAuth();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const [crossfading, setCrossfading] = useState(false);

  // ── Dual-audio crossfade engine ──────────────────────────────────────────
  const audioA = useRef<HTMLAudioElement | null>(null);
  const audioB = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<"A" | "B">("A");
  const nowRef = useRef<any>(null);
  const stationIdRef = useRef<string | null>(null);
  const stationsRef = useRef<RadioStation[]>([]);
  const crossfadingRef = useRef(false);
  const fadeSecsRef = useRef(0);
  const mutedRef = useRef(false);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { stationsRef.current = stations; }, [stations]);

  const getActive = () => activeRef.current === "A" ? audioA.current : audioB.current;
  const getIdle = () => activeRef.current === "A" ? audioB.current : audioA.current;

  const fetchNowPlaying = useCallback(async (stationId: string) => {
    try {
      const res = await fetch(`/api/radio/station/now?stationId=${stationId}`);
      const data = await res.json();
      if (!data.success || !data.nowPlaying) return;
      const st = stationsRef.current.find(s => s.id === stationId);
      const slot = st?.schedule ? getActiveScheduleSlot(st.schedule) : null;
      const np = { ...data.nowPlaying, stationName: st?.name, showName: slot?.showName, mode: slot ? "SCHEDULED" : "AUTO_DJ" };
      setNowPlaying(np);
      nowRef.current = np;
    } catch { /* silent */ }
  }, []);

  const beginCrossfade = useCallback(() => {
    if (crossfadingRef.current || !nowRef.current?.nextTrack) return;
    crossfadingRef.current = true;
    setCrossfading(true);
    const current = getActive();
    const idle = getIdle();
    if (!current || !idle) { crossfadingRef.current = false; setCrossfading(false); return; }
    idle.src = nowRef.current.nextTrack.url;
    idle.volume = 0;
    idle.muted = mutedRef.current;
    idle.play().catch(() => { crossfadingRef.current = false; setCrossfading(false); });
    const STEPS = 30;
    const stepMs = (fadeSecsRef.current * 1000) / STEPS;
    let step = 0;
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = setInterval(() => {
      step++;
      if (current) current.volume = Math.max(0, 1 - step / STEPS);
      idle.volume = Math.min(1, step / STEPS);
      if (step >= STEPS) {
        clearInterval(fadeTimerRef.current!);
        if (current) { current.pause(); current.src = ""; current.volume = 1; }
        activeRef.current = activeRef.current === "A" ? "B" : "A";
        crossfadingRef.current = false;
        setCrossfading(false);
        if (stationIdRef.current) fetchNowPlaying(stationIdRef.current);
      }
    }, stepMs);
  }, [fetchNowPlaying]);

  // Setup audio elements on mount
  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    const onTimeUpdate = (audio: HTMLAudioElement) => {
      if (crossfadingRef.current || !nowRef.current?.nextTrack || fadeSecsRef.current <= 0) return;
      if (isNaN(audio.duration) || audio.duration <= 0) return;
      const rem = audio.duration - audio.currentTime;
      if (rem > 0 && rem <= fadeSecsRef.current + 0.5) beginCrossfade();
    };
    const onEnded = () => { if (!crossfadingRef.current && stationIdRef.current) playStation(stationIdRef.current, true); };
    audioA.current.addEventListener("timeupdate", () => onTimeUpdate(audioA.current!));
    audioB.current.addEventListener("timeupdate", () => onTimeUpdate(audioB.current!));
    audioA.current.addEventListener("ended", onEnded);
    audioB.current.addEventListener("ended", onEnded);
    return () => { audioA.current?.pause(); audioB.current?.pause(); };
  }, [beginCrossfade]);

  useEffect(() => {
    mutedRef.current = muted;
    const a = getActive();
    if (a) a.muted = muted;
  }, [muted]);

  const playStation = useCallback(async (id: string, resume = false) => {
    if (!resume && activeStation === id) {
      const a = getActive();
      if (playing) { a?.pause(); setPlaying(false); } else { a?.play().catch(() => {}); setPlaying(true); }
      return;
    }
    if (!resume) {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      audioA.current?.pause(); audioB.current?.pause();
      if (audioA.current) { audioA.current.src = ""; audioA.current.volume = 1; }
      if (audioB.current) { audioB.current.src = ""; audioB.current.volume = 1; }
      activeRef.current = "A";
      crossfadingRef.current = false;
      stationIdRef.current = id;
      const st = stationsRef.current.find(s => s.id === id);
      fadeSecsRef.current = st?.crossfadeEnabled ? (st.crossfadeDuration ?? 3) : 0;
      setActiveStation(id);
      setNowPlaying(null);
      setPlaying(false);
    }
    try {
      const res = await fetch(`/api/radio/station/now?stationId=${id}`);
      const data = await res.json();
      if (!data.success || !data.nowPlaying) return;
      const st = stationsRef.current.find(s => s.id === id);
      const slot = st?.schedule ? getActiveScheduleSlot(st.schedule) : null;
      const np = { ...data.nowPlaying, stationName: st?.name, showName: slot?.showName, mode: slot ? "SCHEDULED" : "AUTO_DJ" };
      setNowPlaying(np);
      nowRef.current = np;
      if (!resume) {
        const audio = getActive()!;
        audio.src = data.nowPlaying.track.url;
        audio.currentTime = data.nowPlaying.offsetMs / 1000;
        audio.volume = 1;
        audio.muted = mutedRef.current;
        await audio.play().catch(() => {});
        setPlaying(true);
      }
    } catch { /* silent */ }
  }, [activeStation, playing]);

  const skipTrack = useCallback(() => {
    if (!nowRef.current?.nextTrack) return;
    if (fadeSecsRef.current > 0) { beginCrossfade(); return; }
    const audio = getActive();
    if (audio) { audio.src = nowRef.current.nextTrack.url; audio.currentTime = 0; audio.volume = 1; audio.play().catch(() => {}); }
    if (stationIdRef.current) fetchNowPlaying(stationIdRef.current);
  }, [beginCrossfade, fetchNowPlaying]);

  // Fetch stations via Admin SDK server API (bypasses Firestore security rules)
  useEffect(() => {
    fetch("/api/radio/stations")
      .then(r => r.json())
      .then(d => { setStations(d.stations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featuredStation = stations.find(s => s.featured) || stations[0];
  const regularStations = stations.filter(s => s.id !== featuredStation?.id);
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
