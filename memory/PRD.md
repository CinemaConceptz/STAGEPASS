# STAGEPASS — Production Architecture & PRD

## Problem Statement
Creator ecosystem platform "STAGEPASS" on Google Cloud. Allows creators to upload videos,
live stream, create radio stations, and build an audience. Creator-controlled visibility 
(chronological feeds, no algorithm suppression).

## Service Architecture (4-Service Production)
```
apps/
├── web/      # Next.js 14 — Frontend (Cloud Run stagepass-web)
├── api/      # Express.js — Business Logic (Cloud Run stagepass-api)
├── worker/   # Express.js — Media Processing (Cloud Run stagepass-worker)
└── mobile/   # React Native (Expo) — iOS & Android native apps
```

## Completed Features (March 2026)

### Live Stream RTMP Fix (March 2026)
- Fixed critical bug: stream key was hardcoded as `"live"` — now correctly extracted from GCP inputUri
- GCP `inputUri` (`rtmp://IP/app/key`) is now parsed and split: `rtmpServer` + `gcpStreamKey`
- OBS instructions updated: added warning to NOT use Auto-Configuration Wizard, use Settings → Stream manually
- Added `/api/admin/claim` Next.js route for first-time admin self-promotion (no Firestore console needed)
- Added `/api/admin/claim` Express route as backup
- Added "Admin Access" section on Profile page with Claim Admin button + link to Admin Dashboard

### Show Scheduling & Auto-DJ
- Weekly schedule editor (day/time slots, show name, description)
- Auto-DJ: client-side sequential playback, epoch-synced (all listeners hear same track)
- Deterministic shuffle mode (same shuffle order per day for all listeners)
- Schedule API: GET/POST /api/radio/schedule
- ScheduleGrid component shows active show, upcoming shows, weekly grid
- Mini player with skip track, mute, Auto-DJ/Scheduled mode indicator

### React Native Mobile App (Expo)
- 6 screens: Feed, Radio, Live, Profile, Login, Signup
- Bottom tab navigation (Feed, Radio, Live, Profile)
- Firebase Auth with AsyncStorage persistence
- expo-av for radio audio playback with mini player
- expo-image-picker for profile photo
- EAS build configs for iOS/Android production builds
- Same STAGEPASS theme tokens (colors, spacing) as web

### Web App (Next.js 14)
- Auth: Google Sign-In, Email/Password, privacy agreement, password eye toggle
- Profile: customizable (name, bio, avatar upload, social links, Google Drive management, admin claim)
- Radio: active stations grid, featured station, multi-track audio picker with checkboxes
- Live: RTMP URL + Stream Key (OBS-ready split) for streaming software
- Landing: hero shows most recent uploaded video
- HLS Player: multi-quality ABR with quality selector
- PWA: manifest.json, icons, mobile viewport, installable
- Butler (Encore): Gemini AI assistant
- Image upload: drag-and-drop file upload (not URL input)

### API Service (Express.js)
- Firebase ID token verification
- Content CRUD, signed URLs, Drive import
- Live session provisioning with RTMP URL + Stream Key (correctly split for OBS)
- Radio station management (multi-track, artwork)
- Schedule CRUD, Auto-DJ settings
- Follow/Unfollow, Notifications, Analytics, Admin stats

### Media Worker (Express.js)
- Pub/Sub push endpoint for content processing
- Drive → GCS transfer, Transcoder API (720p + 360p HLS)

## Key API Endpoints
- `POST /api/radio/schedule` — Save show schedule + Auto-DJ settings
- `GET /api/radio/schedule?stationId=xxx` — Fetch schedule
- `POST /api/radio/station` — Create/update station (multi-track)
- `GET /api/radio/station/now?stationId=xxx` — Auto-DJ now playing
- `POST /api/live/session` — Provision live channel (returns RTMP URL + stream key)
- `POST /api/content/import-drive` — Import from Google Drive

## Firestore Collections
- `users/{uid}` — profiles (socialLinks, driveLinked, bio, avatarUrl)
- `creators/{uid}` — creator channels
- `content/{contentId}` — media items (status: QUEUED|PROCESSING|READY)
- `radioStations/{stationId}` — stations (tracks[], schedule[], autoDjEnabled, autoDjShuffle)
- `liveChannels/{channelId}` — live sessions (streamKey, ingestUrl)
- `follows/{followerId_creatorId}` — follow relationships
- `notifications/{userId}/items/{id}` — notifications
- `liveChats/{channelId}/messages/{id}` — live chat

## P1/P2 Backlog
- **P1**: Stripe Connect for tips/ticketed premieres (future add-on)
- **P2**: Show scheduling live DJ handoff (scheduled show creator goes live during their slot)
- **Future**: Server-side HLS stream generation for radio (FFmpeg on worker)
