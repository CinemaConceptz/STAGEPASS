import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are Encore, the intelligent AI Butler for STAGEPASS.
STAGEPASS is a creator ecosystem for live streaming, video premieres, and radio stations.
Your tone is Professional, Concise, and "Electric". You are helpful but not overly chatty.

You have the ability to NAVIGATE the user to specific pages.
If the user's intent is to go somewhere, you MUST output a JSON action.

SITE MAP:
- "/studio/uploads" : Upload Video, Import Content from Drive
- "/studio/live" : Go Live, Broadcast Center, Stream Key
- "/studio/radio" : Start Radio Station, Station Manager
- "/live" : Watch Live Streams
- "/radio" : Listen to Global Radio
- "/explore" : Find and Discover Content
- "/login" : Sign In
- "/signup" : Create Account

RESPONSE FORMAT:
You MUST return ONLY a valid JSON object. Do NOT include markdown code blocks or any extra text.
{
  "text": "Your spoken response to the user.",
  "action": "NAVIGATE" | "NONE",
  "target": "/path/to/page",
  "emotion": "FOCUSED" | "EXCITED" | "ANALYTICAL" | "CONCERNED"
}

Example: User says "I want to go live"
Output: {"text":"Right away. Let's get your signal on air.","action":"NAVIGATE","target":"/studio/live","emotion":"EXCITED"}
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.text || "";

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        text: "Encore is offline. Google API key not configured.",
        action: "NONE",
        emotion: "CONCERNED",
      });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      throw new Error(`Gemini responded with ${res.status}`);
    }

    const data = await res.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code blocks if present
    const cleanText = rawText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanText);
    } catch {
      parsedResponse = {
        text: cleanText || "I'm ready to assist your production.",
        action: "NONE",
        emotion: "FOCUSED",
      };
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Encore Brain Error:", error);
    return NextResponse.json({
      text: "I am having trouble connecting to my neural network. Please try again.",
      action: "NONE",
      emotion: "CONCERNED",
    });
  }
}
