"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Player from "@/components/stagepass/Player";
import LiveChat from "@/components/stagepass/LiveChat";
import Button from "@/components/ui/Button";
import { Video, Users, Radio } from "lucide-react";
import Link from "next/link";

export default function WatchChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId || !db) return;
    getDoc(doc(db, "liveChannels", channelId)).then((snap) => {
      if (snap.exists()) setChannel({ id: snap.id, ...snap.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [channelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-stage-mutetext">
        Loading stream...
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-24 space-y-4">
        <Video size={48} className="mx-auto text-stage-mutetext" />
        <p className="text-stage-mutetext text-lg">Stream not found or has ended.</p>
        <Link href="/live"><Button variant="secondary">See All Live Streams</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="watch-channel-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Player
            hlsUrl={channel.playbackUrl}
            showListenerCount
            listenerCount={channel.listenerCount || 0}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{channel.title}</h1>
              <div className="flex items-center gap-2 text-stage-mutetext text-sm mt-1">
                <Users size={14} />
                <span>{(channel.listenerCount || 0).toLocaleString()} watching</span>
              </div>
            </div>
            {channel.status === "LIVE" ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-stage-mutetext bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Radio size={12} />
                ENDED
              </span>
            )}
          </div>
        </div>

        <LiveChat channelId={channelId} className="min-h-[400px]" />
      </div>
    </div>
  );
}
