"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Player from "@/components/stagepass/Player";
import LiveChat from "@/components/stagepass/LiveChat";
import ContentCard from "@/components/stagepass/ContentCard";
import FollowButton from "@/components/stagepass/FollowButton";
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


  return (
    <div className="space-y-8" data-testid="live-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="live-heading">Live Now</h1>
        <Link href="/studio/live">
          <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="go-live-btn">
            Go Live
          </Button>
        </Link>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-24 space-y-4" data-testid="live-empty">
          <Video size={48} className="mx-auto text-stage-mutetext" />
          <p className="text-stage-mutetext text-lg">No live streams right now.</p>
          <Link href="/studio/live">
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" data-testid="live-empty-cta">Be the first to go live</Button>
          </Link>
          <Link href="/explore" className="block mt-4">
            <Button variant="secondary" data-testid="live-explore-btn">Browse Previously Recorded</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              {selected && (
                <>
                  <Player
                    hlsUrl={selected.playbackUrl}
                    showListenerCount
                    listenerCount={selected.listenerCount || 0}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-stage-panel border border-white/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-stage-mint">
                          {selected.ownerName?.charAt(0)?.toUpperCase() || "C"}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{selected.title}</h2>
                        <div className="flex items-center gap-2 text-stage-mutetext text-sm">
                          <span>{selected.ownerName || "Creator"}</span>
                          <span className="text-white/20">|</span>
                          <Users size={14} />
                          <span>{(selected.listenerCount || 0).toLocaleString()} watching</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selected.ownerUid && (
                        <FollowButton creatorId={selected.ownerUid} />
                      )}
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        LIVE
                      </span>
                    </div>
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
                      creator={{ slug: ch.ownerSlug || "creator", name: ch.ownerName || "Creator", id: ch.ownerUid }}
                      showFollow={false}
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
