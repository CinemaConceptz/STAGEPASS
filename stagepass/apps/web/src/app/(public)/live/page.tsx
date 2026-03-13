"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Player from "@/components/stagepass/Player";
import LiveChat from "@/components/stagepass/LiveChat";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { Video, Users } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      // Use server-side API (Admin SDK) — bypasses Firestore security rules + no index needed
      const res = await fetch("/api/live/channels");
      const data = await res.json();
      const ch: any[] = data.channels || [];
      setChannels(ch);
      setSelected((prev: any) => {
        if (prev && ch.find((c: any) => c.id === prev.id)) return prev; // keep selection
        return ch.length > 0 ? ch[0] : null;
      });
    } catch { /* silent */ }
  }, []);

  // Initial load + poll every 8 seconds for new/ended streams
  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 8000);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  // Track listener count on selection change
  useEffect(() => {
    if (!selected?.id || selected.id === prevId) return;
    if (prevId) fetch(`/api/live/channels`); // refresh on switch
    setPrevId(selected?.id || null);
  }, [selected?.id]);

  const userIsLive = !!user && channels.some((ch: any) => ch.ownerUid === user.uid);

  return (
    <div className="space-y-8" data-testid="live-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="live-heading">Live Now</h1>
        <Link href="/studio/live">
          {userIsLive ? (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
              data-testid="user-is-live-btn"
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </button>
          ) : (
            <Button variant="primary" data-testid="go-live-btn">Go Live</Button>
          )}
        </Link>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-24 space-y-4" data-testid="live-empty">
          <Video size={48} className="mx-auto text-stage-mutetext" />
          <p className="text-stage-mutetext text-lg">No live streams right now.</p>
          <Link href="/studio/live">
            <Button variant="secondary" data-testid="live-empty-cta">Be the first to go live</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {selected && (
                <>
                  <Player
                    hlsUrl={selected.playbackUrl}
                    showListenerCount
                    listenerCount={selected.listenerCount || 0}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selected.title}</h2>
                      <div className="flex items-center gap-2 text-stage-mutetext text-sm mt-1">
                        <Users size={14} />
                        <span>{(selected.listenerCount || 0).toLocaleString()} watching</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </>
              )}
            </div>

            {selected && (
              <LiveChat channelId={selected.id} className="min-h-[400px]" />
            )}
          </div>

          {channels.length > 1 && (
            <>
              <h2 className="text-xl font-bold">All Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {channels.map((ch) => (
                  <button key={ch.id} onClick={() => setSelected(ch)} className={`text-left rounded-xl transition-all ${selected?.id === ch.id ? "ring-2 ring-stage-mint" : ""}`}>
                    <ContentCard
                      id={ch.id}
                      title={ch.title}
                      type="LIVE"
                      creator={{ slug: ch.ownerSlug || "creator", name: ch.ownerName || "Creator" }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
