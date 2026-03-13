# STAGEPASS Mobile App (React Native / Expo)

## Account Info
| Service | ID |
|---------|-----|
| Apple Developer Team | `26D5RM6W9W` |
| Google Play Console | `4773571487687181670` |
| EAS Project | `20bb8f4d-2b7b-42e9-a903-40eb76941a4d` |
| Bundle ID (iOS) | `com.stagepassaccess.app` |
| Package (Android) | `com.stagepassaccess.app` |

## Quick Start

### Prerequisites
```bash
npm install -g @expo/cli eas-cli
```

### Install & Run
```bash
cd apps/mobile
npm install

# Log into EAS
eas login

# Start dev server
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

## Build for Production

### Option A: Use the build script
```bash
# macOS/Linux
bash scripts/build_mobile.sh

# Windows (PowerShell)
.\scripts\build_mobile.ps1
```

### Option B: Manual commands

#### Android (AAB → Play Store)
```bash
cd apps/mobile
eas build --platform android --profile production
```

#### iOS (IPA → App Store)
```bash
cd apps/mobile
eas build --platform ios --profile production
```

#### Android Preview APK (for testing)
```bash
eas build --platform android --profile preview
```

## Submit to Stores

### Google Play Store
1. First build must be uploaded manually:
   - Download the `.aab` from EAS dashboard
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app → Upload AAB → Set up store listing
2. Subsequent builds can use EAS Submit:
```bash
eas submit --platform android --profile production
```

### Apple App Store
1. Create the app in [App Store Connect](https://appstoreconnect.apple.com):
   - Bundle ID: `com.stagepassaccess.app`
   - Get the **ASC App ID** from the app page URL
   - Update `eas.json` → `submit.production.ios.ascAppId`
2. Submit:
```bash
eas submit --platform ios --profile production
```

## Architecture
```
apps/mobile/
├── App.tsx                  # Root — auth routing
├── app.json                 # Expo config (icons, splash, permissions)
├── eas.json                 # EAS Build configs (with real account IDs)
├── src/
│   ├── lib/
│   │   ├── firebase.ts      # Firebase client + AsyncStorage persistence
│   │   ├── theme.ts         # Color tokens matching web
│   │   └── AuthContext.tsx   # Auth state provider
│   ├── navigation/
│   │   ├── AuthNavigator.tsx # Login/Signup stack
│   │   └── MainNavigator.tsx # Bottom tabs
│   └── screens/
│       ├── FeedScreen.tsx    # Content grid + pull-to-refresh
│       ├── RadioScreen.tsx   # Stations + expo-av audio playback
│       ├── LiveScreen.tsx    # Active streams
│       ├── LoginScreen.tsx   # Email/password + eye toggle
│       ├── SignupScreen.tsx  # Terms checkbox + channel setup
│       └── ProfileScreen.tsx # Image picker + social links
```

## Screens

| Screen | Features |
|--------|----------|
| Feed | Firestore content grid, thumbnails, pull-to-refresh |
| Radio | Station cards, Auto-DJ badge, mini player (expo-av) |
| Live | Active streams with listener count |
| Profile | expo-image-picker for avatar, social links, sign out |
| Login | Email/password with eye toggle |
| Signup | Terms checkbox, channel name |

## Store Listing Assets Needed
- **App Icon**: 1024x1024 (already at `assets/icon.png`)
- **Screenshots**: 6.5" iPhone, 5.5" iPhone, 10.5" iPad, phone + 7" tablet (Android)
- **Feature Graphic** (Android): 1024x500
- **Description**: ~4000 chars for both stores
- **Privacy Policy URL**: `https://stagepassaccess.com/legal/privacy`
