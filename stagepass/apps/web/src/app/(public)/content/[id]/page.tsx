"use client";

import { useEffect, useState } from "react";
import Player from "@/components/stagepass/Player";
import { getContentById, ContentItem } from "@/lib/firebase/firestore";
import Button from "@/components/ui/Button";

export default function ContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContentById(params.id).then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="p-12 text-center">Loading Premiere...</div>;
  if (!content) return <div className="p-12 text-center">Content not found.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Player hlsUrl={content.playbackUrl} />
        <div>
          <h1 className="text-2xl font-bold">{content.title}</h1>
          <div className="mt-2 flex items-center justify-between border-b border-white/10 pb-4">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-gray-700" />
               <div>
                 <p className="font-bold text-sm">{content.creatorName}</p>
                 <p className="text-xs text-stage-mutetext">Creator</p>
               </div>
             </div>
             <Button variant="primary" className="rounded-full shadow-glowIndigo">
               Follow
             </Button>
          </div>
          <p className="mt-4 text-stage-mutetext leading-relaxed">
            Premiere ID: {content.id}. Uploaded {new Date(content.createdAt).toLocaleDateString()}.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Live Chat</h3>
        <div className="h-[400px] bg-stage-panel rounded-xl border border-white/10 p-4 flex flex-col justify-end">
           <div className="space-y-2 mb-4">
             <p className="text-sm"><span className="text-stage-mint font-bold">System:</span> Welcome to the premiere.</p>
           </div>
           <input className="bg-black/30 w-full p-2 rounded text-sm border border-white/10" placeholder="Say something..." />
        </div>
      </div>
    </div>
  );
}
