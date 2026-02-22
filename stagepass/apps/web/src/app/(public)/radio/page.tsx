import Button from "@/components/ui/Button";

export default function RadioPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 text-center py-12">
      <div className="space-y-4">
        <div className="inline-block px-3 py-1 rounded-full border border-stage-mint/20 text-stage-mint text-xs font-bold tracking-widest uppercase mb-4">
          Global Station
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
          STAGEPASS <span className="text-stage-indigo">LIVE</span>
        </h1>
        <p className="text-xl text-stage-mutetext">
          24/7 Curated Selection from the Underground.
        </p>
      </div>

      {/* Radio Player Viz */}
      <div className="relative h-48 w-full bg-stage-panel border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center group">
         <div className="absolute inset-0 bg-gradient-to-r from-stage-indigo/20 via-stage-mint/10 to-stage-indigo/20 animate-pulse" />
         
         <div className="relative z-10 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
             <span className="font-mono text-sm text-red-400">ON AIR</span>
           </div>
           <h3 className="text-2xl font-bold">Deep House Sunday</h3>
           <p className="text-sm text-stage-mutetext">Hosted by DJ Encore</p>
           
           <Button variant="primary" className="rounded-full px-8 mt-4 shadow-glowMint">
             Listen Now
           </Button>
         </div>

         {/* Waveform Bars (CSS Mock) */}
         <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 opacity-30">
           {[...Array(20)].map((_, i) => (
             <div 
               key={i} 
               className="w-2 bg-stage-mint rounded-t-sm animate-pulse"
               style={{ 
                 height: `${Math.random() * 100}%`,
                 animationDelay: `${i * 0.1}s`
               }} 
             />
           ))}
         </div>
      </div>

      {/* Schedule */}
      <div className="text-left max-w-2xl mx-auto">
        <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2">Up Next</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
              <span className="font-mono text-stage-mint">1{i}:00 PM</span>
              <div>
                <h4 className="font-bold group-hover:text-stage-indigo transition-colors">Techno Bunker</h4>
                <p className="text-sm text-stage-mutetext">with Resident DJ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}