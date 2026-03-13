"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import FollowButton from "./FollowButton";
import { Play, Music2 } from "lucide-react";

interface ContentCardProps {
  id: string;
  title: string;
  type: string;
  creator: { slug: string; name: string; id?: string };
  thumbnail?: string | null;
  showFollow?: boolean;
}

export default function ContentCard({ id, title, type, creator, thumbnail, showFollow = true }: ContentCardProps) {
  return (
    <Card hoverEffect data-testid={`content-card-${id}`}>
      <Link href={`/content/${id}`}>
        <div className="aspect-video bg-black/40 rounded-xl mb-3 overflow-hidden relative group cursor-pointer">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-stage-indigo/20 to-stage-mint/10">
              {type === "AUDIO" ? <Music2 size={28} className="text-white/40" /> : <Play size={28} className="text-white/40" />}
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-12 w-12 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint hover:scale-110 transition-transform">
              <Play size={18} fill="currentColor" />
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-2">
        <Link href={`/content/${id}`}>
          <h3 className="font-bold text-sm line-clamp-2 hover:text-stage-mint transition-colors">{title}</h3>
        </Link>

        <div className="flex items-center justify-between">
          <Link
            href={`/c/${creator.slug}`}
            className="text-xs text-stage-mutetext hover:text-stage-mint transition-colors truncate max-w-[60%]"
            data-testid={`creator-link-${id}`}
          >
            {creator.name}
          </Link>
          {showFollow && creator.id && (
            <FollowButton creatorId={creator.id} className="text-xs py-0.5 px-2" />
          )}
        </div>
      </div>
    </Card>
  );
}
