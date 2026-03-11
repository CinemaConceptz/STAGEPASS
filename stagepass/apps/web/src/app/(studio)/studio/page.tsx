"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { Upload, Radio, Video, Plus } from "lucide-react";

export default function StudioPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Studio Dashboard</h1>
        
        {/* Functional Dropdown */}
        <div className="relative">
          <Button variant="primary" onClick={() => setMenuOpen(!menuOpen)}>
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
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Total Views</h3>
           <p className="text-4xl font-mono mt-2 text-white">0</p>
        </div>
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Followers</h3>
           <p className="text-4xl font-mono mt-2 text-stage-mint">0</p>
        </div>
        <div className="bg-stage-panel rounded-xl p-6 border border-white/10">
           <h3 className="font-bold text-stage-mutetext uppercase text-sm">Revenue</h3>
           <p className="text-4xl font-mono mt-2 text-stage-indigo">$0.00</p>
        </div>
      </div>
    </div>
  );
}
