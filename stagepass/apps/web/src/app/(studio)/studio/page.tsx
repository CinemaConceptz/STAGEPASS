"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Upload, Radio, Video, Plus, Eye, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StudioPage() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [analytics, setAnalytics] = useState({ totalViews: 0, followers: 0 });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then(token =>
      fetch("/api/analytics", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          setAnalytics({ totalViews: d.totalViews || 0, followers: d.followers || 0 });
          setLoadingAnalytics(false);
        })
        .catch(() => setLoadingAnalytics(false))
    );
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Studio Dashboard</h1>
        
        <div className="relative">
          <Button variant="primary" onClick={() => setMenuOpen(!menuOpen)} data-testid="studio-create-btn">
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-stage-panel border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <Link href="/studio/uploads" className="block px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2">
                <Upload size={16} /> Upload Video
              </Link>
              <Link href="/studio/live" className="block px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2">
                <Video size={16} /> Go Live
              </Link>
              <Link href="/studio/radio" className="block px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-2">
                <Radio size={16} /> Start Radio
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10" data-testid="studio-views-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-stage-mutetext uppercase text-sm">Total Views</h3>
            <Eye size={18} className="text-stage-mint" />
          </div>
          <p className="text-4xl font-mono mt-2 text-white">
            {loadingAnalytics ? <span className="text-stage-mutetext text-2xl">—</span> : analytics.totalViews.toLocaleString()}
          </p>
          <Link href="/studio/analytics" className="text-xs text-stage-mint hover:underline mt-3 block flex items-center gap-1">
            <TrendingUp size={12} /> View full analytics
          </Link>
        </div>
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10" data-testid="studio-followers-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-stage-mutetext uppercase text-sm">Followers</h3>
            <Users size={18} className="text-stage-indigo" />
          </div>
          <p className="text-4xl font-mono mt-2 text-stage-mint">
            {loadingAnalytics ? <span className="text-stage-mutetext text-2xl">—</span> : analytics.followers.toLocaleString()}
          </p>
        </div>
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Revenue</h3>
           <p className="text-4xl font-mono mt-2 text-stage-indigo">$0.00</p>
           <p className="text-xs text-stage-mutetext mt-3">Monetization coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Link href="/studio/uploads" className="bg-stage-panel border border-white/10 rounded-xl p-5 hover:border-stage-mint/40 transition-all flex items-center gap-4" data-testid="studio-upload-shortcut">
          <div className="h-10 w-10 bg-stage-mint/10 rounded-lg flex items-center justify-center"><Upload size={20} className="text-stage-mint" /></div>
          <div><p className="font-bold">Upload Content</p><p className="text-xs text-stage-mutetext">Import from Google Drive</p></div>
        </Link>
        <Link href="/studio/live" className="bg-stage-panel border border-white/10 rounded-xl p-5 hover:border-red-500/40 transition-all flex items-center gap-4" data-testid="studio-live-shortcut">
          <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center"><Video size={20} className="text-red-400" /></div>
          <div><p className="font-bold">Go Live</p><p className="text-xs text-stage-mutetext">Start a live broadcast</p></div>
        </Link>
        <Link href="/studio/radio" className="bg-stage-panel border border-white/10 rounded-xl p-5 hover:border-stage-indigo/40 transition-all flex items-center gap-4" data-testid="studio-radio-shortcut">
          <div className="h-10 w-10 bg-stage-indigo/10 rounded-lg flex items-center justify-center"><Radio size={20} className="text-stage-indigo" /></div>
          <div><p className="font-bold">Radio Station</p><p className="text-xs text-stage-mutetext">Launch your broadcast</p></div>
        </Link>
      </div>
    </div>
  );
}
