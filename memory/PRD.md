# STAGEPASS — Production PRD

## Problem Statement
Creator ecosystem platform on Google Cloud. Creators upload videos, live stream, create radio stations, build audiences.

## Architecture
```
apps/web/    — Next.js 14 (all API routes + frontend, Cloud Run)
apps/api/    — Express.js legacy (Cloud Run)
apps/worker/ — Express.js FFmpeg/transcode (Cloud Run)
apps/mobile/ — React Native Expo (iOS/Android)
```

**Pattern:** ALL Firestore access via Next.js API routes + Firebase Admin SDK. NO client-side Firestore.

## Completed Features

### Core
- Auth (Google + Email), Profile (server-side /api/profile GET/PUT), PWA
- Content feed, explore, creator pages — all server-side
- **Health check:** `/api/health` verifies Admin SDK + Firestore connectivity

### Media
- Drive import with **Drive API thumbnailLink** for real thumbnails
- Player: HLS → signed URL → **Drive iframe** fallback → Processing state
- Pub/Sub async transcoding via worker

### Radio
- Station creation with driveUrl per track (immediate playback)
- Auto-DJ: epoch-synced, shuffle, mood filter, crossfade engine
- Schedule: 15-min intervals, Midnight end time
- **Live DJ Handoff**: TAKE_OVER/RELEASE, station/now returns LIVE_DJ mode
- **HLS Generation**: worker → PubSub → Firestore queue (3-tier)

### Live Streaming
- RTMP with OBS-ready key, **Live Chat via server API** (polling)
- **Green "Go Live" button** (not always-red LIVE badge)
- **FollowButton on live streams** with creator info
- Previously ended broadcasts go to Explore

### Social
- **FollowButton on ALL content cards** with creator name
- Follow/unfollow, notifications, comments on recorded videos
- Mood tagging (Chill/Hype/Deep/Smooth/Energy)

### AI Butler (Encore)
- Greeting: "I'm Encore, What are we premiering today?" + 3 quick action buttons
- **Signup assistant** for non-logged-in users
- 3-tier AI: API key → Vertex AI ADC → **rich rule-based fallback** (20+ intents)
- Actions: GO_LIVE, UPLOAD_VIDEO, RADIO_STATION, SHOW_ANALYTICS, SIGNUP, NAVIGATE

### Admin
- Server-side stats API, content moderation, admin claim

### Mobile Responsive
- Hamburger menu sidebar on mobile, responsive grids/text/buttons
- `md:ml-56` layout with `pt-14` mobile topbar clearance

### Infrastructure
- Admin SDK: cert → ADC → fallback with logging
- Deploy: grants BOTH App Engine + Compute SAs, firebase.admin role
- **Post-deploy health check** in deploy script

## Google Drive Auth Warning
The "app not verified" warning is from Google's OAuth consent screen. To fix:
1. Go to GCP Console → APIs & Services → OAuth consent screen
2. Click "Publish App" to move from Testing to Production
3. Submit for Google verification (requires privacy policy + terms)
Until verified, users see the warning but can click "Advanced → Go to app" to proceed.

## All API Endpoints (22 total)
POST /api/auth/signup, GET|PUT /api/profile, GET /api/health,
GET /api/content/feed, GET /api/content/[id], GET /api/content/[id]/signed-url,
POST /api/content/import-drive, GET|POST /api/comments/[contentId],
GET|POST /api/live/chat/[channelId], POST /api/live/session,
POST /api/radio/station, GET /api/radio/stations, GET /api/radio/station/now,
POST /api/radio/generate-stream, GET|POST /api/radio/dj-handoff,
GET|POST /api/radio/schedule, GET|POST|DELETE /api/follow/[creatorId],
GET|POST /api/notifications, POST /api/butler/resolve,
GET|PUT /api/admin/stats, POST /api/admin/claim

## Backlog
- P2: Mobile app build guide (EAS CLI)
- Future: Stripe Connect (user deferred)
- Future: Worker-based thumbnail generation
