# ============================================================
# STAGEPASS — Fast Deployment Script
# Project: stagepass-live-v1  |  Region: us-central1
# ============================================================

$Env:PROJECT_ID             = "stagepass-live-v1"
$Env:REGION                 = "us-central1"

# Firebase / Google credentials
$Env:FIREBASE_API_KEY             = "AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0"
$Env:FIREBASE_AUTH_DOMAIN         = "stagepass-live-v1.firebaseapp.com"
$Env:FIREBASE_PROJECT_ID          = "stagepass-live-v1"
$Env:FIREBASE_STORAGE_BUCKET      = "stagepass-live-v1.firebasestorage.app"
$Env:FIREBASE_MESSAGING_SENDER_ID = "1005750289786"
$Env:FIREBASE_APP_ID              = "1:1005750289786:web:b77c70ef474707640d02c3"
$Env:GOOGLE_API_KEY               = "AIzaSyDGg9xBDUyXoS6hNepgMx5xAacX_C3q_TI"
$Env:GOOGLE_CLIENT_ID             = "1005750289786-349is2lee6fjuc97c74npffu8s2b5blp.apps.googleusercontent.com"

Write-Host "[START] STAGEPASS Fast Deploy" -ForegroundColor Cyan

# 1. Set project
gcloud config set project $Env:PROJECT_ID

# 2. Navigate to web app directory
if     (Test-Path "stagepass\apps\web") { Set-Location "stagepass\apps\web" }
elseif (Test-Path "apps\web")           { Set-Location "apps\web" }
elseif (Test-Path "src")                { Write-Host "Already in web dir" }
else   { Write-Error "Cannot find apps/web directory. Run from repo root."; exit 1 }

# 3. Write .dockerignore (speeds up build)
Set-Content -Path .dockerignore -Value @"
node_modules
.next
.git
.env*
.DS_Store
"@

# 4. Generate Cloud Build config
$ImageTag = "$Env:REGION-docker.pkg.dev/$Env:PROJECT_ID/stagepass-web/web:latest"

$BuildConfig = @"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        docker build \
          --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$($Env:FIREBASE_API_KEY) \
          --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$($Env:FIREBASE_AUTH_DOMAIN) \
          --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$($Env:FIREBASE_PROJECT_ID) \
          --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$($Env:FIREBASE_STORAGE_BUCKET) \
          --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$($Env:FIREBASE_MESSAGING_SENDER_ID) \
          --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$($Env:FIREBASE_APP_ID) \
          --build-arg NEXT_PUBLIC_GOOGLE_API_KEY=$($Env:GOOGLE_API_KEY) \
          --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=$($Env:GOOGLE_CLIENT_ID) \
          -t $ImageTag .
images:
  - '$ImageTag'
"@

Set-Content -Path "cloudbuild.fast.yaml" -Value $BuildConfig

# 5. Build image via Cloud Build
Write-Host "[BUILD] Submitting to Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild.fast.yaml .

if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] Build failed."; exit 1 }

# 6. Deploy to Cloud Run
Write-Host "[DEPLOY] Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy stagepass-web `
  --image $ImageTag `
  --region $Env:REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=$Env:FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$Env:FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$Env:FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$Env:FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$Env:FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$Env:FIREBASE_APP_ID,NEXT_PUBLIC_GOOGLE_API_KEY=$Env:GOOGLE_API_KEY,NEXT_PUBLIC_GOOGLE_CLIENT_ID=$Env:GOOGLE_CLIENT_ID"

if ($LASTEXITCODE -ne 0) { Write-Error "[ERROR] Deploy failed."; exit 1 }

Write-Host "[DONE] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT — Enable these APIs in your GCP project if not already done:" -ForegroundColor Yellow
Write-Host "  gcloud services enable generativelanguage.googleapis.com --project $Env:PROJECT_ID"
Write-Host "  gcloud services enable transcoder.googleapis.com --project $Env:PROJECT_ID"
Write-Host "  gcloud services enable livestream.googleapis.com --project $Env:PROJECT_ID"
Write-Host "  gcloud services enable drive.googleapis.com --project $Env:PROJECT_ID"
Write-Host ""
Write-Host "IMPORTANT — Grant the Cloud Run service account permissions:" -ForegroundColor Yellow
Write-Host "  gcloud projects add-iam-policy-binding $Env:PROJECT_ID \`"
Write-Host "    --member='serviceAccount:$Env:PROJECT_ID@appspot.gserviceaccount.com' \`"
Write-Host "    --role='roles/storage.admin'"
Write-Host "  gcloud projects add-iam-policy-binding $Env:PROJECT_ID \`"
Write-Host "    --member='serviceAccount:$Env:PROJECT_ID@appspot.gserviceaccount.com' \`"
Write-Host "    --role='roles/transcoder.admin'"
Write-Host "  gcloud projects add-iam-policy-binding $Env:PROJECT_ID \`"
Write-Host "    --member='serviceAccount:$Env:PROJECT_ID@appspot.gserviceaccount.com' \`"
Write-Host "    --role='roles/datastore.user'"
