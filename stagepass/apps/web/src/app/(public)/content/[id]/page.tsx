"use client";

import { useEffect, useState } from "react";
import Player from "@/components/stagepass/Player";
import LiveChat from "@/components/stagepass/LiveChat";
import FollowButton from "@/components/stagepass/FollowButton";
import { getContentById, incrementViewCount, trackListener, type ContentItem } from "@/lib/firebase/firestore";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function ContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    fetch(`/api/content/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setContent(data.item || null);
        setViewCount(data.item?.viewCount || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // Track view + listener count
  useEffect(() => {
    if (!content?.id) return;
    incrementViewCount(content.id);
    setViewCount(v => v + 1);
    trackListener("content", content.id, 1);
    return () => { trackListener("content", content.id!, -1); };
  }, [content?.id]);

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
    </div>
  );
  if (!content) return <div className="text-center py-24"><h1 className="text-2xl font-bold">Content not found.</h1></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Player + Info */}
      <div className="lg:col-span-2 space-y-6">
        <Player
          hlsUrl={content.playbackUrl}
          contentId={params.id}
          showListenerCount={false}
        />

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{content.title}</h1>

          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-stage-panel border border-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-stage-mint">
                  {content.creatorName?.charAt(0)?.toUpperCase() || "C"}
                </span>
              </div>
              <div>
                <Link href={`/c/${content.creatorSlug}`} className="font-bold text-sm hover:text-stage-mint transition-colors">
                  {content.creatorName}
                </Link>
                <p className="text-xs text-stage-mutetext">Creator</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-stage-mutetext text-sm">
                <Eye size={14} />
                <span>{viewCount.toLocaleString()} views</span>
              </div>
              {content.creatorId && (
                <FollowButton creatorId={content.creatorId} />
              )}
            </div>
          </div>

          <p className="text-stage-mutetext text-sm">
            Uploaded {new Date(content.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Live Chat */}
      <div>
        <LiveChat channelId={params.id} className="h-full min-h-[500px]" />
      </div>
    </div>
  );
}
