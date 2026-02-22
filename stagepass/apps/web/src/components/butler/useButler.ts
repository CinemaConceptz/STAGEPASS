"use client";

import { useState, useCallback } from "react";

export type ButlerEmotion = "FOCUSED" | "EXCITED" | "CALM" | "ANALYTICAL" | "CONCERNED";

export interface ButlerMessage {
  role: "user" | "butler";
  text: string;
  emotion?: ButlerEmotion;
  actions?: { label: string; action: string }[];
}

export function useButler() {
  const [isOpen, setIsOpen] = useState(false);
  const [emotion, setEmotion] = useState<ButlerEmotion>("FOCUSED");
  const [messages, setMessages] = useState<ButlerMessage[]>([
    { 
      role: "butler", 
      text: "Welcome to STAGEPASS. I'm Encore. What are we premiering today?", 
      emotion: "FOCUSED",
      actions: [
        { label: "Go Live", action: "CREATE_LIVE" },
        { label: "Upload", action: "START_UPLOAD" }
      ]
    }
  ]);
  const [isListening, setIsListening] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const sendMessage = useCallback(async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: "user", text }]);
    
    // Simulate AI processing (mock for skeleton)
    setEmotion("ANALYTICAL");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "butler", 
        text: `I'm routing you to: ${text}. (Mock Response)`, 
        emotion: "EXCITED" 
      }]);
      setEmotion("FOCUSED");
    }, 1000);

  }, []);

  const startListening = () => {
    setIsListening(true);
    // Mock listening
    setTimeout(() => {
      setIsListening(false);
      sendMessage("Find live DJs");
    }, 2000);
  };

  return {
    isOpen,
    toggle,
    emotion,
    messages,
    sendMessage,
    isListening,
    startListening
  };
}