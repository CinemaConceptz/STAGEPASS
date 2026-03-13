# STAGEPASS — Production PRD

## Problem Statement
Creator ecosystem platform "STAGEPASS" on Google Cloud. Creators upload videos,
live stream, create radio stations, and build audiences. Creator-controlled visibility.

## Architecture
```
apps/
├── web/      # Next.js 14 — All API routes + Frontend (Cloud Run)
├── api/      # Express.js — Legacy routes (Cloud Run)
├── worker/   # Express.js — FFmpeg HLS, transcode (Cloud Run)
└── mobile/   # React Native (Expo) — iOS & Android
```

**Key pattern:** ALL Firestore access goes through Next.js API routes using Firebase Admin SDK (bypasses security rules). NO client-side Firestore reads/writes.

## Completed Features

### Core Platform
- Auth: Google Sign-In, Email/Password
- Profile: name, bio, avatar, social links, Google Drive link (all via /api/profile)
- Content feed, explore, creator pages
- PWA: manifest.json, icons, installable

### Media Pipeline
- Drive import: fetches **Drive API thumbnailLink** for thumbnails + stores **drivePreviewUrl** for playback fallback
- Player: HLS → signed GCS URL → Drive iframe preview fallback → "Processing" state
- Pub/Sub triggers worker for async transcoding

### Radio System
- Station creation with Drive audio tracks (stores both GCS + driveUrl per track)
- Auto-DJ: epoch-synced deterministic playback, shuffle mode, mood filter
- Crossfade engine: dual-audio (audioA/audioB) with configurable fade duration
- Schedule: 15-min intervals, "Midnight" end time, weekly grid
- **Live DJ Handoff**: TAKE_OVER/RELEASE endpoints, station/now returns LIVE_DJ mode
- **HLS Stream Generation**: worker call → PubSub → Firestore queue (3-tier fallback)

### Live Streaming
- RTMP provisioning with OBS-ready stream key
- **Live Chat**: Server-side polling API (replaced broken client SDK subscription)
- Stream status detection

### Social Features
- Follow/unfollow with follower count
- Notifications with 30s polling + mark-all-read
- Comments on recorded videos (replaced LiveChat)
- Mood tagging on uploads (Chill/Hype/Deep/Smooth/Energy)

### AI Butler (Encore)
- 3-tier fallback: Google API key → Vertex AI ADC → rule-based keyword matching
- Actions: GO_LIVE, UPLOAD_VIDEO, RADIO_STATION, SHOW_ANALYTICS, NAVIGATE

### Admin Dashboard
- Server-side stats API (/api/admin/stats)
- Content moderation (approve/reject)
- Admin claim for first user

### Mobile Responsive
- Sidebar: hidden on mobile, hamburger menu with overlay
- Layout: md:ml-56 with pt-14 mobile topbar clearance
- All pages: responsive grids, text sizes, button stacking

### Infrastructure
- **Health check**: GET /api/health tests Admin SDK + Firestore connectivity
- **Admin SDK**: 3-tier init (service account cert → ADC → fallback) with logging
- **Deploy script**: Grants permissions to BOTH App Engine + Compute SAs, includes firebase.admin role, post-deploy health check
- SVG favicon

## All API Endpoints
- `POST /api/auth/signup` — Create user + creator profile
- `GET/PUT /api/profile` — Read/update profile
- `GET /api/health` — Backend connectivity check
- `GET /api/content/feed` — Feed with drivePreviewUrl
- `GET /api/content/[id]` — Single content
- `GET /api/content/[id]/signed-url` — GCS signed URL
- `POST /api/content/import-drive` — Drive import with thumbnail fetch
- `GET/POST /api/comments/[contentId]` — Comments
- `GET/POST /api/live/chat/[channelId]` — Live chat (server-side)
- `POST /api/live/session` — Live stream provision
- `POST /api/radio/station` — Create/update station
- `GET /api/radio/stations` — List stations
- `GET /api/radio/station/now` — Now playing (Auto-DJ/LIVE_DJ/SCHEDULED)
- `POST /api/radio/generate-stream` — HLS generation
- `GET/POST /api/radio/dj-handoff` — DJ take over/release
- `GET/POST /api/radio/schedule` — Schedule management
- `GET/POST/DELETE /api/follow/[creatorId]` — Follow system
- `GET/POST /api/notifications` — Notifications
- `POST /api/butler/resolve` — AI butler
- `GET/PUT /api/admin/stats` — Admin dashboard
- `POST /api/admin/claim` — Admin claim

## P1/P2 Backlog
- **P2**: Mobile app build & submission guide
- **Future**: Stripe Connect (user deferred)
- **Future**: Content thumbnail generation via worker
