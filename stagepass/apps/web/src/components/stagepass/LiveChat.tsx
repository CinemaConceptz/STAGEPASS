"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Send, Loader } from "lucide-react";

interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

interface LiveChatProps {
  channelId: string;
  className?: string;
}

export default function LiveChat({ channelId, className = "" }: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      const res = await fetch(`/api/live/chat/${channelId}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch { /* silent */ }
  }, [channelId]);

  // Poll every 3 seconds for new messages
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/live/chat/${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: input.trim() }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
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

  return (
    <div className={`flex flex-col bg-stage-panel border border-white/10 rounded-xl overflow-hidden ${className}`} data-testid="live-chat">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-stage-mutetext">Live Chat</h3>
        <span className="ml-auto text-xs text-stage-mutetext">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <p className="text-stage-mutetext text-xs italic text-center mt-8" data-testid="chat-empty">
            No messages yet. Be the first to say something.
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm group" data-testid={`chat-msg-${msg.id}`}>
              <span className="font-bold text-stage-mint">{msg.displayName}: </span>
              <span className="text-white/90">{msg.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {user ? (
        <div className="flex gap-2 p-3 border-t border-white/10 bg-black/20">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Say something..."
            className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm border border-white/10 text-white placeholder:text-white/30 focus:border-stage-mint outline-none transition-colors"
            maxLength={200}
            data-testid="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg bg-stage-indigo hover:bg-stage-indigo/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            data-testid="chat-send-btn"
          >
            {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-white/10 text-center text-xs text-stage-mutetext">
          <a href="/login" className="text-stage-mint hover:underline">Sign in</a> to chat
        </div>
      )}
    </div>
  );
}
