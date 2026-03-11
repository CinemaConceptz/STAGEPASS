"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export type ButlerEmotion = "FOCUSED" | "EXCITED" | "CALM" | "ANALYTICAL" | "CONCERNED";

export interface ButlerMessage {
  role: "user" | "butler";
  text: string;
  emotion?: ButlerEmotion;
  actions?: { label: string; action: string }[];
}

export function useButler() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [emotion, setEmotion] = useState<ButlerEmotion>("FOCUSED");
  const [messages, setMessages] = useState<ButlerMessage[]>([
    { 
      role: "butler", 
      text: "I am Encore. How can I assist your production today?", 
      emotion: "FOCUSED" 
    }
  ]);
  const [isListening, setIsListening] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const sendMessage = useCallback(async (text: string) => {
    // 1. Add User Message
    setMessages(prev => [...prev, { role: "user", text }]);
    setEmotion("ANALYTICAL"); // Thinking state

    try {
      // 2. Call API
      const res = await fetch("/api/butler/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();

      // 3. Add Butler Response
      setMessages(prev => [...prev, { 
        role: "butler", 
        text: data.text, 
        emotion: data.emotion as ButlerEmotion
      }]);
      setEmotion(data.emotion as ButlerEmotion);

      // 4. Handle Navigation Action
      if (data.action === "NAVIGATE" && data.target) {
        setTimeout(() => {
          router.push(data.target);
        }, 1500); // Slight delay for effect
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: "butler", text: "Connection error.", emotion: "CONCERNED" }]);
      setEmotion("CONCERNED");
    }

  }, [router]);

  const startListening = () => {
    // Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    setIsListening(true);
    setEmotion("FOCUSED");

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      sendMessage(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setEmotion("CONCERNED");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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
