"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send, Loader } from "lucide-react";

interface Comment {
  id: string;
  text: string;
  userId: string;
  displayName: string;
  createdAt: string;
}

interface CommentsProps {
  contentId: string;
  className?: string;
}

export default function Comments({ contentId, className = "" }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments/${contentId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch { /* silent */ }
    setLoading(false);
  }, [contentId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/comments/${contentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: input.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setInput("");
      }
    } catch { /* silent */ }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className={`flex flex-col bg-stage-panel border border-white/10 rounded-xl overflow-hidden ${className}`}
      data-testid="comments-section"
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <MessageSquare size={14} className="text-stage-mint" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-stage-mutetext">
          Comments
        </h3>
        <span className="ml-auto text-xs text-stage-mutetext">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment Input */}
      {user ? (
        <div className="flex gap-2 p-3 border-b border-white/10 bg-black/20">
          <div className="h-8 w-8 rounded-full bg-stage-mint/20 flex items-center justify-center text-stage-mint text-xs font-bold shrink-0">
            {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Add a comment..."
              className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm border border-white/10 text-white placeholder:text-white/30 focus:border-stage-mint outline-none transition-colors"
              maxLength={500}
              data-testid="comment-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2 rounded-lg bg-stage-indigo hover:bg-stage-indigo/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              data-testid="comment-submit"
            >
              {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-b border-white/10 text-center text-xs text-stage-mutetext">
          <a href="/login" className="text-stage-mint hover:underline">
            Sign in
          </a>{" "}
          to comment
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[400px]">
        {loading ? (
          <div className="text-center py-6">
            <Loader size={20} className="mx-auto animate-spin text-stage-mutetext" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-stage-mutetext text-xs italic text-center mt-6" data-testid="comments-empty">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-2.5" data-testid={`comment-${c.id}`}>
              <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-stage-mutetext shrink-0 mt-0.5">
                {c.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-white">{c.displayName}</span>
                  <span className="text-[10px] text-white/30">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-white/80 mt-0.5 break-words">{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
