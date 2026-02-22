import Button from "@/components/ui/Button";

export default function StudioPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Studio Dashboard</h1>
        <Button variant="primary">Create New</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Total Views</h3>
           <p className="text-4xl font-mono mt-2 text-white">12.4K</p>
        </div>
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Followers</h3>
           <p className="text-4xl font-mono mt-2 text-stage-mint">8,203</p>
        </div>
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Revenue</h3>
           <p className="text-4xl font-mono mt-2 text-stage-indigo">$1,240</p>
        </div>
      </div>
    </div>
  );
}