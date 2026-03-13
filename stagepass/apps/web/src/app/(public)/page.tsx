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
      // Hero = most recent video, rotates every 5 days naturally as new content is uploaded
      if (data.length > 0) {
        // Pick the most recent item with a thumbnail as hero
        const hero = data.find(c => c.thumbnail || c.thumbnailUrl) || data[0];
        setHeroContent(hero);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero - Most Recent Content */}
      {heroContent ? (
        <div className="relative overflow-hidden rounded-3xl bg-stage-panel border border-white/10" data-testid="hero-section">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-stage-mint/30 bg-stage-mint/10 px-3 py-1 text-xs font-bold text-stage-mint shadow-glowMint w-fit">
                <span className="h-2 w-2 rounded-full bg-stage-mint" />
                LATEST PREMIERE
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight" data-testid="hero-title">
                {heroContent.title}
              </h1>
              <p className="text-base text-stage-mutetext">
                by <span className="text-white font-semibold">{heroContent.creatorName}</span>
                {heroContent.viewCount ? ` — ${heroContent.viewCount.toLocaleString()} views` : ""}
              </p>
              <div className="flex gap-4 pt-2">
                <Link href={`/content/${heroContent.id}`}>
                  <Button variant="primary" size="lg" className="rounded-full px-8" data-testid="hero-watch-btn">
                    <Play size={18} className="mr-2" fill="currentColor" /> Watch Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-64 lg:h-auto">
              {(heroContent.thumbnail || heroContent.thumbnailUrl) ? (
                <img
                  src={heroContent.thumbnail || heroContent.thumbnailUrl}
                  alt={heroContent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stage-indigo/30 to-stage-mint/10 flex items-center justify-center">
                  <Play size={64} className="text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-stage-panel via-stage-panel/50 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="relative overflow-hidden rounded-3xl bg-stage-panel border border-white/10 p-8 md:p-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-12 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-stage-panel border border-white/10 p-8 md:p-12" data-testid="hero-section">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stage-indigo/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-stage-mint/30 bg-stage-mint/10 px-3 py-1 text-xs font-bold text-stage-mint shadow-glowMint animate-pulse">
              <span className="h-2 w-2 rounded-full bg-stage-mint" />
              WELCOME
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              STAGEPASS
            </h1>
            <p className="text-lg text-stage-mutetext max-w-lg">
              The creator-first platform. Upload, stream, and premiere your content. No algorithms, no suppression.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="rounded-full px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="secondary" size="lg" className="rounded-full px-8">
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Feed Section */}
      <div className="space-y-6" data-testid="feed-section">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Feed</h2>
          <FeedSort value={sort} onChange={setSort} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-stage-mutetext">
            <div className="h-8 w-8 mx-auto border-2 border-white/20 border-t-stage-mint rounded-full animate-spin mb-3" />
            Loading Stage...
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-12 text-stage-mutetext border border-dashed border-white/10 rounded-xl" data-testid="feed-empty">
            No premieres yet. Be the first to upload in the Studio!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="feed-grid">
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
