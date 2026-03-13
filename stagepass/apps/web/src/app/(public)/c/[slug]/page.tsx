"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ContentCard from "@/components/stagepass/ContentCard";
import FollowButton from "@/components/stagepass/FollowButton";
import { getCreatorBySlug, getContentByCreator, type Creator, type ContentItem } from "@/lib/firebase/firestore";
import { Users } from "lucide-react";

export default function CreatorPage() {
  const params = useParams<{ slug: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [tab, setTab] = useState<"premieres" | "live" | "radio">("premieres");

  useEffect(() => {
    if (!params.slug) return;
    (async () => {
      const [creatorRes, feedRes] = await Promise.all([
        fetch(`/api/creators?slug=${encodeURIComponent(params.slug)}`).then(r => r.json()),
        fetch(`/api/content/feed?limit=20`).then(r => r.json()), // initial fetch, filter after creator load
      ]);
      const c = creatorRes.creator || null;
      setCreator(c);
      setFollowerCount(c?.followerCount || 0);
      if (c) {
        const contentRes = await fetch(`/api/content/feed?creatorId=${c.uid}&limit=20`).then(r => r.json());
        setContent(contentRes.items || []);
      }
      setLoading(false);
    })();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold">Creator not found</h1>
        <p className="text-stage-mutetext mt-2">The channel &ldquo;{params.slug}&rdquo; does not exist.</p>
      </div>
    );
  }

  const filtered = tab === "premieres"
    ? content.filter(c => c.type === "VIDEO" || c.type === "MIX" || c.type === "AUDIO")
    : tab === "live"
    ? content.filter(c => c.type === "LIVE")
    : content.filter(c => c.type === "EPISODE");

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="h-52 rounded-3xl bg-gradient-to-r from-stage-indigo/40 to-stage-mint/20 relative border border-white/10">
        <div className="absolute -bottom-10 left-8 flex items-end gap-4">
          <div className="h-24 w-24 rounded-full bg-stage-panel border-4 border-stage-bg shadow-xl overflow-hidden flex items-center justify-center">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-stage-mint">
                {creator.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold">{creator.displayName}</h1>
            <p className="text-stage-mutetext text-sm">{creator.type || "Creator"}</p>
          </div>
        </div>
        {/* Follow button top-right */}
        <div className="absolute top-4 right-4">
          <FollowButton
            creatorId={creator.uid}
            onToggle={f => setFollowerCount(prev => f ? prev + 1 : Math.max(0, prev - 1))}
          />
        </div>
      </div>

      <div className="h-8" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-stage-mutetext text-sm">
          <Users size={15} />
          <span><strong className="text-white">{followerCount.toLocaleString()}</strong> followers</span>
        </div>
        {creator.bio && (
          <p className="text-stage-mutetext text-sm max-w-lg">{creator.bio}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 text-sm font-medium text-stage-mutetext">
        {(["premieres", "live", "radio"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 capitalize transition-colors ${tab === t ? "text-white border-b-2 border-stage-mint" : "hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stage-mutetext">No {tab} content yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(item => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              type={item.type}
              creator={{ slug: creator.slug, name: creator.displayName, id: creator.uid }}
              thumbnail={item.thumbnail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
