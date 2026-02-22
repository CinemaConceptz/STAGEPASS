import Player from "@/components/stagepass/Player";

export default function ContentPage({ params }: { params: { id: string } }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Player />
        <div>
          <h1 className="text-2xl font-bold">Content Title {params.id}</h1>
          <div className="mt-2 flex items-center justify-between border-b border-white/10 pb-4">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-gray-700" />
               <div>
                 <p className="font-bold text-sm">Creator Name</p>
                 <p className="text-xs text-stage-mutetext">12K Followers</p>
               </div>
             </div>
             <button className="bg-stage-indigo px-4 py-2 rounded-full text-sm font-bold shadow-glowIndigo">
               Follow
             </button>
          </div>
          <p className="mt-4 text-stage-mutetext leading-relaxed">
            Description of the content goes here. This is a premiere performance recorded live from the underground studio.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Chat Replay</h3>
        <div className="h-[400px] bg-stage-panel rounded-xl border border-white/10 p-4">
           <p className="text-sm text-white/50 text-center mt-20">Chat messages will appear here.</p>
        </div>
      </div>
    </div>
  );
}