import React, { useState } from 'react';
import { Download, Check, FileCode, Shield, Radio, Video, Users, Sparkles, Monitor, Smartphone, Zap, Wifi, RefreshCw, Link } from 'lucide-react';
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
    { icon: Shield, title: 'Auth System', desc: 'Google Sign-In + Email/Password with privacy agreement and password visibility toggle' },
    { icon: Users, title: 'Profile + Admin Claim', desc: 'Customizable profile, Google Drive link, and one-click Admin Claim button — no Firestore console needed' },
    { icon: Radio, title: 'Radio + Auto-DJ', desc: 'Active stations, featured station, mini player, show scheduling, Auto-DJ with shuffle and genre filter' },
    { icon: Video, title: 'Live Streaming (Fixed)', desc: 'RTMP Server + Stream Key correctly split for OBS. OBS Auto-Config Wizard warning. "Not Showing? Refresh" button' },
    { icon: Wifi, title: 'Live Page (Real-time)', desc: 'Streams appear via server-side API polling every 8s. Go Live button turns red ● LIVE when you\'re broadcasting' },
    { icon: Monitor, title: 'Feed + Explore (Fixed)', desc: 'All reads moved to Admin SDK server routes — Firestore security rules no longer block content from appearing' },
    { icon: Link, title: 'Short Stream URLs', desc: '/api/live/[channelId]/hls redirects to HLS manifest. /live/[channelId] is a shareable viewer page with chat' },
    { icon: Sparkles, title: 'AI Butler (Encore)', desc: 'Gemini-powered assistant that can execute real actions (go live, upload, analytics)' },
    { icon: Smartphone, title: 'Mobile App (Expo)', desc: 'React Native app with Feed, Radio, Live, Profile screens. Configured for App Store & Play Store submission' },
    { icon: FileCode, title: 'Multi-Quality ABR', desc: 'HLS player with quality selector (Auto/720p/360p) for adaptive bitrate streaming' },
    { icon: Zap, title: 'Server-Side HLS Radio', desc: 'FFmpeg-powered Auto-DJ stream generation in media-worker. Triggered via /api/radio/generate-stream' },
    { icon: RefreshCw, title: 'Deploy Script', desc: 'deploy_fast.ps1 builds all services in sequence — Web → API → Worker. WORKER_SERVICE_URL wired to web env' },
  ];

  const bugFixes = [
    'OBS RTMP: GCP inputUri now correctly parsed into Server + Stream Key fields',
    'OBS instructions updated: warns against Auto-Configuration Wizard',
    'Live page: switched from client Firestore SDK to Admin SDK API — bypasses security rules',
    'Feed & Explore: all reads moved to /api/content/feed (Admin SDK) — content now appears',
    'Content detail page: uses /api/content/[id] server route',
    'Creator profile page: uses /api/creators + /api/content/feed server routes',
    'Firebase .exists() property bug fixed in admin.ts (was called as exists() method)',
    'Profile page: missing setSaved state restored after accidental deletion',
    'layout.tsx: themeColor moved from metadata → viewport export (was causing build warnings on all 15 pages)',
    'Firestore orderBy removed from getLiveChannels() — no composite index required',
    'Admin claim: first-ever user can self-promote via Profile page without Firestore console',
    'Download page: now serves stagepass_final.zip (was serving old stagepass_production.zip)',
    'favicon.ico was 0 bytes — now served via icon-192.png in metadata icons field',
    'Live stream short URL: /api/live/[channelId]/hls redirect endpoint added',
    '/live/[channelId] page added for direct shareable stream links with chat',
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2E1A47] via-[#3B225B] to-[#2E1A47] border border-white/10 p-8 md:p-12">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full">
            <Check size={14} className="text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Production Build Ready — Mar 2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
            STAGEPASS <span className="text-[#D946EF]">Production</span> Package
          </h1>

          <p className="text-lg text-zinc-300 max-w-2xl">
            Complete 4-service architecture (Web + API + Media Worker + Mobile) with all production features, live stream fixes, and server-side data routing — ready for GCP deployment.
          </p>

          <div className="flex flex-wrap gap-3">
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
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400">
              <FileCode size={14} />
              5.5 MB · 4 services · TypeScript
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
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
        <h2 className="text-xl font-heading font-bold text-white mb-4">
          Bug Fixes &amp; Improvements
          <span className="ml-3 text-xs font-normal text-zinc-500">({bugFixes.length} total)</span>
        </h2>
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
    worker/   # Express.js + FFmpeg — Media Worker (Cloud Run stagepass-worker)
    mobile/   # React Native (Expo) — iOS & Android
  scripts/
    deploy_fast.ps1         # Fast deploy: Web → API → Worker
    deploy_production.ps1   # Full deploy with Pub/Sub + IAM setup
  SETUP.md   # Post-deployment configuration guide`}
        </pre>
      </section>

      {/* Deploy Tips */}
      <section className="bg-[#121212] border border-white/5 rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-white">After Deploying</h2>
        <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
          <li>Go to <strong className="text-white">Profile</strong> → click <strong className="text-white">Claim Admin Access</strong> (first user wins — no Firestore console needed)</li>
          <li>Go to <strong className="text-white">Studio → Live</strong> → click <strong className="text-white">Start Broadcast</strong> to get your OBS credentials</li>
          <li>In OBS: <strong className="text-white">Settings → Stream → Custom…</strong> — paste Server + Stream Key (do NOT use Auto-Config Wizard)</li>
          <li>If your stream doesn't appear on the Live page, click <strong className="text-white">"Not Showing? Refresh"</strong> in the Studio</li>
          <li>Upload content via <strong className="text-white">Studio → New Premiere</strong> — it will appear on the Feed immediately after deploy</li>
        </ol>
      </section>
    </div>
  );
}

