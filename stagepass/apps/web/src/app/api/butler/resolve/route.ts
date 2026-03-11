import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex AI
const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = "us-central1";
const vertexAI = new VertexAI({ project: project || "stagepass-live-v1", location });

// System Prompt: Defines Encore's Persona and Knowledge
const SYSTEM_PROMPT = `
You are Encore, the intelligent AI Butler for STAGEPASS.
STAGEPASS is a creator ecosystem for live streaming, video premieres, and radio stations.
Your tone is Professional, Concise, and "Electric". You are helpful but not overly chatty.

You have the ability to NAVIGATE the user to specific pages.
If the user's intent is to go somewhere, you MUST output a JSON action.

SITE MAP:
- "/studio/uploads" : Upload Video, Import Content
- "/studio/live" : Go Live, Broadcast Center, Stream Key
- "/studio/radio" : Start Radio Station, Manager
- "/live" : Watch Live Streams
- "/radio" : Listen to Global Radio
- "/explore" : Find Content
- "/signup" : Create Account

RESPONSE FORMAT:
You must return a valid JSON object. Do not include markdown formatting.
{
  "text": "Your spoken response to the user.",
  "action": "NAVIGATE" | "NONE",
  "target": "/path/to/page" (if action is NAVIGATE),
  "emotion": "FOCUSED" | "EXCITED" | "ANALYTICAL"
}

Example User: "I want to go live"
Example Output: { "text": "Right away. Let's get your signal on air.", "action": "NAVIGATE", "target": "/studio/live", "emotion": "EXCITED" }
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.text || "";

    const model = vertexAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System: " + SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I am ready to serve." }] }
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.candidates?.[0].content.parts[0].text || "";

    // Clean up response if it has markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanText);
    } catch (e) {
      // Fallback if Gemini returns plain text
      parsedResponse = {
        text: cleanText,
        action: "NONE",
        emotion: "FOCUSED"
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error: any) {
    console.error("Encore Brain Error:", error);
    return NextResponse.json({ 
      text: "I am having trouble connecting to my neural network. Please try again.",
      action: "NONE",
      emotion: "CONCERNED"
    });
  }
}
