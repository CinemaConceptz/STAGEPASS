# STAGEPASS Mobile App (React Native / Expo)

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 34+

### Install Dependencies
```bash
cd apps/mobile
npm install
```

### Configure Firebase
The app uses the same Firebase project as the web app (`stagepass-live-v1`).

For Android, download `google-services.json` from Firebase Console and place it in the project root.
For iOS, download `GoogleService-Info.plist` and place it in the project root.

### Run Development
```bash
# Start Expo dev server
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

### Build for Production

#### Android (APK)
```bash
eas build --platform android --profile production
```

#### iOS (IPA)
```bash
eas build --platform ios --profile production
```

### Submit to Stores

#### Google Play Store
```bash
eas submit --platform android --profile production
```

#### Apple App Store
```bash
eas submit --platform ios --profile production
```

## Architecture

```
apps/mobile/
├── App.tsx                  # Root component with auth routing
├── app.json                 # Expo config (icons, splash, permissions)
├── eas.json                 # EAS Build & Submit config
├── src/
│   ├── lib/
│   │   ├── firebase.ts      # Firebase client (auth with AsyncStorage persistence)
│   │   ├── theme.ts         # STAGEPASS color tokens & spacing
│   │   └── AuthContext.tsx   # Auth state provider
│   ├── navigation/
│   │   ├── AuthNavigator.tsx # Login/Signup stack
│   │   └── MainNavigator.tsx # Bottom tabs (Feed, Radio, Live, Profile)
│   └── screens/
│       ├── FeedScreen.tsx    # Content feed from Firestore
│       ├── RadioScreen.tsx   # Radio stations with Auto-DJ playback
│       ├── LiveScreen.tsx    # Live streams list
│       ├── LoginScreen.tsx   # Email + password eye toggle
│       ├── SignupScreen.tsx  # With terms checkbox
│       └── ProfileScreen.tsx # Editable profile with image picker
```

## Screens

| Screen | Features |
|--------|----------|
| Feed | Pull-to-refresh content grid, video thumbnails |
| Radio | Station grid, Auto-DJ badge, mini player, expo-av audio |
| Live | Active streams with listener count |
| Profile | Image picker for avatar, social links, sign out |
| Login | Email/password with eye toggle |
| Signup | Terms checkbox, channel name, creator type |
