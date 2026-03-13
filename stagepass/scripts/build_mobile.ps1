# ═══════════════════════════════════════════════════════════════
# STAGEPASS Mobile — Build & Submit (PowerShell)
# ═══════════════════════════════════════════════════════════════
$ErrorActionPreference = "Stop"
$MobileDir = Join-Path (Split-Path $PSScriptRoot) "apps/mobile"
Set-Location $MobileDir

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   STAGEPASS Mobile Build & Submit         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan

# Prerequisites
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
}

# Install deps
Write-Host "`n[1/3] Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nWhat would you like to do?" -ForegroundColor Green
Write-Host "  1) Build Android (AAB for Play Store)"
Write-Host "  2) Build iOS (IPA for App Store)"
Write-Host "  3) Build Both platforms"
Write-Host "  4) Build Android Preview (APK)"
Write-Host "  5) Submit Android to Play Store"
Write-Host "  6) Submit iOS to App Store"
Write-Host "  7) Submit Both"
Write-Host ""
$choice = Read-Host "Enter choice [1-7]"

switch ($choice) {
    "1" {
        Write-Host "`nBuilding Android (production)..." -ForegroundColor Yellow
        eas build --platform android --profile production --non-interactive
    }
    "2" {
        Write-Host "`nBuilding iOS (production)..." -ForegroundColor Yellow
        eas build --platform ios --profile production --non-interactive
    }
    "3" {
        Write-Host "`nBuilding Both platforms..." -ForegroundColor Yellow
        eas build --platform all --profile production --non-interactive
    }
    "4" {
        Write-Host "`nBuilding Android Preview (APK)..." -ForegroundColor Yellow
        eas build --platform android --profile preview --non-interactive
    }
    "5" {
        Write-Host "`nSubmitting Android to Play Store..." -ForegroundColor Yellow
        eas submit --platform android --profile production --non-interactive
    }
    "6" {
        Write-Host "`nSubmitting iOS to App Store..." -ForegroundColor Yellow
        eas submit --platform ios --profile production --non-interactive
    }
    "7" {
        Write-Host "`nSubmitting to both stores..." -ForegroundColor Yellow
        eas submit --platform android --profile production --non-interactive
        eas submit --platform ios --profile production --non-interactive
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[SUCCESS] Done!" -ForegroundColor Green
