"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, ChevronDown, Loader, Radio, Video, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  text: string;
  action?: string;
  target?: string;
}

const QUICK_ACTIONS = [
  { label: "Go Live", icon: Video, prompt: "I want to go live" },
  { label: "Upload Content", icon: Upload, prompt: "I want to upload a video" },
  { label: "Start Radio", icon: Radio, prompt: "I want to create a radio station" },
];

export default function ButlerDock() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const greeting = user
    ? `I'm Encore, What are we premiering today?`
    : `I'm Encore. Let me help you get started on STAGEPASS!`;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/butler/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          isAuthenticated: !!user,
          userName: user?.displayName || null,
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        text: data.text || "I'm here to help.",
        action: data.action,
        target: data.target,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Execute navigation actions
      if (data.action === "NAVIGATE" && data.target) {
        setTimeout(() => router.push(data.target), 800);
      } else if (data.action === "GO_LIVE") {
        setTimeout(() => router.push("/studio/live"), 800);
      } else if (data.action === "UPLOAD_VIDEO") {
        setTimeout(() => router.push("/studio/uploads"), 800);
      } else if (data.action === "RADIO_STATION") {
        setTimeout(() => router.push("/studio/radio"), 800);
      } else if (data.action === "SHOW_ANALYTICS") {
        setTimeout(() => router.push("/studio/analytics"), 800);
      } else if (data.action === "SIGNUP") {
        setTimeout(() => router.push("/signup"), 800);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection interrupted. Try again." }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3" data-testid="butler-dock">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[340px] sm:w-[380px] max-h-[70vh] bg-stage-panel border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            data-testid="butler-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-stage-mint" />
                <span className="text-sm font-bold tracking-wider">ENCORE</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-stage-mutetext hover:text-white">
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
              {/* Greeting */}
              <div className="text-sm text-white/90 bg-white/5 rounded-xl p-3">
                {greeting}
              </div>

              {/* Quick Actions (show when no messages yet) */}
              {messages.length === 0 && (
                <div className="space-y-2">
                  {user ? (
                    QUICK_ACTIONS.map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => sendMessage(qa.prompt)}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-stage-indigo/20 hover:border-stage-indigo/30 transition-all text-sm"
                        data-testid={`butler-qa-${qa.label.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        <qa.icon size={16} className="text-stage-mint shrink-0" />
                        <span>{qa.label}</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => sendMessage("I want to create an account")}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-stage-indigo/20 border border-stage-indigo/30 hover:bg-stage-indigo/30 transition-all text-sm font-medium"
                        data-testid="butler-qa-signup"
                      >
                        <Sparkles size={16} className="text-stage-mint shrink-0" />
                        Create My Account
                      </button>
                      <button
                        onClick={() => sendMessage("What is STAGEPASS")}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
                        data-testid="butler-qa-whatis"
                      >
                        What is STAGEPASS?
                      </button>
                      <button
                        onClick={() => sendMessage("How do I go live")}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
                        data-testid="butler-qa-howlive"
                      >
                        How do I go live?
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Message history */}
              {messages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block max-w-[85%] rounded-xl p-3 ${
                      msg.role === "user"
                        ? "bg-stage-indigo text-white"
                        : "bg-white/5 text-white/90"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-stage-mutetext text-xs">
                  <Loader size={14} className="animate-spin" /> Encore is thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-white/10 bg-black/20">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Encore anything..."
                className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm border border-white/10 text-white placeholder:text-white/30 focus:border-stage-mint outline-none transition-colors"
                data-testid="butler-input"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-stage-indigo hover:bg-stage-indigo/80 disabled:opacity-40 transition-all"
                data-testid="butler-send"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="h-14 w-14 rounded-full bg-stage-indigo text-white flex items-center justify-center shadow-lg shadow-stage-indigo/30 border border-white/10"
        data-testid="butler-toggle"
      >
        <Sparkles size={22} />
      </motion.button>
    </div>
  );
}
