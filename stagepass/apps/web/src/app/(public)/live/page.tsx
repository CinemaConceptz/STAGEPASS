import Button from "@/components/ui/Button";
import ContentCard from "@/components/stagepass/ContentCard";

export default function LivePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Now</h1>
        <Button variant="secondary">Go Live</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Featured Live Stream */}
        <div className="lg:col-span-3 aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative group">
           {/* Placeholder for HLS Player */}
           <div className="absolute inset-0 flex items-center justify-center text-stage-mutetext">
             <span className="animate-pulse">Select a stream to watch</span>
           </div>
        </div>
        
        {/* Chat / Sidebar */}
        <div className="lg:col-span-1 bg-stage-panel rounded-xl border border-white/10 p-4 h-full min-h-[400px]">
          <h3 className="font-bold text-sm text-stage-mutetext mb-4 uppercase">Live Chat</h3>
          <div className="space-y-4 text-sm text-white/70">
            <p><span className="text-stage-mint font-bold">User1:</span> This is insane!</p>
            <p><span className="text-stage-indigo font-bold">Mod:</span> Welcome everyone.</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-12">Recommended Streams</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[1, 2, 3].map((i) => (
            <ContentCard
              key={i}
              id={`live-${i}`}
              title={`Live Session #${i}`}
              type="LIVE"
              creator={{ slug: "creator", name: "Creator Name" }}
            />
         ))}
      </div>
    </div>
  );
}