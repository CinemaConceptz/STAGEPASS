"use client";

import { useEffect, useState } from "react";
import Player from "@/components/stagepass/Player";
import { getContentById, ContentItem } from "@/lib/firebase/firestore";
import Button from "@/components/ui/Button";

export default function ContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatLog, setChatLog] = useState<{user:string, text:string}[]>([
    {user: "System", text: "Welcome to the premiere."}
  ]);

  useEffect(() => {
    getContentById(params.id).then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, [params.id]);

  const handleFollow = () => {
    setFollowing(!following);
    alert(following ? "Unfollowed" : "Followed!");
  };

  const handleSendChat = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && chatMsg.trim()) {
      setChatLog(prev => [...prev, { user: "You", text: chatMsg }]);
      setChatMsg("");
    }
  };

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
             <Button 
               variant={following ? "secondary" : "primary"} 
               className="rounded-full shadow-glowIndigo"
               onClick={handleFollow}
             >
               {following ? "Following" : "Follow"}
             </Button>
          </div>
          <p className="mt-4 text-stage-mutetext leading-relaxed">
            Premiere ID: {content.id}. Uploaded {new Date(content.createdAt).toLocaleDateString()}.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Live Chat</h3>
        <div className="h-[400px] bg-stage-panel rounded-xl border border-white/10 p-4 flex flex-col justify-between">
           <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
             {chatLog.map((msg, i) => (
               <p key={i} className="text-sm">
                 <span className="text-stage-mint font-bold">{msg.user}:</span> {msg.text}
               </p>
             ))}
           </div>
           <input 
             className="bg-black/30 w-full p-2 rounded text-sm border border-white/10 text-white focus:border-stage-mint outline-none" 
             placeholder="Say something..." 
             value={chatMsg}
             onChange={e => setChatMsg(e.target.value)}
             onKeyDown={handleSendChat}
           />
        </div>
      </div>
    </div>
  );
}
