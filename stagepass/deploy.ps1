# --- Configuration ---
# Hardcoded for your convenience
$Env:PROJECT_ID = "stagepass-live-v1"
$Env:REGION = "us-central1"

# Keys (Pre-filled)
$Env:FIREBASE_API_KEY = "AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0" 
$Env:FIREBASE_AUTH_DOMAIN = "stagepass-live-v1.firebaseapp.com"
$Env:FIREBASE_PROJECT_ID = "stagepass-live-v1"
$Env:FIREBASE_STORAGE_BUCKET = "stagepass-live-v1.firebasestorage.app"
$Env:FIREBASE_MESSAGING_SENDER_ID = "1005750289786"
$Env:FIREBASE_APP_ID = "G-3D0F10FZJ4"

# Google Drive Picker Keys (Fill these if you have them, otherwise leave blank or use same)
# Assuming same API Key for now if enabled
$Env:GOOGLE_API_KEY = "AIzaSyC88kuIJXBFt9w5Mmpu8t3lnSrSz2X3Kd0" 
$Env:GOOGLE_CLIENT_ID = "1005750289786-PLACEHOLDER.apps.googleusercontent.com" # You need your OAuth Client ID here

# --- Logic ---
Write-Host "[START] Deploying to $Env:PROJECT_ID" -ForegroundColor Cyan

# 1. Config Project
gcloud config set project $Env:PROJECT_ID

# 2. Build Web
Write-Host "[INFO] Building Web App..." -ForegroundColor Yellow
if (Test-Path "stagepass\apps\web") { Set-Location "stagepass\apps\web" } 
elseif (Test-Path "apps\web") { Set-Location "apps\web" }

$ImageTag = "$Env:REGION-docker.pkg.dev/$Env:PROJECT_ID/stagepass-web/web:latest"

# Note: We pass variables to cloudbuild.yaml which then passes them to Docker
gcloud builds submit --config cloudbuild.yaml `
  --substitutions=_IMAGE_TAG=$ImageTag,_NEXT_PUBLIC_FIREBASE_API_KEY=$Env:FIREBASE_API_KEY,_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$Env:FIREBASE_AUTH_DOMAIN,_NEXT_PUBLIC_FIREBASE_PROJECT_ID=$Env:FIREBASE_PROJECT_ID,_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$Env:FIREBASE_STORAGE_BUCKET,_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$Env:FIREBASE_MESSAGING_SENDER_ID,_NEXT_PUBLIC_FIREBASE_APP_ID=$Env:FIREBASE_APP_ID,_NEXT_PUBLIC_GOOGLE_API_KEY=$Env:GOOGLE_API_KEY,_NEXT_PUBLIC_GOOGLE_CLIENT_ID=$Env:GOOGLE_CLIENT_ID `
  .

if ($LASTEXITCODE -ne 0) { Write-Error "Build Failed"; exit 1 }

# 3. Deploy
Write-Host "[INFO] Deploying Service..." -ForegroundColor Yellow
gcloud run deploy stagepass-web `
  --image $ImageTag `
  --region $Env:REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=$Env:FIREBASE_API_KEY" 

Write-Host "[SUCCESS] Done!" -ForegroundColor Green
