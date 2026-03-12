import { Router, Request, Response } from "express";

export const butlerRouter = Router();

const SYSTEM_PROMPT = `
You are Encore, the AI butler for STAGEPASS — a creator platform for live streams, video premieres, and radio.
Tone: Professional, concise, electric. Not overly chatty.

NAVIGATE users to these pages when they request it:
- "/studio/uploads" → Upload Video, Import from Drive
- "/studio/live" → Go Live, Broadcast Center  
- "/studio/radio" → Radio Station Manager
- "/live" → Watch live streams
- "/radio" → Listen to radio
- "/explore" → Discover content
- "/login" → Sign in
- "/signup" → Create account

RESPONSE FORMAT — return ONLY valid JSON, no markdown:
{"text":"...","action":"NAVIGATE"|"NONE","target":"/path","emotion":"FOCUSED"|"EXCITED"|"ANALYTICAL"|"CONCERNED"}
`;

// POST /butler/resolve
butlerRouter.post("/resolve", async (req: Request, res: Response) => {
  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.json({ text: "Encore is offline. API key not configured.", action: "NONE", emotion: "CONCERNED" });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: text || "" }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      }
    );

    if (!geminiRes.ok) throw new Error(`Gemini ${geminiRes.status}`);
    const data = await geminiRes.json() as any;
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      return res.json(JSON.parse(clean));
    } catch {
      return res.json({ text: clean, action: "NONE", emotion: "FOCUSED" });
    }
  } catch (err: any) {
    return res.json({ text: "Neural link disrupted. Try again.", action: "NONE", emotion: "CONCERNED" });
  }
});
