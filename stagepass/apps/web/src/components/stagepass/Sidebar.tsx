"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { Home, LayoutDashboard, Radio, Video, Users, Settings, LogOut, Compass } from "lucide-react";

const navItems = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/live", label: "Live", icon: Video },
];

const studioItems = [
  { href: "/studio", label: "Studio", icon: LayoutDashboard },
  { href: "/studio/profile", label: "Profile", icon: Users },
];

export default function Sidebar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-stage-sidebar border-r border-white/5 flex flex-col z-40" data-testid="sidebar">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-5 py-5" data-testid="sidebar-logo">
        <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
          <Image src="/logo.jpg" alt="StagePass" width={32} height={32} className="object-cover" />
        </div>
        <span className="text-base font-bold tracking-wider text-white">STAGEPASS</span>
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1" data-testid="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-stage-indigo text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              data-testid={`sidebar-${item.label.toLowerCase()}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {user && (
          <>
            <div className="border-t border-white/5 my-3" />
            {studioItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-stage-indigo text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  data-testid={`sidebar-${item.label.toLowerCase()}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {user && (
          <>
            <div className="flex items-center gap-2 px-4 py-2">
              <NotificationBell />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
              data-testid="sidebar-signout"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </>
        )}
        {!user && !loading && (
          <>
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              data-testid="sidebar-login"
            >
              <LogOut size={18} />
              <span>Log In</span>
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-stage-indigo text-white hover:bg-stage-indigo/80 transition-all"
              data-testid="sidebar-join"
            >
              Join STAGEPASS
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
