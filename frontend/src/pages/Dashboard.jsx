import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Upload, Users, DollarSign, Calendar, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const stats = [
    { name: 'Total Views', value: '45.2K', change: '+12%', icon: Users, color: 'text-primary' },
    { name: 'Revenue', value: '$12,400', change: '+8.1%', icon: DollarSign, color: 'text-secondary' },
    { name: 'Watch Time', value: '1,200h', change: '+2.3%', icon: BarChart3, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Creator Studio</h1>
          <p className="text-zinc-400">Welcome back, DemoCreator</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5">
            <Calendar className="mr-2 h-4 w-4" /> Schedule
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" /> Upload New
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.div 
            key={stat.name}
            whileHover={{ y: -5 }}
            className="bg-[#121212] border border-white/5 p-6 rounded-2xl shadow-lg hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{stat.name}</h3>
            <p className="text-3xl font-heading font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Uploads - Spans 2 cols */}
        <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold">Recent Content</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-10 bg-zinc-800 rounded-lg overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-1671432403854-cbe798eb44fb?auto=format&fit=crop&w=200&q=60`}
                      alt="Thumb"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors">Neon Nights: Live Set</h4>
                    <p className="text-xs text-zinc-500">Uploaded 2h ago • Live Replay</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-zinc-400">
                  <span className="flex items-center"><Users size={14} className="mr-1" /> 1.2k</span>
                  <span className="flex items-center"><DollarSign size={14} className="mr-1" /> $340</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-heading font-bold mb-6">System Status</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Storage Used</span>
                <span className="text-white font-mono">82%</span>
              </div>
              <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[82%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Bandwidth (Monthly)</span>
                <span className="text-white font-mono">45%</span>
              </div>
              <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[45%]" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">AI Assistant</h3>
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                <p className="text-sm text-zinc-400 italic">"Your next scheduled stream 'Synth Sunday' is in 2 days. Don't forget to upload the teaser clip."</p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-primary font-bold">- Butler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
