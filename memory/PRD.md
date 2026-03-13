# STAGEPASS — Production Architecture & PRD

## Problem Statement
Creator ecosystem platform "STAGEPASS" on Google Cloud. Allows creators to upload videos,
live stream, create radio stations, and build an audience. Creator-controlled visibility 
(chronological feeds, no algorithm suppression).

## Service Architecture (3-Tier Production)
```
apps/
├── web/      # Next.js 14 — Thin UI client (Cloud Run stagepass-web)
├── api/      # Express.js — All privileged operations (Cloud Run stagepass-api)
└── worker/   # Express.js — Media processing (Cloud Run stagepass-worker)
```

## Upload Pipeline (Production)
```
User → Drive Picker → POST /api/content/import-drive (web route)
  → Firestore doc created (status=QUEUED)
  → Pub/Sub message published to stagepass-content-process
  → Worker receives push → downloads Drive → GCS raw bucket
  → Transcoder API job → GCS processed bucket (HLS manifest)
  → Firestore status → READY
  → Playback URL: https://storage.googleapis.com/{bucket}/processed/{contentId}/manifest.m3u8
```

## Completed (March 2026 — Full Build + Feature Expansion)

### Web App (Next.js 14)
- Route group layouts: `(studio)`, `(public)`, `(auth)`, `(admin)`
- Login page: password eye toggle, Google Sign-In
- Signup page: privacy agreement popup, password eye toggle, Google Sign-Up (with Drive permission), hidden slug (auto-generated)
- Profile page: customizable (name, bio, avatar, social links, Google Drive connection management)
- Radio page: active stations grid, featured station of the month, mini player, sign up CTA
- Radio studio: station creation with name, description, artwork, Drive folder selection
- Live page: broadcast with RTMP URL + Stream Key for OBS/Prism/3rd party
- Landing page: hero shows most recent uploaded video (auto-rotates)
- HLS Player: multi-quality ABR with quality selector (Auto/720p/360p)
- PWA: manifest.json, icons, mobile viewport, installable
- Butler (Encore): Gemini via server-side API key (not exposed in browser)
- Firestore calls: 8s timeout with Promise.race (no infinite loading)
- All interactive elements have data-testid attributes
- Logo: proper STAGEPASS icon (replaced 0-byte empty file)

### API Service (Express.js — apps/api/)
- Firebase ID token verification middleware
- Content CRUD, signed URLs, Drive import
- Live session provisioning with RTMP URL + Stream Key
- Radio station management
- Follow/Unfollow system
- Notifications, Analytics, Admin stats
- Butler (Gemini 1.5 Flash)

### Media Worker (Express.js — apps/worker/)
- Pub/Sub push endpoint for content processing
- Drive → GCS transfer, Transcoder API (720p + 360p HLS)
- Firestore status updates: INGESTING → TRANSCODING → READY/FAILED

### Deployment
- deploy_production.ps1: deploys all 3 services
- SETUP.md: post-deployment guide (Firebase Auth, Drive API, Firestore indexes, custom domain)

## Environment Variables
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1005750289786:web:b77c70ef474707640d02c3` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0` |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | `AIzaSyDGg9xBDUyXoS6hNepgMx5xAacX_C3q_TI` |
| `FIREBASE_PROJECT_ID` | `stagepass-live-v1` |

## GCP Services Required
- Cloud Run (web, api, worker)
- Cloud Build + Artifact Registry
- Pub/Sub (stagepass-content-process topic)
- Cloud Storage (Firebase Storage bucket)
- Transcoder API, Live Stream API
- Firestore, Drive API
- Generative Language API (Gemini)

## Firestore Collections
- `users/{uid}` — user profiles (with socialLinks, driveLinked fields)
- `creators/{uid}` — creator channels
- `content/{contentId}` — media items
- `radioStations/{stationId}` — radio stations (with artworkUrl, description)
- `liveChannels/{channelId}` — active live sessions (with streamKey)
- `follows/{followerId_creatorId}` — follow relationships
- `notifications/{userId}/items/{id}` — user notifications
- `liveChats/{channelId}/messages/{id}` — live chat messages

## P1/P2 Backlog
- **P1**: Stripe Connect for tips/ticketed premieres (future add-on)
- **P2**: Show scheduling and Auto-DJ functionality
- **Future**: Native mobile apps (iOS/Android)
