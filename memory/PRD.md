# STAGEPASS — Production Creator Ecosystem Platform

## Original Problem Statement
Build a production-ready creator ecosystem "STAGEPASS" with:
- Multi-service architecture (Next.js Web UI + Express API + Media Worker)
- Media pipeline: upload from Google Drive, transcode via Cloud Transcoder, HLS playback
- Features: Admin Dashboard, Follow system, Notifications, Media CDN, AI Butler (Encore), Creator Analytics, Live Chat, Live Streaming, Radio Stations with Auto-DJ
- Mobile apps (React Native/Expo)
- Deployment: Google Cloud Run via deploy_fast.ps1

## Architecture
```
/app/stagepass/
├── apps/web/          # Next.js 14 — main UI + server-side API routes
├── apps/api/          # Express.js API (legacy)
├── apps/worker/       # FFmpeg worker for HLS stream generation
├── apps/mobile/       # React Native (Expo) iOS + Android
├── scripts/
│   └── deploy_production.ps1
└── deploy_fast.ps1    # Primary deployment script
```

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend:** Next.js API Routes (Firebase Admin SDK)
- **Database:** Firebase Firestore (Admin SDK for server-side)
- **Auth:** Firebase Auth (email + Google OAuth)
- **Storage:** Google Cloud Storage (GCS)
- **AI:** Gemini 1.5 Flash via Generative Language API (key) or Vertex AI (ADC)
- **Media:** Google Drive import, HLS via FFmpeg worker
- **Deploy:** Google Cloud Run

## Key DB Schema
- `users/{uid}` — profile, socialLinks, driveLinked, roles
- `creators/{uid}` — slug, displayName, followerCount
- `content/{contentId}` — title, type, thumbnailUrl, driveFileId, playbackUrl, creatorId
- `radioStations/{stationId}` — tracks[], artworkUrl, autoDjEnabled
- `liveChannels/{channelId}` — status (LIVE/ENDED), ownerUid, playbackUrl
- `follows/{followId}` — creatorId, followerId
- `comments/{contentId}/messages` — live chat + comments

## What's Been Implemented

### Session 1 (Kickoff)
- Full platform setup: Next.js web app, Express API, Express media worker, React Native mobile
- Firebase Firestore integration via Admin SDK
- All core pages: Explore, Live, Radio, Content, Studio, Profile, Admin
- Media pipeline: Drive import → Pub/Sub → Worker → GCS → HLS
- AI Butler (Encore) with Gemini AI
- Follow system, Comments, Notifications
- Live Chat via polling
- Radio Station Auto-DJ with HLS
- Admin Dashboard

### Session 2
- TypeScript build error fixes (driveFileId, listenerCount props)
- Favicon fix (0-byte → valid SVG)
- Firebase Admin SDK root cause identified (P0 blocker)

### Session 3 — MAJOR FIXES (Current)
- **[CRITICAL P0] Firebase Admin SDK** — Added Firebase service account credentials
  (`FIREBASE_PRIVATE_KEY` + `FIREBASE_CLIENT_EMAIL`) to both deploy scripts so Firestore
  connects reliably on Cloud Run (no more silent ADC failures)
- **Profile page** — `update()` → `set({merge:true})` so save works on new users
- **Profile page** — "View Channel" link added; reads creator.slug from API response
- **Studio Dashboard** — Real analytics (totalViews, followers) from `/api/analytics`
- **Live Page** — Green "Go Live" when not streaming; red "LIVE — End Stream" when active;
  streams end → status=ENDED (removed from Live page); empty state → Explore
- **Creator Page** — "Content Creator Not Found" text; Follow button on profile
- **Encore Butler** — Draggable/floating with minimize button; conversation history passed
  to AI; temperature 0.7 for varied responses; proper greeting "I'm Encore, What are we premiering today?"
- **Upload Page** — Drive token persisted across "Upload Another"; custom thumbnail upload section
- **DrivePicker** — `initialToken` prop; Google "unverified app" explanation note
- **Player** — Drive iframe uses `sandbox` attribute; removes pop-out/download capability
- **Radio** — Station artwork shown in mini player; GCS copy at station creation time
  for immediate audio playback (instead of relying on async worker)
- **Explore** — "Previously Recorded" category for ended live streams; proper thumbnail fallback
- **Radio Station Route** — Immediate Drive→GCS copy on station save using provided OAuth token
- **Live Activate API** — Supports `action: "END"` to properly end streams

## Service Account Credentials
- Email: `firebase-adminsdk-fbsvc@stagepass-live-v1.iam.gserviceaccount.com`
- Both deploy scripts now pass `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`

## Key API Endpoints
- `/api/health` — Admin SDK connection test
- `/api/profile` (GET/PUT) — User profile
- `/api/auth/signup` (POST) — Create user+creator docs
- `/api/content/feed` (GET) — Content list with thumbnails
- `/api/content/import-drive` (POST) — Import from Google Drive
- `/api/analytics` (GET) — Creator stats
- `/api/radio/station` (POST) — Create/update station (copies audio to GCS)
- `/api/radio/station/now` (GET) — Now playing
- `/api/live/channels` (GET) — Active live streams only
- `/api/live/activate` (POST) — Start/end a live stream
- `/api/butler/resolve` (POST) — AI Butler (Gemini)
- `/api/comments/[contentId]` — Video comments
- `/api/follow/[creatorId]` — Follow/unfollow

## P0/P1/P2 Remaining

### P0 (Blocker for Production)
- Verify Firebase Admin SDK works on deployed Cloud Run (test via /api/health after deploy)

### P1 (High Priority)
- HLS Auto-DJ worker deployment via deploy_fast.ps1
- Google OAuth app verification in GCP Console (removes "unverified app" warning)

### P2 (Medium Priority)
- Monetization / Stripe Connect
- Mobile app build & App Store submission
- Push notifications (Firebase FCM)
- Video thumbnails auto-generation from frames

### P3 / Backlog
- CDN signed URLs for media security
- Advanced analytics (charts, graphs)
- Creator verification system
- Branded streaming pages
