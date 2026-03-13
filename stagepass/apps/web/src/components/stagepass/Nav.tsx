"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";
import NotificationBell from "./NotificationBell";

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-xl px-4 py-2 text-sm font-medium text-stage-mutetext transition-colors hover:text-white hover:bg-white/5"
  >
    {label}
  </Link>
);

export default function Nav() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-stage-bg/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stage-mint/20 shadow-glowMint group-hover:scale-105 transition-transform">
            <Image src="/logo.jpg" alt="StagePass" fill className="object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="absolute inset-0 bg-stage-mint/10 hidden group-hover:block" />
          </div>
          <span className="text-lg font-bold tracking-wider">
            STAGE<span className="text-stage-indigo">PASS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/explore" label="Explore" />
          <NavLink href="/live" label="Live" />
          <NavLink href="/radio" label="Radio" />
          {user && <NavLink href="/studio" label="Studio" />}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link href="/studio">
                <div className="h-9 w-9 rounded-full bg-stage-panel border border-white/10 flex items-center justify-center hover:border-stage-mint/50 transition-colors">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <User size={18} className="text-stage-mutetext" />
                  )}
                </div>
              </Link>
              <Link href="/studio" className="hidden md:block rounded-xl bg-stage-indigo px-4 py-2 text-sm font-bold text-white shadow-glowIndigo hover:bg-stage-indigo/90">
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                Log in
              </Link>
              <Link href="/signup" className="rounded-xl bg-stage-indigo px-4 py-2 text-sm font-bold text-white shadow-glowIndigo transition-transform hover:scale-105 hover:bg-stage-indigo/90">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
