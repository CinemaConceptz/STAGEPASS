# ============================================================
# STAGEPASS — Full Production Deployment (All 3 Services)
# Project: stagepass-live-v1  |  Region: us-central1
#
# Services deployed:
#   1. stagepass-api    — Express API service
#   2. stagepass-worker — Media processing worker
#   3. stagepass-web    — Next.js web application
#
# Run from the repo root:  .\deploy_fast.ps1
# ============================================================

$PROJECT_ID              = "stagepass-live-v1"
$REGION                  = "us-central1"
$REGISTRY                = "$REGION-docker.pkg.dev/$PROJECT_ID/stagepass-web"

# ── Firebase / Google credentials ────────────────────────────────────────────
$FIREBASE_API_KEY             = "AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0"
$FIREBASE_AUTH_DOMAIN         = "stagepass-live-v1.firebaseapp.com"
$FIREBASE_PROJECT_ID          = "stagepass-live-v1"
$FIREBASE_STORAGE_BUCKET      = "stagepass-live-v1.firebasestorage.app"
$FIREBASE_MESSAGING_SENDER_ID = "1005750289786"
$FIREBASE_APP_ID              = "1:1005750289786:web:b77c70ef474707640d02c3"
$GOOGLE_API_KEY               = "AIzaSyDGg9xBDUyXoS6hNepgMx5xAacX_C3q_TI"
$GOOGLE_CLIENT_ID             = "1005750289786-349is2lee6fjuc97c74npffu8s2b5blp.apps.googleusercontent.com"

# ── Detect repo root ──────────────────────────────────────────────────────────
$RepoRoot = $PSScriptRoot
if (-not $RepoRoot) { $RepoRoot = Get-Location }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STAGEPASS — Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 0. Pre-flight: set project & enable APIs ─────────────────────────────────
gcloud config set project $PROJECT_ID
Write-Host "[0] Enabling required APIs..." -ForegroundColor Yellow
$apis = @(
  "run.googleapis.com",
  "cloudbuild.googleapis.com",
  "artifactregistry.googleapis.com",
  "pubsub.googleapis.com",
  "transcoder.googleapis.com",
  "livestream.googleapis.com",
  "drive.googleapis.com",
  "storage.googleapis.com",
  "generativelanguage.googleapis.com",
  "firestore.googleapis.com"
)
gcloud services enable @apis

# Ensure Artifact Registry repo exists
gcloud artifacts repositories describe stagepass-web --location=$REGION 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creating Artifact Registry repo..." -ForegroundColor Yellow
  gcloud artifacts repositories create stagepass-web `
    --repository-format=docker --location=$REGION
}

# ── 1. Create Pub/Sub topic (idempotent) ──────────────────────────────────────
Write-Host "[1] Ensuring Pub/Sub topic exists..." -ForegroundColor Yellow
gcloud pubsub topics describe stagepass-content-process 2>$null
if ($LASTEXITCODE -ne 0) {
  gcloud pubsub topics create stagepass-content-process
}

# ── 2. Deploy API Service ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2] Building & deploying stagepass-api..." -ForegroundColor Cyan
Set-Location "$RepoRoot\apps\api"

$ApiImage = "$REGISTRY/api:latest"
Set-Content -Path cloudbuild.api.yaml -Value @"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '$ApiImage', '.']
images: ['$ApiImage']
"@

gcloud builds submit --config cloudbuild.api.yaml .
if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] API build failed"; exit 1 }

gcloud run deploy stagepass-api `
  --image $ApiImage `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --set-env-vars "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,GCS_BUCKET=$FIREBASE_STORAGE_BUCKET,GOOGLE_API_KEY=$GOOGLE_API_KEY"

if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] API deploy failed"; exit 1 }

# Capture API URL
$ApiUrl = (gcloud run services describe stagepass-api --region $REGION --format "value(status.url)").Trim()
Write-Host "  API URL: $ApiUrl" -ForegroundColor Green

# ── 3. Deploy Worker Service ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[3] Building & deploying stagepass-worker..." -ForegroundColor Cyan
Set-Location "$RepoRoot\apps\worker"

$WorkerImage = "$REGISTRY/worker:latest"
Set-Content -Path cloudbuild.worker.yaml -Value @"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '$WorkerImage', '.']
images: ['$WorkerImage']
"@

gcloud builds submit --config cloudbuild.worker.yaml .
if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] Worker build failed"; exit 1 }

gcloud run deploy stagepass-worker `
  --image $WorkerImage `
  --region $REGION `
  --platform managed `
  --no-allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --timeout 3600 `
  --set-env-vars "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,GCS_BUCKET=$FIREBASE_STORAGE_BUCKET"

