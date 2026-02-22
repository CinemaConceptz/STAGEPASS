import React from 'react';
import { motion } from 'framer-motion';
import { Play, Mic2, Video, Music } from 'lucide-react';

export default function ContentCard({ content }) {
  const getIcon = () => {
    switch (content.type) {
      case 'live': return <Mic2 size={16} />;
      case 'audio': return <Music size={16} />;
      default: return <Video size={16} />;
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 tracing-beam"
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={content.thumbnail} 
          alt={content.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
          <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(93,92,255,0.5)] hover:scale-110 transition-transform">
            <Play size={20} fill="currentColor" />
          </button>
        </div>
        
        {content.status === 'live' && (
          <div className="absolute top-3 left-3 bg-secondary text-black text-xs font-bold px-2 py-1 rounded flex items-center space-x-1 animate-pulse">
            <span className="w-2 h-2 bg-black rounded-full" />
            <span>LIVE NOW</span>
          </div>
        )}
        
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center space-x-1 border border-white/10">
          {getIcon()}
          <span className="capitalize">{content.type}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-heading font-semibold text-white text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {content.title}
        </h3>
        <div className="flex items-center justify-between text-zinc-400 text-sm">
          <span className="hover:text-white transition-colors cursor-pointer">{content.creator}</span>
          <span>{content.views.toLocaleString()} views</span>
        </div>
      </div>
    </motion.div>
  );
}
