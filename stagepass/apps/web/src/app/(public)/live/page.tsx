"use client";

import { useEffect, useState } from "react";
import Player from "@/components/stagepass/Player";
import LiveChat from "@/components/stagepass/LiveChat";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { getLiveChannels, trackListener } from "@/lib/firebase/firestore";
import { Video, Users } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);

  useEffect(() => {
    getLiveChannels().then(ch => {
      setChannels(ch);
      if (ch.length > 0) setSelected(ch[0]);
    });
  }, []);

  // Track listener count
  useEffect(() => {
    if (selected?.id === prevId) return;
    if (prevId) trackListener("liveChannels", prevId, -1);
    if (selected?.id) trackListener("liveChannels", selected.id, 1);
    setPrevId(selected?.id || null);
    return () => {
      if (selected?.id) trackListener("liveChannels", selected.id, -1);
    };
  }, [selected?.id]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Now</h1>
        <Link href="/studio/live">
          <Button variant="primary">Go Live</Button>
        </Link>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Video size={48} className="mx-auto text-stage-mutetext" />
          <p className="text-stage-mutetext text-lg">No live streams right now.</p>
          <Link href="/studio/live">
            <Button variant="secondary">Be the first to go live</Button>
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
