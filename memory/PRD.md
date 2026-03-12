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

## Completed (March 2026 — Full Build)

### ✅ Web App (Next.js 14)
- Route group layouts added: `(studio)`, `(public)`, `(auth)` — all navigation works
- Studio auth guard: redirects to /login if not authenticated
- Creator channel page: fetches real Firestore data (no fake hardcoded content)
- Live page: fetches real live channels from Firestore
- Radio studio: DrivePicker fixed to accept audio/* MIME types
- Butler (Encore): Gemini 1.5 Flash via REST API (no ADC needed)
- All API routes use Firebase Admin SDK (not client SDK)
- `next.config.js`: serverExternalPackages for all GCP packages
- Build: ✅ 22 routes compiled, zero errors

### ✅ API Service (Express.js — apps/api/)
- Firebase ID token verification middleware on all protected routes
- `POST /content/import-drive` — queue Drive file + create Firestore doc + publish Pub/Sub
- `GET /content/signed-upload` — mint GCS signed upload URL
- `GET /content/:id`, `GET /content/feed/recent`
- `POST /live/session` — provision Live Stream API channel
- `POST /live/session/:id/stop`
- `POST /radio/stations` — create/update station
- `GET /radio/stations/global`, `GET /radio/stations/:id`
- `GET /radio/stations/:id/now` — deterministic now-playing calculation
- `POST /butler/resolve` — Gemini 1.5 Flash
- `POST /creators`, `GET /creators/:slug`

### ✅ Media Worker (Express.js — apps/worker/)
- `POST /tasks/process-content` — Pub/Sub push endpoint
- Drive OAuth token → GCS raw bucket transfer (streaming)
- Transcoder API: 720p HD + 360p SD HLS + thumbnail at 5s
- Polls job status until SUCCEEDED/FAILED
- Updates Firestore status: INGESTING → TRANSCODING → READY/FAILED
- Makes processed GCS objects publicly readable for HLS playback

### ✅ Deploy Script (deploy_fast.ps1)
- Deploys all 3 services in order: api → worker → web
- Enables all required GCP APIs
- Creates Artifact Registry repo (idempotent)
- Creates Pub/Sub topic + push subscription (worker endpoint)
- Creates Pub/Sub invoker service account with proper IAM
- Grants all service account permissions (storage, transcoder, firestore, etc.)
- Configures GCS CORS for HLS playback
- Makes processed bucket publicly readable

## Environment Variables

### Required at Deploy Time (in deploy_fast.ps1)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1005750289786:web:b77c70ef474707640d02c3` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0` |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | `AIzaSyDGg9xBDUyXoS6hNepgMx5xAacX_C3q_TI` |
| `FIREBASE_PROJECT_ID` | `stagepass-live-v1` |
| `GCS_BUCKET` | `stagepass-live-v1.firebasestorage.app` |
| `GOOGLE_API_KEY` | Same as GOOGLE_API_KEY above |

## GCP Services Required
- Cloud Run (web, api, worker)
- Cloud Build + Artifact Registry
- Pub/Sub (stagepass-content-process topic)
- Cloud Storage (Firebase Storage bucket)
- Transcoder API
- Live Stream API
- Firestore
- Google Drive API
- Generative Language API (Gemini)

## Firestore Collections
- `users/{uid}` — user profiles
- `creators/{uid}` — creator channels (slug, displayName, type, bio)
- `content/{contentId}` — media items (status: QUEUED→INGESTING→TRANSCODING→READY)
- `radioStations/{stationId}` — radio stations
- `liveChannels/{channelId}` — active live sessions

## P1/P2 Backlog
- **P1**: Stripe Connect for tips/ticketed premieres
- **P1**: Firebase Realtime Database for live chat
- **P1**: Custom domain stagepassaccess.com → Cloud Run mapping
- **P2**: Admin dashboard for station review/approval
- **P2**: Follow system + follower notifications
- **P2**: Signed URL playback (Media CDN)
- **P2**: Multi-quality ABR in radio player
- **Future**: Mobile PWA, AI butler action execution, creator analytics
