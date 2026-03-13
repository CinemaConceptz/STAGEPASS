"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { Play, Video, Music, Radio } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video size={12} />,
  AUDIO: <Music size={12} />,
  LIVE: <Radio size={12} />,
};

interface ContentCardProps {
  id: string;
  title: string;
  type: string;
  creator: { slug: string; name: string };
  thumbnail?: string;
}

export default function ContentCard({ id, title, type, creator, thumbnail }: ContentCardProps) {
  return (
    <Card hoverEffect data-testid={`content-card-${id}`}>
      <Link href={`/content/${id}`}>
        <div className="aspect-video bg-black/40 rounded-xl mb-3 overflow-hidden relative group cursor-pointer">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-stage-indigo/20 to-stage-mint/10">
              <Play size={28} className="text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-12 w-12 bg-stage-mint rounded-full flex items-center justify-center text-black shadow-glowMint hover:scale-110 transition-transform">
              <Play size={18} fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stage-mint uppercase tracking-wider bg-stage-mint/10 px-2 py-0.5 rounded">
              {typeIcons[type] || <Video size={10} />} {type}
            </span>
          </div>
          <h3 className="font-bold text-sm text-white leading-tight line-clamp-2">{title}</h3>
          <p className="text-xs text-zinc-500">
            {creator.name}
          </p>
        </div>
      </Link>
    </Card>
  );
}
