"use client";

import { useEffect, useState } from "react";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";
import { getRecentContent, ContentItem } from "@/lib/firebase/firestore";

export default function ExplorePage() {
  const categories = ["Music", "DJ Sets", "Film", "Business", "Gaming"];
  const [feed, setFeed] = useState<ContentItem[]>([]);

  useEffect(() => {
    getRecentContent().then(setFeed);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Explore</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <Button variant="primary" className="rounded-full">All</Button>
        {categories.map(cat => (
          <Button key={cat} variant="secondary" className="rounded-full whitespace-nowrap">
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
}
