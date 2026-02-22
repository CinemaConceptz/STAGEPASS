# STAGEPASS — Master Build Spec
Tagline: “You’re not posting. You’re premiering.”

## 0) Non-negotiables
1) Creator-controlled visibility (Option A):
   - Following feed defaults to chronological.
   - No shadow throttling.
   - Any ranking is opt-in and explicitly labeled with visible signals.

2) Hybrid media engine (Option C):
   - Upload once → VOD HLS/DASH + thumbnails + waveform + chapters + optional audio-only extraction.
   - Future: auto clips + captions + podcast RSS.

3) Live + Radio:
   - OBS-compatible live video (RTMP ingest).
   - Audio-only radio live with schedules and archives.
   - Global station “STAGEPASS LIVE” + creator stations.

4) Built entirely on Google:
   Firebase Auth + Firestore + Cloud Storage + Cloud Run + Cloud Functions + Pub/Sub + Cloud Tasks + Transcoder API + Live Stream API + Media CDN + Vertex AI + STT/TTS.

5) Butler mascot (one global persona): “Encore”
   - Voice-first, expressive avatar
   - Navigation + publishing + live setup + policy guardrails
   - Action-oriented: resolves intent into API calls (with audit logs)

---

## 1) Product Scope (MVP = Production usable)
### Public
- Home feed (Following/Chronological default)
- Explore (filters: format/genre/tags/location)
- Live Now
- Radio (global station + schedules + archives)
- Creator channel: /c/{slug}
- Content page: /content/{id}

### Auth
- signup/login/reset
- onboarding: creator type (DJ/Radio, Music, Film/Video, Business, Gaming)
- create creator channel slug

### Studio
- upload manager
- publish workflow (title/tags/visibility/chapters)
- go-live setup (OBS key + health checks)
- radio schedule builder
- moderation inbox (reports/appeals/strikes)
- channel settings

---

## 2) System Architecture
### Web (Next.js)
- Server actions allowed but all privileged operations call API service.
- HLS player for VOD & live.
- Butler dock always available.

### API (Cloud Run)
- REST JSON API + websocket endpoint (chat optional MVP)
- Verifies Firebase ID tokens
- Performs privileged writes to Firestore
- Mints signed upload URLs and signed playback URLs
- Emits audit logs for every privileged operation
- Enqueues jobs to Pub/Sub / Tasks

### Workers (Cloud Run)
- media-worker: reacts to Pub/Sub content-process; creates Transcoder jobs; generates waveform; sets READY status; emits notifications
- moderation-worker: asynchronous basic checks; escalates to moderation actions

### Triggers (Cloud Functions)
- onFinalize of raw upload can enqueue content-process if desired
- Firestore onCreate of content can enqueue processing

---

## 3) Core Firestore Collections
- users/{uid}
- creators/{creatorId}
- content/{contentId}
- follows/{uid}/following/{creatorId}
- playlists/{playlistId}
- liveChannels/{channelId}
- streams/{streamId}
- radioStations/{stationId}
- shows/{showId}
- chatRooms/{roomId}/messages/{msgId} (optional MVP)
- reports/{reportId}
- moderationActions/{actionId}
- notifications/{uid}/items/{notifId}
- auditLogs/{logId} (write-only by API/Workers)

Golden rules:
- Client writes are minimal and never include privileged fields.
- Any field impacting distribution/visibility, moderation, signed URLs, quotas, live ingest goes through API.
- Every privileged action creates an audit log entry.

---

## 4) Visibility Rules (No BS)
Following feed:
- Pure chronological by default.
Sorting modes (user-selected):
- newest (chronological)
- most_discussed (comment_count, chat_count)
- trending (views + saves + completion rate + chat velocity) — signals disclosed
No hidden suppression. Only moderation actions remove content, with reasons.

---

## 5) Media Pipelines
### Upload pipeline
1) Web requests signed upload URL from API
2) Upload to gs://raw-media-{env}
3) API creates content doc status=UPLOADED
4) Pub/Sub: content-process
5) worker-media:
   - validate/probe
   - create Transcoder job (HLS/DASH ladder)
   - generate thumbnails + waveform
   - optional audio extraction
6) Write outputs to gs://processed-media-{env}
7) Update content status=READY + set manifests/thumbnail paths
8) Playback served via Media CDN + signed URLs

### Live pipeline
1) Creator requests “create live session” from API
2) API uses Live Stream API: creates input + channel (or reuses) and returns ingest info
3) OBS streams RTMP to endpoint
4) Live Stream API writes HLS segments to gs://live-output-{env}
5) Media CDN serves playback
6) On end, API finalizes stream and creates replay content entry

### Radio
- Global station: scheduled show blocks; can be creator live audio or playlist.
- Each show auto-archives into content type=EPISODE.

---

## 6) Cost Guardrails (hard limits)
- Max upload size per file (env configurable)
- Max uploads/day per creator (tiered by trust level)
- Max simultaneous live sessions per creator
- Transcode ladder varies by type:
  - DJ mixes: lower video ladders or audio-only
- Lifecycle policies:
  - raw uploads delete after 7–14 days
  - processed renditions tier to cold storage after N days (optional)
- Budget alerts required in every env.

---

## 7) Security & Compliance
- Cloud Armor in front of API and web
- Rate limiting (API middleware + optional Armor rules)
- Signed URLs for media playback and uploads
- Firestore rules prevent cross-user writes
- Reports + appeals + strike ladder transparent (no silent punishment)

---

## 8) Definition of Done (MVP)
- User signup/login works
- Creator onboarding creates channel slug + creator doc
- Upload → processing → playable HLS manifest
- Home feed shows following content in chronological order
- Live session created and playable
- Radio page shows global station schedule and playable audio stream or archived shows
- Butler “Encore” can:
  - navigate, search, start upload flow, explain visibility
- Logging/alerts/budgets enabled