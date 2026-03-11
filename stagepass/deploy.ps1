# --- Configuration ---
# CAREFUL: Use the ID with the suffix if that is your active one!
$Env:PROJECT_ID = "stagepass-webapp-0222-8ce6e" 
$Env:REGION = "us-central1"

# Keys (PASTE YOURS HERE)
$Env:FIREBASE_API_KEY = "AIzaSy..." 
$Env:FIREBASE_AUTH_DOMAIN = "stagepass-webapp-0222.firebaseapp.com"
$Env:FIREBASE_PROJECT_ID = "stagepass-webapp-0222"
$Env:FIREBASE_STORAGE_BUCKET = "stagepass-webapp-0222.appspot.com"
$Env:FIREBASE_MESSAGING_SENDER_ID = "YOUR_SENDER_ID"
$Env:FIREBASE_APP_ID = "YOUR_APP_ID"
$Env:GOOGLE_API_KEY = "AIzaSy..."
$Env:GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com"

# --- Logic ---
Write-Host "[START] Deploying to $Env:PROJECT_ID" -ForegroundColor Cyan

# 1. Config Project
gcloud config set project $Env:PROJECT_ID

# 2. Build Web
Write-Host "[INFO] Building Web App..." -ForegroundColor Yellow
if (Test-Path "stagepass\apps\web") { Set-Location "stagepass\apps\web" } 
elseif (Test-Path "apps\web") { Set-Location "apps\web" }

$ImageTag = "$Env:REGION-docker.pkg.dev/$Env:PROJECT_ID/stagepass-web/web:latest"

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
