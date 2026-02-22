import Link from "next/link";
import FeedSort from "@/components/stagepass/FeedSort";
import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero / Premiere Banner */}
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
            <Button variant="primary" size="lg" className="rounded-full px-8">
              Watch Premiere
            </Button>
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
          {/* Feed Sort Component */}
          <FeedSort value="NEWEST" onChange={() => {}} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Data */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ContentCard
              key={i}
              id={`content-${i}`}
              title={i % 2 === 0 ? "Neon Nights: Live Set from Tokyo" : "The Future of Synthwave"}
              type={i % 3 === 0 ? "LIVE" : "VIDEO"}
              creator={{ slug: "dj-cyber", name: "DJ Cyberpunk" }}
              thumbnail={`https://source.unsplash.com/random/800x450?concert&sig=${i}`} 
            />
          ))}
        </div>
        
        <div className="flex justify-center pt-8">
          <Button variant="ghost">Load More</Button>
        </div>
      </div>
    </div>
  );
}