if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] Worker deploy failed"; exit 1 }

$WorkerUrl = (gcloud run services describe stagepass-worker --region $REGION --format "value(status.url)").Trim()
Write-Host "  Worker URL: $WorkerUrl" -ForegroundColor Green

# ── 4. Wire Pub/Sub → Worker ──────────────────────────────────────────────────
Write-Host ""
Write-Host "[4] Configuring Pub/Sub push subscription..." -ForegroundColor Yellow
$WorkerEndpoint = "$WorkerUrl/tasks/process-content"

# Get (or create) service account for Pub/Sub invoker
$SaEmail = "stagepass-pubsub-invoker@$PROJECT_ID.iam.gserviceaccount.com"
gcloud iam service-accounts describe $SaEmail 2>$null
if ($LASTEXITCODE -ne 0) {
  gcloud iam service-accounts create stagepass-pubsub-invoker `
    --display-name="StagePass Pub/Sub Invoker"
}

# Grant the SA permission to invoke the worker
gcloud run services add-iam-policy-binding stagepass-worker `
  --region $REGION `
  --member="serviceAccount:$SaEmail" `
  --role="roles/run.invoker"

# Create/update push subscription
gcloud pubsub subscriptions describe stagepass-worker-sub 2>$null
if ($LASTEXITCODE -ne 0) {
  gcloud pubsub subscriptions create stagepass-worker-sub `
    --topic stagepass-content-process `
    --push-endpoint $WorkerEndpoint `
    --push-auth-service-account $SaEmail `
    --ack-deadline 600
} else {
  gcloud pubsub subscriptions modify-push-config stagepass-worker-sub `
    --push-endpoint $WorkerEndpoint `
    --push-auth-service-account $SaEmail
}

Write-Host "  Pub/Sub → Worker wired at $WorkerEndpoint" -ForegroundColor Green

# ── 5. Deploy Web App ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[5] Building & deploying stagepass-web..." -ForegroundColor Cyan
Set-Location "$RepoRoot\apps\web"

$WebImage = "$REGISTRY/web:latest"
Set-Content -Path cloudbuild.fast.yaml -Value @"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        docker build \
          --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY \
          --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN \
          --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
          --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET \
          --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID \
          --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID \
          --build-arg NEXT_PUBLIC_GOOGLE_API_KEY=$GOOGLE_API_KEY \
          --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
          -t $WebImage .
images: ['$WebImage']
"@

gcloud builds submit --config cloudbuild.fast.yaml .
if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] Web build failed"; exit 1 }

gcloud run deploy stagepass-web `
  --image $WebImage `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID,NEXT_PUBLIC_GOOGLE_API_KEY=$GOOGLE_API_KEY,NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,NEXT_PUBLIC_API_URL=$ApiUrl"

if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] Web deploy failed"; exit 1 }

$WebUrl = (gcloud run services describe stagepass-web --region $REGION --format "value(status.url)").Trim()

# ── 6. Grant GCS permissions ──────────────────────────────────────────────────
Write-Host ""
Write-Host "[6] Granting service account permissions..." -ForegroundColor Yellow
$DefaultSa = "$PROJECT_ID@appspot.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$DefaultSa" --role="roles/storage.admin" 2>$null
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$DefaultSa" --role="roles/transcoder.admin" 2>$null
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$DefaultSa" --role="roles/datastore.user" 2>$null
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$DefaultSa" --role="roles/livestream.admin" 2>$null
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$DefaultSa" --role="roles/pubsub.publisher" 2>$null

# Make processed GCS paths publicly readable (for HLS playback)
Write-Host ""
Write-Host "[7] Configuring GCS CORS and public access for playback..." -ForegroundColor Yellow
$CorsConfig = '[{"origin":["*"],"method":["GET","HEAD"],"responseHeader":["Content-Type","Content-Range"],"maxAgeSeconds":3600}]'
$TempCors = [System.IO.Path]::GetTempFileName()
$CorsConfig | Set-Content $TempCors
gsutil cors set $TempCors "gs://$FIREBASE_STORAGE_BUCKET"
gsutil iam ch allUsers:objectViewer "gs://$FIREBASE_STORAGE_BUCKET"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Web App  : $WebUrl" -ForegroundColor Cyan
Write-Host "  API      : $ApiUrl" -ForegroundColor Cyan
Write-Host "  Worker   : $WorkerUrl (private)" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Add $WebUrl to Firebase Auth Authorized Domains"
Write-Host "  2. Add $WebUrl as OAuth 2.0 Authorized Origin in GCP Console"
Write-Host "  3. Test: Sign up, connect Drive, upload a video, check radio"
Write-Host ""
