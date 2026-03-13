# STAGEPASS Masterplan

> Creator Ecosystem Platform — Google Cloud Native
> Last Updated: March 2026

---

## PHASE STATUS OVERVIEW

| Phase | Name | Status |
|-------|------|--------|
| 1 | Infrastructure & Auth | ✅ COMPLETE |
| 2 | Media Engine (Drive → CDN) | ✅ COMPLETE |
| 3 | Live Streaming | ✅ COMPLETE (OBS Fixed) |
| 4 | Radio Network + Auto-DJ | ✅ COMPLETE |
| 5 | Mobile App (Expo) | ✅ COMPLETE (Build-ready) |
| 6 | Legal & Trust | ✅ COMPLETE |
| 7 | Data Layer (Security Fix) | ✅ COMPLETE |
| 8 | Admin + Stream Management | ✅ COMPLETE |
| 9 | Monetization | 🔲 NOT STARTED |
| 10 | Advanced Social Graph | 🔲 NOT STARTED |

---

## ✅ PHASE 1 — Infrastructure & Auth

- Google Cloud Run (Web + API + Worker services)
- Firebase Auth: Google Sign-In + Email/Password
- Privacy agreement popup required before signup
- Auto-generated `@slug` from display name (hidden from form)
- Firestore user profiles linked to creator channels (`/c/username`)
- Google Drive OAuth scope requested at signup (permanent permission)
- **Admin Claim:** First-ever user can self-promote via Profile → "Claim Admin Access" button. No Firestore console access required.

---

## ✅ PHASE 2 — Media Engine

- **Drive Import:** Creators link Google Drive → multi-file selector → import to platform
- **Transcoder API:** Async video processing via Cloud Pub/Sub → Media Worker
- **HLS Playback:** Multi-quality ABR player (Auto / 720p / 360p) with quality selector
- **Signed URLs:** Secure content delivery via Media CDN
- **Feed Fix (Mar 2026):** All Firestore reads moved to Admin SDK server routes (`/api/content/feed`, `/api/content/[id]`, `/api/creators`) — Firestore security rules no longer silently block content from appearing
- **Image Upload:** Drag-and-drop file upload replaces old URL input fields

---

## ✅ PHASE 3 — Live Streaming

- Google Live Stream API provisions RTMP ingest channels
- **RTMP Fix (Mar 2026):** GCP `inputUri` is now correctly parsed and split:
  - `rtmpServer` → OBS **Server** field (e.g. `rtmp://34.x.x.x/live`)
  - `gcpStreamKey` → OBS **Stream Key** field (the UUID embedded in the URI)
  - Old code hardcoded `streamKey: "live"` — now uses the actual GCP-generated key
