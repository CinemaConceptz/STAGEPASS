"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export type ButlerEmotion = "FOCUSED" | "EXCITED" | "CALM" | "ANALYTICAL" | "CONCERNED";

export interface ButlerMessage {
  role: "user" | "butler";
  text: string;
  emotion?: ButlerEmotion;
  actions?: Array<{ label: string; action: string }>;
  pendingAction?: {
    type: string;
    label: string;
    description: string;
  };
}

export function useButler() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [emotion, setEmotion] = useState<ButlerEmotion>("FOCUSED");
  const [messages, setMessages] = useState<ButlerMessage[]>([
    { role: "butler", text: "I am Encore. How can I assist your production today?", emotion: "FOCUSED" }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [executingAction, setExecutingAction] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  // Execute real actions
  const executeAction = useCallback(async (actionType: string) => {
    if (!user) { router.push("/login"); return; }
    setExecutingAction(true);

    try {
      if (actionType === "GO_LIVE") {
        setMessages(prev => [...prev, { role: "butler", text: "Provisioning your live channel on Google Cloud. Stand by...", emotion: "EXCITED" }]);
        const token = await user.getIdToken();
        const res = await fetch("/api/live/session", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: user.uid, title: "Live Stream" }),
        });
        const data = await res.json();
        if (data.success) {
          setMessages(prev => [...prev, {
            role: "butler",
            text: `Channel provisioned. Your RTMP ingest URL is ready. Stream key: live. I'm taking you to the broadcast room.`,
            emotion: "EXCITED",
          }]);
          setTimeout(() => router.push("/studio/live"), 2000);
        } else {
          setMessages(prev => [...prev, { role: "butler", text: `Could not provision channel: ${data.error}`, emotion: "CONCERNED" }]);
        }
      } else if (actionType === "SHOW_ANALYTICS") {
        router.push("/studio/analytics");
        setIsOpen(false);
      } else if (actionType === "UPLOAD_VIDEO") {
        router.push("/studio/uploads");
        setIsOpen(false);
      } else if (actionType === "RADIO_STATION") {
        router.push("/studio/radio");
        setIsOpen(false);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "butler", text: `Action failed: ${err.message}`, emotion: "CONCERNED" }]);
    } finally {
      setExecutingAction(false);
    }
  }, [user, router]);

  const sendMessage = useCallback(async (text: string) => {
    setMessages(prev => [...prev, { role: "user", text }]);
    setEmotion("ANALYTICAL");

    try {
      const res = await fetch("/api/butler/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      setEmotion(data.emotion as ButlerEmotion || "FOCUSED");

      // Determine if action needs confirmation or can execute immediately
      const immediateActions = ["NAVIGATE"];
      const confirmActions = ["GO_LIVE"];

      if (confirmActions.includes(data.action)) {
        setMessages(prev => [...prev, {
          role: "butler",
          text: data.text,
          emotion: data.emotion,
          pendingAction: {
            type: data.action,
            label: data.action === "GO_LIVE" ? "Start Live Stream" : data.action,
            description: data.action === "GO_LIVE" ? "This will provision a Google Cloud live channel" : "",
          },
        }]);
      } else {
        setMessages(prev => [...prev, { role: "butler", text: data.text, emotion: data.emotion }]);
        if (data.action === "NAVIGATE" && data.target) {
          setTimeout(() => router.push(data.target), 1200);
        } else if (data.action === "SHOW_ANALYTICS") {
          setTimeout(() => executeAction("SHOW_ANALYTICS"), 1000);
        } else if (data.action === "UPLOAD_VIDEO") {
          setTimeout(() => executeAction("UPLOAD_VIDEO"), 1000);
        } else if (data.action === "RADIO_STATION") {
          setTimeout(() => executeAction("RADIO_STATION"), 1000);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "butler", text: "Connection error.", emotion: "CONCERNED" }]);
      setEmotion("CONCERNED");
    }
  }, [router, executeAction]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    setIsListening(true);
    setEmotion("FOCUSED");
    recognition.onresult = (event: any) => {
      sendMessage(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => { setIsListening(false); setEmotion("CONCERNED"); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return { isOpen, toggle, emotion, messages, sendMessage, isListening, startListening, executeAction, executingAction };
}
