"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Player from "@/components/stagepass/Player";
import LiveChat from "@/components/stagepass/LiveChat";
import ContentCard from "@/components/stagepass/ContentCard";
import FollowButton from "@/components/stagepass/FollowButton";
import Button from "@/components/ui/Button";
import { Video, Users, Radio } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);

  // Derive whether the current user is actively streaming
  const userActiveChannel = user ? channels.find((c: any) => c.ownerUid === user.uid) : null;
  const isUserLive = !!userActiveChannel;

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/live/channels");
      const data = await res.json();
      const ch: any[] = data.channels || [];
      setChannels(ch);
      setSelected((prev: any) => {
        if (prev && ch.find((c: any) => c.id === prev.id)) return prev;
        return ch.length > 0 ? ch[0] : null;
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 8000);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  useEffect(() => {
    if (!selected?.id || selected.id === prevId) return;
    if (prevId) fetch(`/api/live/channels`);
    setPrevId(selected?.id || null);
  }, [selected?.id]);

  // Go Live / End Stream button — green when not live, red when live
  const GoLiveButton = () => isUserLive ? (
    <button
      onClick={async () => {
        if (!user || !userActiveChannel) return;
        try {
          const token = await user.getIdToken();
          await fetch("/api/live/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ channelId: userActiveChannel.id, action: "END" }),
          });
          await fetchChannels();
        } catch { /* silent */ }
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
      data-testid="end-live-btn"
    >
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      LIVE — End Stream
    </button>
  ) : (
    <Link href="/studio/live">
      <Button
        variant="primary"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        data-testid="go-live-btn"
      >
        Go Live
      </Button>
    </Link>
  );

  return (
    <div className="space-y-8" data-testid="live-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="live-heading">Live Now</h1>
        {user && <GoLiveButton />}
        {!user && (
          <Link href="/signup">
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="go-live-signup-btn">
              Go Live
            </Button>
          </Link>
        )}
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-24 space-y-4" data-testid="live-empty">
          <Radio size={48} className="mx-auto text-stage-mutetext" />
          <p className="text-stage-mutetext text-lg">No live streams happening right now.</p>
          <p className="text-stage-mutetext text-sm">Be the first to go live — your audience is waiting.</p>
          {user ? (
            <Link href="/studio/live">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" data-testid="live-empty-cta">
                Start Broadcasting
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" data-testid="live-empty-cta">
                Sign Up &amp; Go Live
              </Button>
            </Link>
          )}
          <Link href="/explore" className="block mt-2">
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
              <h2 className="text-xl font-bold">All Live Streams</h2>
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
