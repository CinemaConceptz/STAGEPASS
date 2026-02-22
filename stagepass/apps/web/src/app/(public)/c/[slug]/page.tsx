export default function CreatorPage({ params }: { params: { slug: string } }) {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="h-64 rounded-3xl bg-gradient-to-r from-stage-indigo/40 to-stage-mint/20 relative border border-white/10">
        <div className="absolute -bottom-10 left-10 flex items-end gap-4">
          <div className="h-32 w-32 rounded-full bg-black border-4 border-stage-bg shadow-xl overflow-hidden">
            {/* Avatar */}
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{params.slug}</h1>
            <p className="text-stage-mutetext">Electronic Music Producer • Berlin</p>
          </div>
        </div>
      </div>
      <div className="h-12" /> {/* Spacer */}
      
      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 pb-4 text-sm font-medium text-stage-mutetext">
        <span className="text-white border-b-2 border-stage-mint pb-4 -mb-4.5 cursor-pointer">Premieres</span>
        <span className="hover:text-white cursor-pointer">Live</span>
        <span className="hover:text-white cursor-pointer">Radio</span>
        <span className="hover:text-white cursor-pointer">About</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video bg-stage-panel rounded-xl border border-white/10"></div>
        ))}
      </div>
    </div>
  );
}