import React, { useState } from 'react';
import { Download, Check, FileCode, Shield, Radio, Video, Users, Sparkles, Monitor, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Home() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.open(`${REACT_APP_BACKEND_URL}/api/download/stagepass-production`, '_blank');
    setTimeout(() => setDownloading(false), 3000);
  };

  const features = [
    { icon: Shield, title: 'Auth System', desc: 'Google Sign-In + Email/Password with privacy agreement, password visibility toggle' },
    { icon: Users, title: 'Profile Page', desc: 'Customizable profile with social links, bio, avatar upload, Google Drive connection' },
    { icon: Radio, title: 'Radio + Auto-DJ', desc: 'Active stations, featured station, mini player, show scheduling, Auto-DJ with shuffle' },
    { icon: Video, title: 'Live Streaming', desc: 'RTMP URL + Stream Key for OBS/Prism, step-by-step setup guide' },
    { icon: Monitor, title: 'Landing Page', desc: 'Hero shows most recent uploaded video, auto-rotates every 5 days' },
    { icon: Sparkles, title: 'AI Butler (Encore)', desc: 'Gemini-powered assistant that can execute real actions (go live, upload, analytics)' },
    { icon: Smartphone, title: 'Mobile App (Expo)', desc: 'React Native app with Feed, Radio, Live, Profile screens. Ready for App Store/Play Store' },
    { icon: FileCode, title: 'Multi-Quality ABR', desc: 'HLS player with quality selector (Auto/720p/360p) for adaptive streaming' },
  ];

  const bugFixes = [
    'Firestore calls now timeout after 8s (no infinite loading)',
    'Logo replaced with proper STAGEPASS icon (was 0-byte empty file)',
    'Butler dock z-index raised above Emergent badge overlay',
    'Butler API key moved to server-side only (no browser exposure)',
    'data-testid attributes added to all interactive elements',
    '@slug label hidden from signup form (auto-generated from name)',
    'Privacy agreement popup required before signup',
    'Google Drive permission requested at signup time (permanent)',
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2E1A47] via-[#3B225B] to-[#2E1A47] border border-white/10 p-8 md:p-12">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full">
            <Check size={14} className="text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Production Build Ready</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
            STAGEPASS <span className="text-[#D946EF]">Production</span> Package
          </h1>
          
          <p className="text-lg text-zinc-300 max-w-2xl">
            Complete 3-service architecture (Web + API + Media Worker) with all 8 production features implemented, tested, and ready for GCP deployment.
          </p>

          <Button 
            size="lg" 
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-full text-lg px-10 py-6 bg-[#00FFC6] text-black hover:bg-[#00FFC6]/90 font-bold"
            data-testid="download-zip-btn"
          >
            <Download className="mr-2" size={22} />
            {downloading ? 'Downloading...' : 'Download stagepass_final.zip'}
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-heading font-bold text-white mb-6">What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-[#D946EF]/30 transition-colors">
              <f.icon size={24} className="text-[#D946EF] mb-3" />
              <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bug Fixes */}
      <section className="bg-[#121212] border border-white/5 rounded-2xl p-8">
        <h2 className="text-xl font-heading font-bold text-white mb-4">Bug Fixes & Improvements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bugFixes.map((fix, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-zinc-300">{fix}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="bg-[#121212] border border-white/5 rounded-2xl p-8">
        <h2 className="text-xl font-heading font-bold text-white mb-4">Architecture</h2>
        <pre className="text-sm text-zinc-400 font-mono bg-black/50 p-4 rounded-xl overflow-x-auto">
{`stagepass/
  apps/
    web/      # Next.js 14 — Frontend (Cloud Run stagepass-web)
    api/      # Express.js — Business Logic (Cloud Run stagepass-api)
    worker/   # Express.js — Media Processing (Cloud Run stagepass-worker)
  scripts/
    deploy_production.ps1  # One-click deploy all 3 services
  SETUP.md   # Post-deployment configuration guide`}
        </pre>
      </section>
    </div>
  );
}
