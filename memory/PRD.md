# STAGEPASS — Production Creator Ecosystem Platform

## Original Problem Statement
Build a production-ready creator ecosystem "STAGEPASS" with:
- Multi-service architecture (Next.js Web UI + Express API + Media Worker)
- Media pipeline: upload from Google Drive, transcode via Cloud Transcoder, HLS playback
- Features: Admin Dashboard, Follow system, FCM Push Notifications, Media CDN, AI Butler (Encore), Creator Analytics, Live Chat, Live Streaming, Radio Stations with Auto-DJ
- Mobile apps (React Native/Expo) with App Store submission
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
├── deploy_fast.ps1    # Primary deployment script
└── MOBILE_BUILD_GUIDE.md  # Step-by-step iOS + Android build guide
```

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend:** Next.js API Routes (Firebase Admin SDK with service account credentials)
- **Database:** Firebase Firestore (Admin SDK for server-side with service account)
- **Auth:** Firebase Auth (email + Google OAuth)
- **Storage:** Google Cloud Storage (GCS)
- **Push Notifications:** Firebase Cloud Messaging (FCM) — web + mobile
- **AI:** Gemini 1.5 Flash via Generative Language API or Vertex AI (ADC)
- **Media:** Google Drive import, HLS via FFmpeg worker
- **Deploy:** Google Cloud Run
- **Mobile:** Expo SDK 52, EAS Build & Submit

## Key DB Schema
- `users/{uid}` — profile, socialLinks, driveLinked, roles, latestFcmToken, notificationsEnabled
- `users/{uid}/fcmTokens/{tokenId}` — FCM token per device/platform
- `creators/{uid}` — slug, displayName, followerCount
- `content/{contentId}` — title, type, thumbnailUrl, driveFileId, playbackUrl, creatorId
- `radioStations/{stationId}` — tracks[], artworkUrl, autoDjEnabled
- `liveChannels/{channelId}` — status (LIVE/ENDED), ownerUid, ownerName, playbackUrl
- `follows/{followId}` — creatorId, followerId
- `comments/{contentId}` — live chat + comments
- `notifications/{uid}/items` — in-app notifications

## Service Account
- Email: `firebase-adminsdk-fbsvc@stagepass-live-v1.iam.gserviceaccount.com`
- Key: embedded in both deploy scripts

## Key API Endpoints (updated)
- `/api/health` — Admin SDK connection test
- `/api/profile` (GET/PUT) — User profile (set+merge)
- `/api/auth/signup` (POST) — Create user+creator docs
- `/api/content/feed` (GET) — Content list with thumbnails + Previously Recorded filter
- `/api/content/import-drive` (POST) — Import from Google Drive with custom thumbnail
- `/api/content/[id]/og` (GET) — Open Graph data for social sharing
- `/api/analytics` (GET) — Creator stats (real views/followers)
- `/api/radio/station` (POST) — Create/update station (copies audio to GCS immediately)
- `/api/radio/station/now` (GET) — Now playing + station artwork
- `/api/live/channels` (GET) — Active LIVE streams only (status=LIVE)
- `/api/live/activate` (POST) — Start/end stream + notify followers via FCM
- `/api/fcm/register` (POST) — Save FCM token for web + mobile
- `/api/fcm/broadcast` (POST) — Send push to all followers
- `/api/butler/resolve` (POST) — Encore AI Butler (Gemini 1.5, temperature 0.7, with history)
- `/api/comments/[contentId]` — Video comments (notifies creator via FCM)
- `/api/follow/[creatorId]` — Follow/unfollow (notifies creator via FCM)
- `/api/notifications` — In-app notification list + mark read

## What's Been Implemented

### Session 3 — MAJOR FIXES
- Firebase Admin SDK: service account credentials in deploy scripts
- Profile save: set+merge (works for new users)
- Studio Dashboard: real analytics
- Live Page: conditional green/red Go Live button
- Creator Page: "Content Creator Not Found"
- Encore Butler: draggable, minimizable, conversation history, proper greeting
- Upload Page: Drive token memory, custom thumbnail upload
- DrivePicker: initialToken prop, unverified-app explanation
- Player: sandbox iframe (no pop-out/download)
- Radio: GCS copy at station creation, artwork in mini player
- Explore: "Previously Recorded" category
- All update() → set({merge:true}) throughout

### Session 4 — FCM, Mobile, Share
- **Firebase FCM Push Notifications (Web):**
  - `public/firebase-messaging-sw.js` — background message handler
  - `src/lib/firebase/messaging.ts` — FCM token registration + foreground messages
  - `/api/fcm/register` — saves token per user per device
  - `/api/fcm/broadcast` — bulk push to followers
  - `sendNotification()` helper — Firestore + FCM in one call
  - Wired into: follow events, comments, live stream activation
  - NotificationBell: auto-registers FCM on login, shows foreground toasts
- **Mobile App (Expo):**
  - `eas.json` — development/preview/production build profiles
  - `app.json` — complete config with expo-notifications plugin, APNs, FCM
  - `src/lib/notifications.ts` — Expo push token registration + navigation on tap
  - MainNavigator: registers FCM on login, handles notification navigation
  - ProfileScreen: setDoc+merge (fixes save for new users)
  - `MOBILE_BUILD_GUIDE.md` — complete iOS + Android App Store guide
- **Share to Social:**
  - `ShareButtons.tsx` — Twitter/X, WhatsApp, Copy Link with preview card
  - Added to content player page alongside FollowButton
  - OpenGraph meta tags (og:title, og:image, og:description, twitter:card) on content pages
  - `/api/content/[id]/og` — OG data endpoint for crawlers

## P0/P1 Remaining

### One Manual Step Needed (P0):
1. **Generate VAPID key** in Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates → Generate key pair
   → Replace `YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE` in `deploy_fast.ps1`
2. **Download GoogleService-Info.plist** (iOS) + **google-services.json** (Android) from Firebase Console → place in `apps/mobile/`
3. **Verify `/api/health` returns `"status":"ok"` after deploy** — confirms Firestore is connected

### P1 (High Priority)
- HLS Auto-DJ worker deployment via deploy_fast.ps1
- Google OAuth app verification in GCP Console (removes "unverified app" warning)
- App Store Connect + Play Console app listing creation

### P2 (Medium Priority)
- Stripe Connect monetization
- Video thumbnail auto-generation from frames
- Advanced analytics (charts, time-series)

### P3 / Backlog
- CDN signed URLs for media security
- Creator verification badges
- Branded streaming pages
