"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, UserCheck, Loader } from "lucide-react";

interface Props {
  creatorId: string;
  initialFollowing?: boolean;
  initialCount?: number;
  className?: string;
  onToggle?: (following: boolean) => void;
}

export default function FollowButton({ creatorId, initialFollowing = false, initialCount = 0, className = "", onToggle }: Props) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Fetch current follow status from server API
  useEffect(() => {
    if (!user || !creatorId) return;
    user.getIdToken().then(token =>
      fetch(`/api/follow/${creatorId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          setFollowing(d.following ?? false);
          setCount(d.followerCount ?? initialCount);
          setChecked(true);
        })
        .catch(() => setChecked(true))
    );
  }, [user, creatorId]);

  const toggle = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const method = following ? "DELETE" : "POST";
      const res = await fetch(`/api/follow/${creatorId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success !== false) {
        const newState = !following;
        setFollowing(newState);
        setCount(c => following ? Math.max(0, c - 1) : c + 1);
        onToggle?.(newState);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [user, creatorId, following, loading]);

  if (!user || user.uid === creatorId) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading || !checked}
      data-testid="follow-button"
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
        ${following
          ? "bg-white/10 border border-white/20 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
          : "bg-stage-mint text-black hover:bg-stage-mint/90"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      {loading ? (
        <Loader size={14} className="animate-spin" />
      ) : following ? (
        <UserCheck size={14} />
      ) : (
        <UserPlus size={14} />
      )}
      {following ? "Following" : "Follow"}
      {count > 0 && <span className="opacity-60 font-normal">{count.toLocaleString()}</span>}
    </button>
  );
}
