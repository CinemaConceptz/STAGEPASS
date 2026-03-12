"use client";

import { useEffect, useState } from "react";
import ContentCard from "@/components/stagepass/ContentCard";
import Player from "@/components/stagepass/Player";
import Button from "@/components/ui/Button";
import { getLiveChannels } from "@/lib/firebase/firestore";
import { Video } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    getLiveChannels().then(ch => {
      setChannels(ch);
      if (ch.length > 0) setSelected(ch[0]);
    });
  }, []);

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
            {/* Featured Player */}
            <div className="lg:col-span-2">
              {selected && (
                <>
                  <Player hlsUrl={selected.playbackUrl} />
                  <h2 className="text-xl font-bold mt-4">{selected.title}</h2>
                  <p className="text-stage-mutetext text-sm">{selected.ownerName || "Creator"}</p>
                </>
              )}
            </div>

            {/* Live Chat */}
            <div className="bg-stage-panel rounded-xl border border-white/10 p-4 h-full min-h-[400px] flex flex-col">
              <h3 className="font-bold text-sm text-stage-mutetext mb-4 uppercase tracking-widest">Live Chat</h3>
              <div className="flex-1 space-y-3 text-sm text-white/70 overflow-y-auto">
                <p className="text-stage-mutetext italic">Chat is live. Say something.</p>
              </div>
            </div>
          </div>

          {/* Stream List */}
          <h2 className="text-xl font-bold">All Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((ch) => (
              <button key={ch.id} onClick={() => setSelected(ch)} className="text-left">
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
    </div>
  );
}
