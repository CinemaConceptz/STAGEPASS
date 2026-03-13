"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, Send, ChevronDown, Zap, Loader, X, Sparkles } from "lucide-react";
import { useButler } from "./useButler";
import { clsx } from "clsx";
import { useState } from "react";

export default function ButlerDock() {
  const { isOpen, toggle, emotion, messages, sendMessage, isListening, startListening, executeAction, executingAction } = useButler();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] md:w-[400px] h-[500px] bg-stage-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-white/5">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  "h-2 w-2 rounded-full shadow-glowMint animate-pulse",
                  emotion === "EXCITED" ? "bg-stage-mint" : "bg-stage-indigo"
                )} />
                <span className="font-bold text-sm tracking-widest text-white">ENCORE</span>
              </div>
              <button onClick={toggle} className="text-white/50 hover:text-white">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={clsx(
                  "flex flex-col gap-1 max-w-[85%]",
                  msg.role === "user" ? "self-end items-end" : "self-start items-start"
                )}>
                  <div className={clsx(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-stage-indigo text-white rounded-br-sm shadow-glowIndigo" 
                      : "bg-stage-panel border border-white/10 text-white rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                  {msg.actions && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.actions.map((act: any, idx: number) => (
                        <button key={idx} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-lg text-stage-mint transition-colors">
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.pendingAction && (
                    <button
                      onClick={() => executeAction(msg.pendingAction!.type)}
                      disabled={executingAction}
                      className="mt-2 flex items-center gap-1.5 text-xs bg-stage-mint/20 hover:bg-stage-mint/30 border border-stage-mint/40 px-3 py-1.5 rounded-lg text-stage-mint font-bold transition-colors disabled:opacity-50"
                    >
                      {executingAction ? <Loader size={12} className="animate-spin" /> : <Zap size={12} />}
                      {executingAction ? "Executing..." : msg.pendingAction.label}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-black/20 border-t border-white/5 flex gap-2">
              <button 
                onClick={startListening}
                className={clsx(
                  "p-3 rounded-xl transition-all",
                  isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                <Mic size={20} />
              </button>
              <div className="flex-1 relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Encore..."
                  className="w-full h-full bg-transparent border-none outline-none text-sm px-2 text-white placeholder:text-white/30"
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 text-stage-indigo hover:text-white disabled:opacity-30 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock Button */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full bg-stage-indigo shadow-glowIndigo flex items-center justify-center text-white border-2 border-white/10 z-50 hover:border-stage-mint transition-colors"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </motion.button>
    </div>
  );
}
