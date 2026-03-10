# --- Configuration (REPLACE THESE WITH YOUR REAL KEYS) ---
$Env:PROJECT_ID = "stagepass-webapp-0222"
$Env:REGION = "us-central1"

# Firebase Keys (Get these from Firebase Console)
$Env:FIREBASE_API_KEY = "AIzaSy..." 
$Env:FIREBASE_AUTH_DOMAIN = "stagepass-webapp-0222.firebaseapp.com"
$Env:FIREBASE_PROJECT_ID = "stagepass-webapp-0222"
$Env:FIREBASE_STORAGE_BUCKET = "stagepass-webapp-0222.appspot.com"
$Env:FIREBASE_MESSAGING_SENDER_ID = "YOUR_SENDER_ID"
$Env:FIREBASE_APP_ID = "YOUR_APP_ID"

# Google Drive Picker Keys (Get these from Google Cloud Console)
$Env:GOOGLE_API_KEY = "AIzaSy..."
$Env:GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com"

# --- Deployment Logic ---

Write-Host "[START] Starting Deployment for Project: $Env:PROJECT_ID" -ForegroundColor Cyan

# 0. Check Prerequisites
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI is not installed. Please install Google Cloud SDK."
    exit 1
}

# 1. Set Project
Write-Host "[INFO] Setting Active Project..." -ForegroundColor Yellow
gcloud config set project $Env:PROJECT_ID

# 2. Navigate to Web App Directory
Write-Host "[INFO] Locating Web App..." -ForegroundColor Yellow

if (Test-Path "stagepass\apps\web") {
    Set-Location "stagepass\apps\web"
} elseif (Test-Path "apps\web") {
    Set-Location "apps\web"
} else {
    Write-Error "Could not find 'apps\web' directory. Please run this script from the folder where you extracted the tar.gz file."
    exit 1
}

# 3. Build Web App (Using Cloud Build)
Write-Host "[INFO] Building Web App in the Cloud..." -ForegroundColor Yellow
$ImageTag = "$Env:REGION-docker.pkg.dev/$Env:PROJECT_ID/stagepass-web/web:latest"

# Construct Build Args String
$BuildArgs = "--build-arg=NEXT_PUBLIC_FIREBASE_API_KEY=$Env:FIREBASE_API_KEY," +
             "--build-arg=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$Env:FIREBASE_AUTH_DOMAIN," +
             "--build-arg=NEXT_PUBLIC_FIREBASE_PROJECT_ID=$Env:FIREBASE_PROJECT_ID," +
             "--build-arg=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$Env:FIREBASE_STORAGE_BUCKET," +
             "--build-arg=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$Env:FIREBASE_MESSAGING_SENDER_ID," +
             "--build-arg=NEXT_PUBLIC_FIREBASE_APP_ID=$Env:FIREBASE_APP_ID," +
             "--build-arg=NEXT_PUBLIC_GOOGLE_API_KEY=$Env:GOOGLE_API_KEY," +
             "--build-arg=NEXT_PUBLIC_GOOGLE_CLIENT_ID=$Env:GOOGLE_CLIENT_ID"

gcloud builds submit --tag $ImageTag $BuildArgs .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed! Check the logs above."
    exit 1
}

# 4. Deploy to Cloud Run
Write-Host "[INFO] Deploying to Cloud Run..." -ForegroundColor Yellow

$EnvVars = "NEXT_PUBLIC_FIREBASE_API_KEY=$Env:FIREBASE_API_KEY," +
           "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$Env:FIREBASE_AUTH_DOMAIN," +
           "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$Env:FIREBASE_PROJECT_ID," +
           "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$Env:FIREBASE_STORAGE_BUCKET," +
           "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$Env:FIREBASE_MESSAGING_SENDER_ID," +
           "NEXT_PUBLIC_FIREBASE_APP_ID=$Env:FIREBASE_APP_ID," +
           "NEXT_PUBLIC_GOOGLE_API_KEY=$Env:GOOGLE_API_KEY," +
           "NEXT_PUBLIC_GOOGLE_CLIENT_ID=$Env:GOOGLE_CLIENT_ID"

gcloud run deploy stagepass-web `
  --image $ImageTag `
  --region $Env:REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars $EnvVars

Write-Host "[SUCCESS] Deployment Complete!" -ForegroundColor Green