- **OBS Setup Warning:** Instructions clearly state to use **Settings → Stream** (NOT the Auto-Configuration Wizard, which tests OBS's own CDN, not our server)
- **Live Page Fix (Mar 2026):** Switched from client Firestore SDK to `/api/live/channels` (Admin SDK) — bypasses security rules, polls every 8 seconds
- **Red LIVE Button:** "Go Live" button turns into a pulsing red **● LIVE** badge when the logged-in user has an active broadcast
- **"Not Showing? Refresh" button:** Re-registers the stream to Firestore if the original write failed
- **Short Stream URLs:**
  - `/api/live/[channelId]/hls` → 302 redirect to HLS manifest (paste into VLC)
  - `/live/[channelId]` → Shareable viewer page with embedded player + live chat
- Live Chat: Firebase Realtime Database powered chat during streams
- Viewer count tracking

---

## ✅ PHASE 4 — Radio Network + Auto-DJ

- Active stations grid + featured station on `/radio`
- Multi-track Drive Picker with checkboxes (multi-select)
- Mini audio player: play/pause, skip, mute, volume
- **Show Scheduling:** Weekly schedule editor with day/time slots, show name, description
- **Auto-DJ:** Client-side epoch-synced sequential playback (all listeners hear the same track at the same moment)
- Deterministic shuffle mode (same shuffle order per day across all listeners)
- Schedule grid shows active show + upcoming shows
- **Server-Side HLS Radio Stream:** FFmpeg added to Worker Dockerfile. `/api/radio/generate-stream` triggers Pub/Sub → Worker generates `.m3u8` + `.ts` segments → stored in GCS

---

## ✅ PHASE 5 — Mobile App (React Native / Expo)

- 6 screens: Feed, Radio, Live, Profile, Login, Signup
- Bottom tab navigation (Feed, Radio, Live, Profile)
- Firebase Auth with AsyncStorage persistence
- `expo-av` for radio audio playback with mini player
- `expo-image-picker` for profile photo
- EAS configured for both iOS (Apple Developer Account) and Android (Google Play Console)
- Build scripts: `build.sh` (EAS cloud build) and `submit.sh` (store submission)
- Same STAGEPASS visual tokens (colors, dark theme) as web app

**To build:**
```bash
npm install -g eas-cli
eas login
cd apps/mobile
sh ./build.sh
```

---

## ✅ PHASE 6 — Legal & Trust

- `/legal/terms` — Terms of Service
- `/legal/privacy` — Privacy Policy
- `/legal/dmca` — DMCA Notice & Takedown
- `/legal/community` — Community Guidelines
- `/legal/creator-agreement` — Creator Agreement
- `/legal/acceptable-use` — Acceptable Use Policy
- All legal pages integrated in footer nav

---

## ✅ PHASE 7 — Data Layer Security Fix

**Root Cause:** Firestore security rules blocked all client-side SDK reads (getDocs, getDoc). Writes worked because they used Admin SDK on the server. Reads silently returned empty arrays.

**Fix:** All read operations moved to server-side Next.js API routes using Firebase Admin SDK:

| Route | Replaces |
|-------|----------|
| `GET /api/content/feed` | `getRecentContent()` client SDK |
| `GET /api/content/[id]` | `getContentById()` client SDK |
| `GET /api/creators?slug=` | `getCreatorBySlug()` client SDK |
| `GET /api/live/channels` | `getLiveChannels()` client SDK |
| `GET /api/live/[channelId]/hls` | Direct GCS URL (too long) |

**Impact:** Feed, Explore, Creator pages, Content detail, and Live page all now load correctly.

---

## ✅ PHASE 8 — Admin + Stream Management

- **Admin Dashboard:** `/admin` — content moderation, user management, analytics
- **Admin Claim:** `POST /api/admin/claim` — first-ever user OR env-whitelisted email gets admin. No Firestore console needed.
- **Admin Status:** `GET /api/admin/status` — check if current user is admin
- **Profile page:** Admin Access section — Claim button + link to Admin Dashboard
- **Stream Activate:** `POST /api/live/activate` — manually re-registers a stream to Firestore if the live session write failed
- **Firestore orderBy removed** from `getLiveChannels()` — composite index no longer required
- **favicon:** `favicon.ico` was 0 bytes — now served via `icon-192.png` in metadata icons
- **themeColor:** moved from `metadata` → `viewport` export — eliminates 15-page build warning

---

## 🔲 PHASE 9 — Monetization (NOT STARTED)

**Goal:** Allow creators to earn directly from their audience.

### Stripe Connect
- Creator onboarding: Connect Stripe account to STAGEPASS
- **Tips:** Fans can tip creators during live streams (one-time payment)
- **Backstage Pass:** Monthly subscription for exclusive content (`$3 / $7 / $15 tiers`)
- **Ticketed Premieres:** Pay-per-view events with unique access tokens
- Platform fee: 10% on all transactions

### Implementation Notes
- Use Stripe Connect (Express accounts) for instant creator payouts
- Webhook handlers for `payment_intent.succeeded`, `invoice.paid`
- Access control: check `hasBackstagePass` before serving premium HLS URLs

---

## 🔲 PHASE 10 — Advanced Social Graph (NOT STARTED)

**Goal:** Turn passive viewers into an active community.

### Follow System
- Follow/unfollow creators with real-time follower counts
- Push notifications (Firebase Cloud Messaging) when a followed creator goes live or uploads
- Email digest: "Your followed creators this week"

### Advanced Auto-DJ
- **Per-track mood tags** (Chill / Hype / Deep / Smooth / Energy) set in Studio
- **Genre filter** in Auto-DJ settings — only plays tracks matching selected moods
- **Crossfade transitions** — dual audio element approach, 3-second smooth volume fade between tracks
- **Crossfade settings** — creator-configurable fade duration (1–5 seconds)

### Creator Analytics
- Real-time viewer count graphs during live streams
- Play count, unique listeners, drop-off points for radio stations
- Top content by views, top time slots by listener count

---

## ARCHITECTURE (Current)

```
stagepass/
├── apps/
│   ├── web/        # Next.js 14 — Cloud Run: stagepass-web
│   ├── api/        # Express.js — Cloud Run: stagepass-api
│   ├── worker/     # Express.js + FFmpeg — Cloud Run: stagepass-worker
│   └── mobile/     # React Native (Expo) — App Store + Google Play
├── scripts/
│   ├── deploy_fast.ps1          # Quick redeploy: Web → API → Worker
│   └── deploy_production.ps1   # Full setup: Pub/Sub, IAM, all services
└── SETUP.md                     # Post-deployment checklist
```

### Key Server-Side API Routes (Admin SDK — bypasses Firestore rules)

```
GET  /api/content/feed              → All content, sorted by createdAt
GET  /api/content/feed?creatorId=   → Content by creator
GET  /api/content/[id]              → Single content item
GET  /api/creators?slug=            → Creator profile by slug
GET  /api/live/channels             → All LIVE channels (polls every 8s on frontend)
GET  /api/live/[channelId]/hls      → Short HLS redirect URL
POST /api/live/activate             → Register/refresh stream in Firestore
POST /api/live/session              → Create GCP channel + get OBS credentials
POST /api/admin/claim               → Self-promote to admin (first user wins)
GET  /api/admin/status              → Check if current user is admin
POST /api/radio/generate-stream     → Trigger FFmpeg HLS generation via Pub/Sub
```

---

## DEPLOYMENT CHECKLIST

After running `.\deploy_fast.ps1`:

1. Go to **Profile** → click **"Claim Admin Access"** (first user only)
2. Go to **Studio → Live** → click **"Start Broadcast"** to get OBS credentials
3. In OBS: **Settings → Stream → Custom** → paste Server + Stream Key (do NOT use Auto-Config Wizard)
4. If stream doesn't appear on Live page → click **"Not Showing? Refresh"** in the Studio
5. Upload content via **Studio → New Premiere** → appears on Feed immediately
6. For mobile: `npm install -g eas-cli && eas login && cd apps/mobile && sh ./build.sh`

---

## KNOWN LIMITATIONS

| Item | Detail |
|------|--------|
| HLS radio stream | Code complete, needs first deployment of worker with FFmpeg image |
| Mobile crossfade | Not yet implemented (Phase 10) |
| Monetization | Not started (Phase 9) |
| Real-time notifications | Not started (Phase 10) |
| Advanced analytics | Not started (Phase 10) |
