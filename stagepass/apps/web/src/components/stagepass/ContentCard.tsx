import Link from "next/link";
import Card from "@/components/ui/Card";
import { Play, Mic2, Radio } from "lucide-react";

export default function ContentCard({
  id,
  title,
  type,
  creator,
  thumbnail
}: {
  id: string;
  title: string;
  type: "VIDEO" | "AUDIO" | "MIX" | "CLIP" | "EPISODE" | "LIVE";
  creator: { slug: string; name: string };
  thumbnail?: string;
}) {
  const isLive = type === "LIVE";

  return (
    <Card className="group cursor-pointer hover:border-stage-indigo/50 transition-all duration-300" data-testid={`content-card-${id}`}>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stage-panel to-stage-panel2 flex items-center justify-center">
            <span className="text-stage-mutetext text-xs">No Thumbnail</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="h-12 w-12 rounded-full bg-stage-indigo shadow-glowIndigo flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play size={20} fill="currentColor" />
          </div>
        </div>

        {isLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white border border-white/10 uppercase">
          {type}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg leading-tight group-hover:text-stage-mint transition-colors line-clamp-2">
            <Link href={`/content/${id}`}>
              {title}
            </Link>
          </h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-stage-mutetext">
            <div className="h-5 w-5 rounded-full bg-gray-700 overflow-hidden">
               {/* Avatar placeholder */}
            </div>
            <Link href={`/c/${creator.slug}`} className="hover:text-white transition-colors">
              {creator.name}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}