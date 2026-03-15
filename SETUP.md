# STAGEPASS — Post-Deployment Setup Guide

## STEP 1: Add Cloud Run URL to Firebase Auth (Authorized Domains)

After running `deploy_fast.ps1`, you get a Cloud Run URL like:
`https://stagepass-web-abc123-uc.a.run.app`

**To authorize it for Firebase Auth:**

1. Go to **Firebase Console** → https://console.firebase.google.com
2. Select project **stagepass-live-v1**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter your Cloud Run URL: `stagepass-web-abc123-uc.a.run.app`
   _(without `https://` — just the hostname)_
6. Click **"Add"**
7. If you have a custom domain (`stagepassaccess.com`), add that too

---

## STEP 2: Add OAuth 2.0 Authorized Origin

1. Go to **Google Cloud Console** → https://console.cloud.google.com
2. Select project **stagepass-live-v1**
3. Go to **APIs & Services** → **Credentials**
4. Click your **OAuth 2.0 Client ID** (Web client)
5. Under **"Authorized JavaScript origins"**, add:
   - `https://stagepass-web-abc123-uc.a.run.app`
   - `https://stagepassaccess.com` (your custom domain)
6. Under **"Authorized redirect URIs"**, add:
   - `https://stagepass-web-abc123-uc.a.run.app/__/auth/handler`
   - `https://stagepassaccess.com/__/auth/handler`
7. Click **"Save"**

---

## STEP 3: Set Admin Access (for Admin Dashboard at /admin)

Run this in your terminal to set yourself as admin:

```bash
# Install Firebase Admin SDK CLI if not already:
npm install -g firebase-tools

# Login
firebase login --project stagepass-live-v1

# Open Firestore Console:
# https://console.firebase.google.com/project/stagepass-live-v1/firestore
```

**In Firestore Console:**
1. Navigate to `users` collection
2. Find your user document (UID from Firebase Auth)
3. Click **"Add field"**
4. Field name: `isAdmin`, Type: `boolean`, Value: `true`
5. Click **"Update"**

Now visit `https://stagepassaccess.com/admin` while logged in.

---

## STEP 4: Create GCS Buckets (if not already created by deploy script)

```bash
# Raw uploads bucket
gsutil mb -p stagepass-live-v1 -l us-central1 gs://stagepass-live-v1.firebasestorage.app

# Set CORS for HLS playback
cat > /tmp/cors.json << 'EOF'
[{
  "origin": ["*"],
  "method": ["GET", "HEAD"],
  "responseHeader": ["Content-Type", "Content-Range"],
  "maxAgeSeconds": 3600
}]
EOF
gsutil cors set /tmp/cors.json gs://stagepass-live-v1.firebasestorage.app

# Make processed media publicly readable
gsutil iam ch allUsers:objectViewer gs://stagepass-live-v1.firebasestorage.app
```

---

## STEP 5: Create Firestore Indexes

Run in Firebase Console or via CLI:

```bash
firebase deploy --only firestore:indexes --project stagepass-live-v1
```

Required indexes (add in Firestore Console → Indexes):
| Collection | Fields | Order |
|---|---|---|
| `content` | `creatorId` ASC, `createdAt` DESC | Composite |
| `content` | `status` ASC, `createdAt` DESC | Composite |
| `follows` | `followerId` ASC, `createdAt` DESC | Composite |
| `follows` | `creatorId` ASC, `createdAt` DESC | Composite |
| `notifications/{userId}/items` | `read` ASC, `createdAt` DESC | Composite |
| `liveChannels` | `status` ASC, `startedAt` DESC | Composite |

---

## STEP 6: Custom Domain (already added per your message)

Your domain `stagepassaccess.com` is already configured.

**To verify it's working:**
1. Cloud Run Console → stagepass-web → Domain Mappings
2. Status should show "Active"
3. DNS should show: CNAME `stagepassaccess.com → ghs.googlehosted.com`

---

## STEP 7: Verify All Services Are Running

```powershell
# Check all 3 services are ACTIVE
gcloud run services list --region us-central1 --project stagepass-live-v1

# Expected output:
# stagepass-api     ACTIVE
# stagepass-worker  ACTIVE  
# stagepass-web     ACTIVE
```

---

## STEP 8: Test the Full Upload Pipeline

1. Sign in at `https://stagepassaccess.com/signup`
2. Create creator profile
3. Go to **Studio** → **Uploads**
4. Connect Google Drive
5. Select a video file
6. Watch the status in Studio: QUEUED → INGESTING → TRANSCODING → READY
7. Go to **Explore** — your content should appear

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Firebase Auth domain error | Add Cloud Run URL to Authorized Domains (Step 1) |
| Drive Picker opens but empty | Enable Drive API in GCP Console |
| Upload stuck on QUEUED | Check Worker logs: `gcloud run logs read stagepass-worker --region us-central1` |
| Playback fails | Check GCS CORS (Step 4) and public access |
| Butler not responding | Verify `generativelanguage.googleapis.com` is enabled |
| Admin page shows 403 | Set `isAdmin: true` on user doc in Firestore (Step 3) |
