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

## Completed Features

### Live Stream RTMP Fix (March 2026)
- Fixed critical bug: stream key was hardcoded as `"live"` — now correctly extracted from GCP inputUri
- OBS instructions updated: added warning to NOT use Auto-Configuration Wizard
- Added `/api/admin/claim` for first-time admin self-promotion
- Added "Admin Access" section on Profile page

### Show Scheduling & Auto-DJ
- Weekly schedule editor (day/time slots, show name, description)
- Auto-DJ: client-side sequential playback, epoch-synced (all listeners hear same track)
- Deterministic shuffle mode (same shuffle order per day for all listeners)
- Schedule API: GET/POST /api/radio/schedule
- ScheduleGrid component shows active show, upcoming shows, weekly grid
- Mini player with skip track, mute, Auto-DJ/Scheduled mode indicator

### Advanced Social + Crossfade (March 2026) ✅
- **Dual-audio crossfade engine**: Two HTMLAudioElement instances (audioA/audioB) with volume fade transitions
- **Crossfade settings**: Toggle enable/disable, configurable duration (1-8s) per station
- **Mood tagging**: Creators can tag uploaded content with moods (Chill, Hype, Deep, Smooth, Energy)
- **Mood filter**: Auto-DJ can filter tracks by mood tags, falls back to all tracks if filter yields empty
- **Follow system**: FollowButton component with follow/unfollow toggle, follower count, onToggle callback
- **Notifications**: NotificationBell with polling (30s), mark-all-read, notification dropdown
- **Comments system**: Replaced LiveChat with Comments on recorded video pages (GET/POST /api/comments/[contentId])
- **Play icon fix**: ContentCard play icons now vibrant (gradient bg, stage-mint hover, larger button)
- **Hero play icon**: Updated from barely-visible to prominent stage-mint styled icon
- **Server-side APIs**: /api/follow/[creatorId], /api/notifications, /api/comments/[contentId]
- **Scheduler fix**: Fixed critical `orderedRaw` undefined variable bug
- **Radio page fix**: Added missing `return` statement, fixed imports, removed old audioRef
- **Favicon**: Created SVG favicon (was 0-byte .ico)

### React Native Mobile App (Expo)
- 6 screens: Feed, Radio, Live, Profile, Login, Signup
- Bottom tab navigation, Firebase Auth with AsyncStorage persistence
- EAS build configs for iOS/Android production builds

### Web App (Next.js 14)
- Auth: Google Sign-In, Email/Password, privacy agreement
- Profile: customizable (name, bio, avatar, social links, Google Drive, admin claim)
- Radio: active stations grid, featured station, multi-track audio picker
- Live: RTMP URL + Stream Key (OBS-ready split)
- HLS Player: multi-quality ABR with quality selector
- PWA: manifest.json, icons, mobile viewport, installable
- Butler (Encore): Gemini AI assistant
- Server-side data fetching via Admin SDK (bypasses Firestore security rules)

### API Service (Express.js)
- Firebase ID token verification
- Content CRUD, signed URLs, Drive import
- Live session provisioning, Radio station management
- Follow/Unfollow, Notifications, Analytics, Admin stats

### Media Worker (Express.js)
- Pub/Sub push endpoint for content processing
- Drive → GCS transfer, Transcoder API (720p + 360p HLS)

## Key API Endpoints
- `POST /api/radio/schedule` — Save schedule + Auto-DJ + crossfade + mood settings
- `GET /api/radio/schedule?stationId=xxx` — Fetch schedule with crossfade/mood
- `GET /api/radio/station/now?stationId=xxx` — Auto-DJ now playing (with mood filter)
- `GET /api/radio/stations` — List all stations (Admin SDK)
- `GET/POST/DELETE /api/follow/[creatorId]` — Follow system
- `GET/POST /api/notifications` — Notification system
- `POST /api/live/session` — Provision live channel
- `POST /api/content/import-drive` — Import from Google Drive

## Firestore Collections
- `users/{uid}` — profiles
- `creators/{uid}` — creator channels (followerCount)
- `content/{contentId}` — media items (mood tag)
- `radioStations/{stationId}` — stations (crossfadeEnabled, crossfadeDuration, moodFilter)
- `follows/{followerId_creatorId}` — follow relationships
- `notifications/{userId}/items/{id}` — notifications
- `liveChannels/{channelId}` — live sessions
- `liveChats/{channelId}/messages/{id}` — live chat

## P1/P2 Backlog
- **P1**: Stripe Connect for tips/ticketed premieres
- **P2**: Show scheduling live DJ handoff
- **P2**: Mobile app build & submission guide
- **Future**: Server-side HLS stream generation for radio (FFmpeg on worker)
