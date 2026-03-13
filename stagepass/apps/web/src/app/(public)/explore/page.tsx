"use client";

import { useEffect, useState } from "react";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { getRecentContent, ContentItem } from "@/lib/firebase/firestore";
import { clsx } from "clsx";

export default function ExplorePage() {
  const categories = ["All", "Music", "DJ Sets", "Film", "Business", "Gaming"];
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/content/feed?limit=50")
      .then(r => r.json())
      .then(d => setFeed(d.items || []))
      .catch(() => {});
  }, [activeCategory]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Explore</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={activeCategory === cat ? "primary" : "secondary"} 
            className="rounded-full whitespace-nowrap"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {feed.length === 0 ? (
           <div className="col-span-full text-center py-12 text-stage-mutetext">No content in this category yet.</div>
        ) : (
          feed.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              type={item.type}
              creator={{ slug: item.creatorSlug || "user", name: item.creatorName || "Creator" }}
              thumbnail={item.thumbnail}
            />
          ))
        )}
      </div>
    </div>
  );
}
