"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedSort from "@/components/stagepass/FeedSort";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { getRecentContent, ContentItem } from "@/lib/firebase/firestore";
import { Play } from "lucide-react";

export default function HomePage() {
  const [sort, setSort] = useState<"NEWEST" | "MOST_DISCUSSED" | "TRENDING">("NEWEST");
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroContent, setHeroContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getRecentContent();
      setFeed(data);
      if (data.length > 0) {
        const hero = data.find(c => c.thumbnail || c.thumbnailUrl) || data[0];
        setHeroContent(hero);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      {heroContent ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0d2e] via-stage-panel to-stage-panel border border-white/5" data-testid="hero-section">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-10 space-y-5 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-stage-mint/30 bg-stage-mint/10 px-3 py-1 text-xs font-bold text-stage-mint w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-stage-mint" />
                LATEST PREMIERE
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight" data-testid="hero-title">
                {heroContent.title}
              </h1>
              <p className="text-sm text-zinc-400">
                by <span className="text-white font-semibold">{heroContent.creatorName}</span>
                {heroContent.viewCount ? ` — ${heroContent.viewCount.toLocaleString()} views` : ""}
              </p>
              <Link href={`/content/${heroContent.id}`}>
                <Button variant="primary" size="lg" className="rounded-xl px-8" data-testid="hero-watch-btn">
                  <Play size={16} className="mr-2" fill="currentColor" /> Watch Now
                </Button>
              </Link>
            </div>
            <div className="relative h-56 lg:h-auto">
              {(heroContent.thumbnail || heroContent.thumbnailUrl) ? (
                <img src={heroContent.thumbnail || heroContent.thumbnailUrl} alt={heroContent.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stage-indigo/20 to-transparent flex items-center justify-center">
                  <Play size={48} className="text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-stage-panel via-stage-panel/60 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-stage-panel border border-white/5 p-10">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-28 bg-white/5 rounded" />
            <div className="h-10 w-3/4 bg-white/5 rounded" />
            <div className="h-4 w-1/3 bg-white/5 rounded" />
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0d2e] via-stage-panel to-stage-panel border border-white/5 p-8 lg:p-10" data-testid="hero-section">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-stage-mint/30 bg-stage-mint/10 px-3 py-1 text-xs font-bold text-stage-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-stage-mint" />
              WELCOME
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              STAGEPASS
            </h1>
            <p className="text-sm text-zinc-400 max-w-md">
              The creator-first platform. Upload, stream, and premiere your content. No algorithms, no suppression.
            </p>
            <div className="flex gap-3 pt-1">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="rounded-xl px-8">Get Started</Button>
              </Link>
              <Link href="/explore">
                <Button variant="secondary" size="lg" className="rounded-xl px-8">Explore</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-5" data-testid="feed-section">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Your Feed</h2>
          <FeedSort value={sort} onChange={setSort} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">
            <div className="h-7 w-7 mx-auto border-2 border-white/10 border-t-stage-mint rounded-full animate-spin mb-3" />
            Loading...
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 border border-dashed border-white/5 rounded-xl" data-testid="feed-empty">
            No premieres yet. Be the first to upload in the Studio!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="feed-grid">
            {feed.filter(item => item.id !== heroContent?.id).map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                type={item.type}
                creator={{ slug: item.creatorSlug || "user", name: item.creatorName || "Creator" }}
                thumbnail={item.thumbnail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
