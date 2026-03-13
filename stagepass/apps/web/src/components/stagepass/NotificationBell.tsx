"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Notif { id: string; title: string; body: string; read: boolean; createdAt: string; link?: string; type?: string; }

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setNotifs(data.items || []);
    } catch { /* silent */ }
  }, [user]);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0 && user) {
      try {
        const token = await user.getIdToken();
        await fetch("/api/notifications", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      } catch { /* silent */ }
    }
  };

  const unread = notifs.filter(n => !n.read).length;
  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        data-testid="notification-bell"
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Bell size={18} className="text-white/80" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stage-mint text-[10px] font-bold text-black flex items-center justify-center animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-stage-bg border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-sm">Notifications</h3>
            {notifs.length > 0 && <span className="text-xs text-stage-mutetext">{notifs.length} total</span>}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-stage-mutetext text-sm">All quiet — no notifications yet.</div>
            ) : (
              notifs.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? "bg-stage-mint/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-stage-mint" : "bg-white/20"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-stage-mutetext mt-0.5">{n.body}</p>
                      <p className="text-xs text-white/30 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      {n.link && <Link href={n.link} className="text-xs text-stage-mint hover:underline mt-0.5 block">View →</Link>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
