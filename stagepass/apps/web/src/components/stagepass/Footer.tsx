"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ml-56 border-t border-white/5 bg-stage-bg py-8 px-6" data-testid="footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} STAGEPASS. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/legal/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/legal/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/legal/community" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Community</Link>
        </nav>
      </div>
    </footer>
  );
}
