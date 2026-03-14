"use client";

import { useState } from "react";
import { Share2, Twitter, Link2, MessageCircle, Check } from "lucide-react";

interface ShareButtonsProps {
  contentId: string;
  title: string;
  creatorName?: string;
  thumbnailUrl?: string;
}

export default function ShareButtons({ contentId, title, creatorName, thumbnailUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const getPageUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/content/${contentId}`
      : `https://stagepassaccess.com/content/${contentId}`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(getPageUrl()); } catch {
      const el = document.createElement("input");
      el.value = getPageUrl();
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const getLinks = () => {
    const url = encodeURIComponent(getPageUrl());
    const text = encodeURIComponent(`"${title}" by ${creatorName || "a creator"} on STAGEPASS`);
    return { twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, whatsapp: `https://wa.me/?text=${text}%20${url}` };
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all" data-testid="share-btn">
        <Share2 size={16} className="text-stage-mint" /> Share
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-stage-bg border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden" data-testid="share-panel">
            <div className="px-4 py-2.5 border-b border-white/10"><p className="text-xs font-bold text-stage-mutetext uppercase tracking-wider">Share Premiere</p></div>
            <a href={getLinks().twitter} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 text-sm hover:bg-[#1DA1F2]/10 transition-colors" data-testid="share-twitter"><Twitter size={16}/> Twitter / X</a>
            <a href={getLinks().whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 text-sm hover:bg-[#25D366]/10 transition-colors" data-testid="share-whatsapp"><MessageCircle size={16}/> WhatsApp</a>
            <button onClick={handleCopy} className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm hover:bg-white/5 transition-colors" data-testid="share-copy-link">
              {copied ? <Check size={16} className="text-stage-mint"/> : <Link2 size={16}/>} {copied ? "Copied!" : "Copy link"}
            </button>
            {thumbnailUrl && (<div className="px-4 py-3 border-t border-white/10"><p className="text-xs text-stage-mutetext mb-2">Preview card</p><div className="rounded-xl overflow-hidden aspect-video"><img src={thumbnailUrl} alt="preview" className="w-full h-full object-cover"/></div></div>)}
          </div>
        </>
      )}
    </div>
  );
}
