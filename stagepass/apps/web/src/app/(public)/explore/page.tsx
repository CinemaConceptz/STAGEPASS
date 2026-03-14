"use client";

import { useEffect, useState } from "react";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { clsx } from "clsx";

const CATEGORIES = ["All", "Music", "DJ Sets", "Film", "Business", "Gaming", "Previously Recorded"];

export default function ExplorePage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (activeCategory === "Previously Recorded") params.set("type", "RECORDED");
    else if (activeCategory !== "All") params.set("mood", activeCategory);
    fetch(`/api/content/feed?${params}`)
      .then(r => r.json())
      .then(d => setFeed(d.items || []))
      .catch(() => {});
  }, [activeCategory]);

  const filtered = activeCategory === "Previously Recorded"
    ? feed.filter(item => item.type === "LIVE" || item.type === "RECORDED")
    : feed;

  return (
    <div className="space-y-8" data-testid="explore-page">
      <h1 className="text-3xl font-bold">Explore</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <Button 
            key={cat} 
            variant={activeCategory === cat ? "primary" : "secondary"} 
            className="rounded-full whitespace-nowrap"
            onClick={() => setActiveCategory(cat)}
            data-testid={`category-${cat.toLowerCase().replace(/\s/g, "-")}`}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
           <div className="col-span-full text-center py-12 text-stage-mutetext" data-testid="explore-empty">
             No content in this category yet.
           </div>
        ) : (
          filtered.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              type={item.type}
              creator={{ slug: item.creatorSlug || "user", name: item.creatorName || "Creator", id: item.creatorId }}
              thumbnail={item.thumbnailUrl || item.thumbnail}
            />
          ))
        )}
      </div>
    </div>
  );
}
