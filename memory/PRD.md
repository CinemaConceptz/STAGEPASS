# STAGEPASS — Product Requirements & Architecture

## Problem Statement
Build a creator ecosystem platform "STAGEPASS" entirely on Google Cloud services. 
A platform allowing users to sign up, create channels, upload video/audio content, 
live stream, and create radio stations. Core philosophy: creator-controlled visibility 
(chronological feeds, no algorithmic suppression).

## Architecture (MASTER_BUILD_SPEC)
```
apps/
├── web/      # Next.js 14 (App Router) — thin UI client
├── api/      # Express.js Cloud Run API (stub/openapi spec exists)
└── worker/   # Media worker (to be built)
```

### Tech Stack
- Frontend: Next.js 14, React 18, Tailwind CSS, Framer Motion
- Auth: Firebase Authentication  
- Database: Firestore
- Storage: Google Cloud Storage (raw + processed buckets)
- Media: Transcoder API (VOD HLS/DASH), Live Stream API
- AI Butler: Gemini 1.5 Flash via REST API (direct)
- Deployment: Cloud Run (stagepass-web), Google Cloud Build

### GCP Project
- Project ID: `stagepass-live-v1`
- Region: `us-central1`

## What's Been Implemented

### ✅ Phase 1 — Core Application (Complete, Build Verified)
- Firebase Auth: signup/login/logout with email+password
- Creator onboarding: slug + channel creation stored in Firestore
- Home feed: reads from `content` Firestore collection (chronological)
- Explore page: content discovery
- Content detail page: HLS video player
- Creator channel page: `/c/{slug}`

### ✅ Butler "Encore" (Fixed - uses Gemini 1.5 Flash REST API)
- AI assistant docked on every page
- Navigation, publishing guidance, policy explanations
- Fixed: replaced broken `@google-cloud/vertexai` (needs ADC) with direct Gemini REST API call
- Uses: `NEXT_PUBLIC_GOOGLE_API_KEY` — no service account needed

### ✅ Studio Features
- Upload Manager: imports video from Google Drive → GCS → Transcoder
- Go Live: provisions Live Stream API channel, returns OBS RTMP URL
- Radio Manager: selects audio files (MP3/WAV/OGG) from Google Drive

### ✅ Radio Station
- Fixed: Drive Picker now accepts audio MIME types (`audio/*`)
- Saves station data to Firestore via Firebase Admin SDK
- Auto-DJ `/api/radio/station/now`: calculates now-playing from playlist loop

### ✅ Legal Pages
- Terms of Service, Privacy Policy, DMCA, Community Guidelines, etc.

### ✅ Deployment
- `deploy_fast.ps1`: fixed Firebase App ID (`1:1005750289786:web:b77c70ef474707640d02c3`)
- All env vars passed to Cloud Run at runtime (not just build time)
- Dockerfile: proper multi-stage build with `serverExternalPackages`

## Key Fixes Made (Feb 2026 Session)
1. **Butler broken**: Replaced `@google-cloud/vertexai` → Gemini 1.5 Flash REST API
2. **Wrong Firebase App ID**: `G-3D0F10FZJ4` → `1:1005750289786:web:b77c70ef474707640d02c3`
3. **Radio Drive Picker**: Added `mode` prop; audio mode uses `viewId: "DOCS"` + audio MIME filter
4. **All API routes**: Migrated from client Firebase SDK to Firebase Admin SDK (server-safe)
5. **`admin.ts`**: Populated (was empty)
6. **`next.config.js`**: Added `serverExternalPackages` for GCP packages
7. **TypeScript error**: Fixed implicit `any` in `drive.ts`
8. **`package.json`**: Removed `@google-cloud/vertexai`, added `firebase-admin`
9. **Build**: ✅ Verified — 22 routes compile cleanly with zero errors

## Environment Variables Required

### Build-time (baked via Dockerfile ARG)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `stagepass-live-v1.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `stagepass-live-v1` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `stagepass-live-v1.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1005750289786` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1005750289786:web:b77c70ef474707640d02c3` |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | `AIzaSyDGg9xBDUyXoS6hNepgMx5xAacX_C3q_TI` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `1005750289786-349is2lee6fjuc97c74npffu8s2b5blp.apps.googleusercontent.com` |

### Runtime (Cloud Run env vars — set by deploy_fast.ps1)
All `NEXT_PUBLIC_*` vars above + optionally:
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (for explicit Admin SDK auth, falls back to ADC on Cloud Run)

## GCP APIs to Enable (one-time)
```bash
gcloud services enable generativelanguage.googleapis.com  # Gemini (butler)
gcloud services enable transcoder.googleapis.com          # Video processing
gcloud services enable livestream.googleapis.com          # Live streaming
gcloud services enable drive.googleapis.com               # Drive import
gcloud services enable storage.googleapis.com             # Cloud Storage
```

## Service Account Permissions Needed
```bash
# The Cloud Run default service account needs:
roles/storage.admin         # GCS uploads/reads
roles/transcoder.admin      # Transcoder jobs
roles/datastore.user        # Firestore reads/writes
roles/livestream.admin      # Live Stream API
```

## Firestore Collections
- `users/{uid}` — user profiles
- `creators/{uid}` — creator channels (slug, displayName, type)
- `content/{contentId}` — content items (status: PROCESSING→READY)
- `radioStations/{stationId}` — radio station data
- `liveChannels/{channelId}` — active live sessions

## P0/P1 Backlog

### P0 — Immediate (should work post-deploy)
- Verify Butler works (enable `generativelanguage.googleapis.com` in GCP)
- Verify video import from Drive (service account needs storage + transcoder perms)

### P1 — Next Phase
- **API Service**: Build out `apps/api/` Express service (openapi.yaml exists)
- **Media Worker**: Build out `apps/worker/` for async media processing
- **Monetization**: Stripe Connect (tips, ticketed premieres)
- **Real-Time Chat**: Firebase Realtime Database for live stream chat
- **Notifications**: SendGrid/Firebase notifications

### P2 — Future
- Admin dashboard for radio station review/approval
- Custom domain `stagepassaccess.com` DNS setup
- AI Butler expansion (execute actions, not just navigate)
- Mobile PWA / native apps
- Follow system, notification feed

## Deploy Command
```powershell
# From repo root:
.\deploy_fast.ps1
```
