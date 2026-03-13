import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are Encore, the intelligent AI Butler for STAGEPASS.
STAGEPASS is a creator ecosystem for live streams, video premieres, and radio stations.
Tone: Professional, Concise, Electric. Not overly chatty.

You can EXECUTE real actions on behalf of the creator, not just navigate.

ACTIONS AVAILABLE:
- NAVIGATE + target: Go to a specific page
- GO_LIVE: Provision a live stream channel (requires user confirmation)
- UPLOAD_VIDEO: Take user to upload page
- SHOW_ANALYTICS: Show creator analytics dashboard
- RADIO_STATION: Take user to radio station manager
- NONE: Just respond with information

SITE MAP:
- "/studio/uploads" : Upload Video, Import Content from Drive
- "/studio/live" : Go Live, Broadcast Center, Stream Key
- "/studio/radio" : Start Radio Station, Station Manager
- "/studio/analytics" : Creator Analytics, Stats, Performance
- "/admin" : Admin Dashboard (admins only)
- "/live" : Watch Live Streams
- "/radio" : Listen to Global Radio
- "/explore" : Find and Discover Content
- "/login" : Sign In
- "/signup" : Create Account

RESPONSE FORMAT — Return ONLY valid JSON, no markdown code blocks:
{
  "text": "Your spoken response to the user.",
  "action": "NAVIGATE" | "GO_LIVE" | "UPLOAD_VIDEO" | "SHOW_ANALYTICS" | "RADIO_STATION" | "NONE",
  "target": "/path/if/navigate",
  "emotion": "FOCUSED" | "EXCITED" | "ANALYTICAL" | "CONCERNED"
}

Examples:
User: "I want to go live" → {"text":"I'll provision a live channel for you right now. Confirm to proceed.","action":"GO_LIVE","emotion":"EXCITED"}
User: "show my stats" → {"text":"Pulling up your performance dashboard.","action":"SHOW_ANALYTICS","emotion":"ANALYTICAL"}
User: "upload a video" → {"text":"Taking you to the upload suite.","action":"UPLOAD_VIDEO","emotion":"FOCUSED"}
User: "what is STAGEPASS" → {"text":"STAGEPASS is a creator-first platform for live streams, video premieres, and radio. No algorithm — just your content, your audience, your signal.","action":"NONE","emotion":"FOCUSED"}
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.text || "";

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: "Encore is offline. Google API key not configured.", action: "NONE", emotion: "CONCERNED" });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      return NextResponse.json(JSON.parse(clean));
    } catch {
      return NextResponse.json({ text: clean || "I'm ready to assist.", action: "NONE", emotion: "FOCUSED" });
    }
  } catch (error: any) {
    console.error("Encore Brain Error:", error);
    return NextResponse.json({ text: "Neural link disrupted. Try again.", action: "NONE", emotion: "CONCERNED" });
  }
}
