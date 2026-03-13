#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# STAGEPASS Mobile — Build & Submit Script
# ═══════════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")/apps/mobile"

echo "╔═══════════════════════════════════════════╗"
echo "║   STAGEPASS Mobile Build & Submit         ║"
echo "╚═══════════════════════════════════════════╝"

cd "$MOBILE_DIR"

# ── Prerequisites check ──────────────────────────────────────
command -v eas >/dev/null 2>&1 || { echo "❌ EAS CLI not found. Run: npm install -g eas-cli"; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "❌ npx not found. Install Node.js 18+"; exit 1; }

# ── Install dependencies ─────────────────────────────────────
echo ""
echo "📦 Installing dependencies..."
npm install

# ── Choose action ─────────────────────────────────────────────
echo ""
echo "What would you like to do?"
echo "  1) Build Android (AAB for Play Store)"
echo "  2) Build iOS (IPA for App Store)"
echo "  3) Build Both"
echo "  4) Build Android Preview (APK for testing)"
echo "  5) Submit Android to Play Store"
echo "  6) Submit iOS to App Store"
echo "  7) Submit Both"
echo ""
read -p "Enter choice [1-7]: " CHOICE

case $CHOICE in
  1)
    echo "🤖 Building Android (production)..."
    eas build --platform android --profile production --non-interactive
    ;;
  2)
    echo "🍎 Building iOS (production)..."
    eas build --platform ios --profile production --non-interactive
    ;;
  3)
    echo "📱 Building Both platforms..."
    eas build --platform all --profile production --non-interactive
    ;;
  4)
    echo "🤖 Building Android Preview (APK)..."
    eas build --platform android --profile preview --non-interactive
    ;;
  5)
    echo "🚀 Submitting Android to Play Store..."
    eas submit --platform android --profile production --non-interactive
    ;;
  6)
    echo "🚀 Submitting iOS to App Store..."
    eas submit --platform ios --profile production --non-interactive
    ;;
  7)
    echo "🚀 Submitting to both stores..."
    eas submit --platform android --profile production --non-interactive
    eas submit --platform ios --profile production --non-interactive
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Done!"
