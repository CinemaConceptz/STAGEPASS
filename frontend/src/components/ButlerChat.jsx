import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Mic, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import axios from 'axios';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ButlerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to STAGEPASS. I'm your Butler. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${REACT_APP_BACKEND_URL}/api/chat`, {
        message: input,
        history: messages
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[350px] md:w-[400px] h-[500px] bg-[#121212] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="h-16 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={16} className="text-black" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold">BUTLER AI</h3>
                  <p className="text-xs text-secondary">Online • Gemini Powered</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-br-none" 
                      : "bg-[#1E1E1E] text-zinc-200 rounded-bl-none border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1E1E1E] p-3 rounded-2xl rounded-bl-none border border-white/5 flex space-x-2">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0A0A0A] border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="w-full bg-[#121212] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-[#4B4ACF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary to-[#4B4ACF] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(93,92,255,0.5)] border border-white/20 hover:border-secondary transition-all group"
      >
        {isOpen ? <X size={24} className="text-white" /> : <Sparkles size={24} className="text-white group-hover:animate-spin" />}
      </motion.button>
    </>
  );
}
