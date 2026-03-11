"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedSort from "@/components/stagepass/FeedSort";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { getRecentContent, ContentItem } from "@/lib/firebase/firestore";

export default function HomePage() {
  const [sort, setSort] = useState<"NEWEST" | "MOST_DISCUSSED" | "TRENDING">("NEWEST");
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getRecentContent();
      setFeed(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-stage-panel border border-white/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stage-indigo/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-stage-mint/30 bg-stage-mint/10 px-3 py-1 text-xs font-bold text-stage-mint shadow-glowMint animate-pulse">
            <span className="h-2 w-2 rounded-full bg-stage-mint" />
            LIVE NOW
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            ELECTRIC DREAMS <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">FESTIVAL 2026</span>
          </h1>
          <p className="text-lg text-stage-mutetext max-w-lg">
            Experience the future of sound. Join 45,000 others in the world's first fully immersive digital concert.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="/live">
              <Button variant="primary" size="lg" className="rounded-full px-8">
                Watch Premiere
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="rounded-full px-8">
              + Add to List
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Feed</h2>
          <FeedSort value={sort} onChange={setSort} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-stage-mutetext">Loading Stage...</div>
        ) : feed.length === 0 ? (
          <div className="text-center py-12 text-stage-mutetext border border-dashed border-white/10 rounded-xl">
            No premieres yet. Be the first to upload in the Studio!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((item) => (
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
        
        <div className="flex justify-center pt-8">
          <Button variant="ghost">Load More</Button>
        </div>
      </div>
    </div>
  );
}
