"use strict";(()=>{var e={};e.id=861,e.ids=[861],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},58910:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>m,patchFetch:()=>E,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>g,staticGenerationAsyncStorage:()=>d});var r={};o.r(r),o.d(r,{POST:()=>p});var a=o(49303),n=o(88716),i=o(60670),s=o(87070);let u=`
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
`;async function p(e){try{let t;let o=(await e.json()).text||"",r=process.env.NEXT_PUBLIC_GOOGLE_API_KEY;if(!r)return s.NextResponse.json({text:"Encore is offline. Google API key not configured.",action:"NONE",emotion:"CONCERNED"});let a=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:u}]},contents:[{role:"user",parts:[{text:o}]}],generationConfig:{temperature:.4,maxOutputTokens:512}})});if(!a.ok){let e=await a.text();throw console.error("Gemini API error:",a.status,e),Error(`Gemini responded with ${a.status}`)}let n=await a.json(),i=(n.candidates?.[0]?.content?.parts?.[0]?.text||"").replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();try{t=JSON.parse(i)}catch{t={text:i||"I'm ready to assist your production.",action:"NONE",emotion:"FOCUSED"}}return s.NextResponse.json(t)}catch(e){return console.error("Encore Brain Error:",e),s.NextResponse.json({text:"I am having trouble connecting to my neural network. Please try again.",action:"NONE",emotion:"CONCERNED"})}}let l=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/butler/resolve/route",pathname:"/api/butler/resolve",filename:"route",bundlePath:"app/api/butler/resolve/route"},resolvedPagePath:"/app/stagepass/apps/web/src/app/api/butler/resolve/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:c,staticGenerationAsyncStorage:d,serverHooks:g}=l,m="/api/butler/resolve/route";function E(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:d})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[276,972],()=>o(58910));module.exports=r})();