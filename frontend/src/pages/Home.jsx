import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Users, Radio, Activity } from 'lucide-react';
import axios from 'axios';
import ContentCard from '../components/ContentCard';
import { Button } from '../components/ui/button';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Home() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get(`${REACT_APP_BACKEND_URL}/api/feed`);
        setFeed(res.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1671432403854-cbe798eb44fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxjb25jZXJ0JTIwY3Jvd2QlMjBuZW9uJTIwbGlnaHRzJTIwZGFya3xlbnwwfHx8fDE3NzE3MjI1Mzl8MA&ixlib=rb-4.1.0&q=85" 
          alt="Hero" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute bottom-0 left-0 z-20 p-8 md:p-12 w-full md:w-2/3 space-y-6">
          <div className="flex items-center space-x-3">
            <span className="bg-secondary text-black px-3 py-1 rounded-full text-xs font-bold tracking-wider animate-pulse">
              LIVE NOW
            </span>
            <span className="text-zinc-300 text-sm tracking-widest uppercase">
              Main Stage • Tokyo
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight text-white drop-shadow-2xl">
            ELECTRIC DREAMS <br/> FESTIVAL 2026
          </h1>
          
          <p className="text-lg text-zinc-200 max-w-xl drop-shadow-md">
            Experience the future of sound. Join 45,000 others in the world's first fully immersive digital concert.
          </p>
          
          <div className="flex items-center space-x-4 pt-4">
            <Button size="lg" className="rounded-full text-lg px-8 py-6">
              <Play fill="currentColor" className="mr-2" size={20} />
              Watch Premiere
            </Button>
            <Button variant="outline" size="lg" className="rounded-full text-lg px-8 py-6 bg-white/5 backdrop-blur border-white/20 text-white hover:bg-white/10">
              + Add to List
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-primary" />
            <h2 className="text-2xl font-heading font-bold text-white">Trending Now</h2>
          </div>
          <Button variant="link" className="text-zinc-400 hover:text-white">View All</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-[#121212] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        )}
      </section>

      {/* Creator Spotlight */}
      <section className="bg-[#121212] rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
              Are you a Creator?
            </h2>
            <p className="text-zinc-400 text-lg">
              Join the STAGEPASS network. Get discovered, monetize your art, and build your own digital stage. No algorithms. No limits.
            </p>
            <ul className="space-y-3">
              {['Direct Fan Support', '100% Ownership', 'Premium Tools'].map((feature) => (
                <li key={feature} className="flex items-center space-x-2 text-zinc-300">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="rounded-full mt-4 bg-white text-black hover:bg-zinc-200">
              Start Creating
            </Button>
          </div>
          
          <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
             <img 
               src="https://images.pexels.com/photos/7586652/pexels-photo-7586652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
               alt="Creator" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </section>
    </div>
  );
}
