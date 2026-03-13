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

/**
 * Get an access token via Application Default Credentials (works on Cloud Run).
 * Falls back to GOOGLE_API_KEY if ADC is unavailable.
 */
async function getGeminiResponse(userMessage: string): Promise<any> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const hasValidApiKey = apiKey && !apiKey.includes("dummy");

  const requestBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
  };

  // Strategy 1: Use API key if available and not dummy
  if (hasValidApiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    if (res.ok) return res.json();
    console.warn(`[encore] API key auth failed (${res.status}), trying ADC...`);
  }

  // Strategy 2: Use Application Default Credentials (Cloud Run service account)
  try {
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/generative-language"],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse?.token;

    if (!accessToken) throw new Error("ADC: no access token");

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "stagepass-live-v1";
    const res = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + userMessage }] }
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      }
    );

    if (res.ok) return res.json();
    throw new Error(`Vertex AI ${res.status}: ${await res.text()}`);
  } catch (adcError: any) {
    console.warn(`[encore] ADC/Vertex failed: ${adcError.message}`);
  }

  // Strategy 3: Fallback — rule-based responses (works without any API key)
  return null;
}

function getFallbackResponse(userMessage: string, isAuthenticated: boolean = true) {
  const lower = userMessage.toLowerCase();

  // Signup assistance for non-authenticated users
  if (!isAuthenticated) {
    if (lower.includes("account") || lower.includes("sign") || lower.includes("create") || lower.includes("join") || lower.includes("register")) {
      return { text: "Let's get you set up! I'll take you to the signup page. You can sign up with email or Google. Tip: Google signup also connects your Drive for easy uploads.", action: "SIGNUP", target: "/signup", emotion: "EXCITED" };
    }
    if (lower.includes("live") || lower.includes("stream") || lower.includes("upload") || lower.includes("radio")) {
      return { text: "To go live, upload content, or start a radio station, you'll need an account first. Want me to help you create one?", action: "NONE", emotion: "FOCUSED" };
    }
  }

  if (lower.includes("live") || lower.includes("stream") || lower.includes("broadcast")) {
    return { text: "I'll get your live channel ready. Taking you to the broadcast center now.", action: "GO_LIVE", emotion: "EXCITED" };
  }
  if (lower.includes("upload") || lower.includes("video") || lower.includes("import") || lower.includes("premiere")) {
    return { text: "Let's premiere something. Opening the upload suite.", action: "UPLOAD_VIDEO", emotion: "FOCUSED" };
  }
  if (lower.includes("radio") || lower.includes("station") || lower.includes("dj") || lower.includes("music")) {
    return { text: "Your radio station awaits. Let's set it up.", action: "RADIO_STATION", emotion: "FOCUSED" };
  }
  if (lower.includes("stat") || lower.includes("analytics") || lower.includes("perform") || lower.includes("dashboard") || lower.includes("numbers")) {
    return { text: "Let me pull up your numbers.", action: "SHOW_ANALYTICS", emotion: "ANALYTICAL" };
  }
  if (lower.includes("admin")) {
    return { text: "Opening the Admin panel.", action: "NAVIGATE", target: "/admin", emotion: "FOCUSED" };
  }
  if (lower.includes("profile") || lower.includes("settings") || lower.includes("account") || lower.includes("edit")) {
    return { text: "Opening your profile settings.", action: "NAVIGATE", target: "/studio/profile", emotion: "FOCUSED" };
  }
  if (lower.includes("schedule")) {
    return { text: "Let's manage your show schedule.", action: "NAVIGATE", target: "/studio/radio/schedule", emotion: "FOCUSED" };
  }
  if (lower.includes("explore") || lower.includes("discover") || lower.includes("browse") || lower.includes("find")) {
    return { text: "Let's see what's out there.", action: "NAVIGATE", target: "/explore", emotion: "EXCITED" };
  }
  if (lower.includes("what") && (lower.includes("stagepass") || lower.includes("this"))) {
    return { text: "STAGEPASS is a creator-first ecosystem for live streams, video premieres, and radio stations. No algorithm — your content, your audience, your signal. Creators upload content from Google Drive, go live with OBS, and build radio stations with Auto-DJ.", action: "NONE", emotion: "FOCUSED" };
  }
  if (lower.includes("help") || lower.includes("what can")) {
    return { text: "I can help you go live, upload a premiere, start a radio station, check your analytics, manage your schedule, or explore content. Just tell me what you need.", action: "NONE", emotion: "FOCUSED" };
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("yo")) {
    return { text: isAuthenticated ? "What are we building today? I can help you go live, upload content, or launch a radio station." : "Welcome to STAGEPASS! Want me to help you create an account?", action: "NONE", emotion: "EXCITED" };
  }
  if (lower.includes("thank")) {
    return { text: "Anytime. That's what I'm here for.", action: "NONE", emotion: "FOCUSED" };
  }
  if (lower.includes("drive") || lower.includes("google")) {
    return { text: "Google Drive integration lets you import videos and audio directly. Connect it from your profile settings.", action: "NAVIGATE", target: "/studio/profile", emotion: "FOCUSED" };
  }

  // Default — different based on auth status
  return isAuthenticated
    ? { text: "I can help you go live, premiere a video, start a radio station, or check your stats. What sounds good?", action: "NONE", emotion: "FOCUSED" }
    : { text: "Welcome to STAGEPASS! I can help you create an account, explore content, or learn about the platform. What would you like?", action: "NONE", emotion: "FOCUSED" };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.text || "";
    const isAuthenticated = body.isAuthenticated !== false;

    const geminiData = await getGeminiResponse(userMessage);

    if (geminiData) {
      const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      try {
        return NextResponse.json(JSON.parse(clean));
      } catch {
        return NextResponse.json({ text: clean || "I'm ready to assist.", action: "NONE", emotion: "FOCUSED" });
      }
    }

    // No AI available — use rule-based fallback
    return NextResponse.json(getFallbackResponse(userMessage, isAuthenticated));
  } catch (error: any) {
    console.error("[encore] Error:", error);
    return NextResponse.json(getFallbackResponse("", true));
  }
}
