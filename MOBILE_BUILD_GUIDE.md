# STAGEPASS Mobile App — Build & App Store Submission Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Apple Developer Account ($99/year) → https://developer.apple.com
- Google Play Console Account ($25 one-time) → https://play.google.com/console

---

## Step 1 — Initial Setup

```bash
cd apps/mobile
npm install

# Log in to Expo
eas login
# Use your Expo account (create at expo.dev if needed)

# Link the project (already configured)
eas init --id 20bb8f4d-2b7b-42e9-a903-40eb76941a4d
```

---

## Step 2 — Configure Firebase Push Notifications

### For iOS:
1. Go to [Firebase Console](https://console.firebase.google.com) → stagepass-live-v1
2. Project Settings → Your Apps → Add iOS App
3. Bundle ID: `com.stagepassaccess.app`
4. Download **GoogleService-Info.plist**
5. Place it at `apps/mobile/GoogleService-Info.plist`

### For Android:
1. Firebase Console → Your Apps → Add Android App
2. Package: `com.stagepassaccess.app`
3. Download **google-services.json**
4. Place it at `apps/mobile/google-services.json`

### iOS APNs Key (required for push notifications):
1. [Apple Developer Console](https://developer.apple.com/account/resources/authkeys/list) → Keys → Create Key
2. Enable **Apple Push Notifications service (APNs)**
3. Download the `.p8` file
4. In Firebase Console → Project Settings → Cloud Messaging → iOS app → Upload APNs key
   - Key ID: (from Apple portal)
   - Team ID: `26D5RM6W9W`

---

## Step 3 — Configure VAPID Key for Web Push
1. Firebase Console → Project Settings → Cloud Messaging
2. Web Push Certificates → **Generate key pair**
3. Copy the key
4. In `deploy_fast.ps1`, replace `YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE` with this key
5. Re-run deploy to update the web service

---

## Step 4 — Update Submission Config

Edit `eas.json` → submit → production:

**iOS:**
```json
"ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
```
- Go to [App Store Connect](https://appstoreconnect.apple.com) → My Apps → Create New App
- Platform: iOS, Bundle ID: `com.stagepassaccess.app`
- Copy the App ID (numeric string from the URL)

**Android:**
```json
"serviceAccountKeyPath": "./google-play-service-account.json"
```
- Go to [Google Play Console](https://play.google.com/console) → Setup → API access
- Create a service account → Download JSON key
- Save as `apps/mobile/google-play-service-account.json`

---

## Step 5 — Build & Submit

### Android (APK for testing):
```bash
cd apps/mobile
eas build --platform android --profile preview
# Share the APK URL with testers
```

### Android (Production AAB for Play Store):
```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

### iOS (Production IPA for App Store):
```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

### Both Platforms:
```bash
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## Step 6 — App Store Connect Setup (iOS)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create the app if not already done
3. Fill in:
   - App name: STAGEPASS
   - Privacy Policy URL: `https://stagepassaccess.com/privacy`
   - Support URL: `https://stagepassaccess.com/support`
   - Category: Entertainment / Music
4. Upload screenshots (required sizes):
   - iPhone 6.7": 1290×2796 px
   - iPhone 6.5": 1242×2688 px
   - iPad 12.9": 2048×2732 px
5. After `eas submit`, the build will appear under **TestFlight** first
6. Submit for App Review once testing is complete

---

## Step 7 — Google Play Console Setup (Android)

1. Log in to [Play Console](https://play.google.com/console)
2. Create App → Free → App content setup
3. Fill in store listing:
   - Short description (80 chars)
   - Full description
   - Screenshots (phone + tablet)
   - Feature graphic: 1024×500 px
4. Content rating: Complete the questionnaire
5. After `eas submit`, find build under **Internal Testing** → promote to Production

---

## OTA Updates (Push code without full re-build)

For JS-only changes, use Expo Updates (no store approval needed):

```bash
eas update --branch production --message "Fix: profile save issue"
```

Users get the update silently on next app launch.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing GoogleService-Info.plist` | Add the file from Firebase Console to `apps/mobile/` |
| Push notifications not arriving | Check APNs key is uploaded to Firebase |
| Android build fails (google-services.json) | Download fresh copy from Firebase Console |
| `Invalid bundle ID` on iOS | Must be `com.stagepassaccess.app` exactly |
| `eas submit` fails on iOS | Ensure App Store Connect app is created first |
| Build times out | EAS free tier can take 15-30 min; upgrade to EAS Pro for priority |

---

## Apple Team ID
Your Team ID: `26D5RM6W9W` (already in eas.json)

## Expo Project ID
`20bb8f4d-2b7b-42e9-a903-40eb76941a4d` (already in app.json)
