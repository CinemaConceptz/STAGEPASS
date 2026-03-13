"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { isFollowing, followCreator, unfollowCreator } from "@/lib/firebase/firestore";
import { UserPlus, UserCheck, Loader } from "lucide-react";

interface FollowButtonProps {
  creatorId: string;
  onToggle?: (following: boolean) => void;
}

export default function FollowButton({ creatorId, onToggle }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !creatorId) { setLoading(false); return; }
    isFollowing(user.uid, creatorId).then(f => {
      setFollowing(f);
      setLoading(false);
    });
  }, [user, creatorId]);

  const handleToggle = async () => {
    if (!user) { window.location.href = "/login"; return; }
    setSaving(true);
    try {
      if (following) {
        await unfollowCreator(user.uid, creatorId);
      } else {
        await followCreator(user.uid, creatorId);
      }
      const newState = !following;
      setFollowing(newState);
      onToggle?.(newState);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.uid === creatorId) return null;

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      data-testid="follow-button"
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-60 ${
        following
          ? "bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
          : "bg-stage-indigo text-white shadow-glowIndigo hover:bg-stage-indigo/80 hover:scale-105"
      }`}
    >
      {saving ? (
        <Loader size={15} className="animate-spin" />
      ) : following ? (
        <UserCheck size={15} />
      ) : (
        <UserPlus size={15} />
      )}
      {saving ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
