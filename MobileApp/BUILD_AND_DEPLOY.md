# Mobile App Phase 9 - Build & Deploy Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All Phases 1-8 complete and committed
- [ ] No console errors or warnings
- [ ] All imports resolved
- [ ] TypeScript strict mode enabled
- [ ] No hardcoded passwords or secrets in code
- [ ] API endpoints configured for production

### Environment Setup
- [ ] Android SDK installed (API 33+)
- [ ] Java Development Kit 11+ installed
- [ ] Gradle cache cleaned
- [ ] Node.js 16+ installed
- [ ] npm dependencies up to date

### EAS Build (Recommended for Play Store)

#### 1. Create Expo Account
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

#### 2. Configure eas.json
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview2": {
      "android": {
        "buildType": "aab"
      }
    },
    "production": {
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "path/to/service-account.json"
      }
    }
  }
}
```

#### 3. Build for Production
```bash
# Create signed APK for local testing
eas build --platform android --profile preview

# Create signed AAB for Play Store
eas build --platform android --profile production
```

### Manual Build (Local Setup)

#### 1. Generate Keystore
```bash
# Create signing key (run once)
keytool -genkey -v -keystore ~/.android/vinh-khanh-guide.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vinhkhanh-key
```

#### 2. Configure app.json
```json
{
  "expo": {
    "name": "Vinh Khanh Guide",
    "slug": "vinh-khanh-guide",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "android": {
      "versionCode": 1,
      "package": "com.vinhkhanhguide.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "INTERNET"
      ],
      "useNextNotificationApi": true,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

#### 3. Configure build.gradle
```gradle
android {
  compileSdkVersion 33
  minSdkVersion 21
  targetSdkVersion 33

  signingConfigs {
    release {
      storeFile file(System.getenv("KEYSTORE_PATH") ?: "~/.android/vinh-khanh-guide.keystore")
      storePassword System.getenv("KEYSTORE_PASSWORD")
      keyAlias System.getenv("KEY_ALIAS")
      keyPassword System.getenv("KEY_PASSWORD")
    }
  }

  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled false
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
    }
  }
}
```

#### 4. Build Signed APK
```bash
# Set environment variables
export KEYSTORE_PATH="~/.android/vinh-khanh-guide.keystore"
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_ALIAS="vinhkhanh-key"
export KEY_PASSWORD="your-key-password"

# Build Gradle
cd MobileApp
./gradlew assembleRelease

# Signed APK location: android/app/build/outputs/apk/release/app-release.apk
```

## Google Play Store Submission

### 1. Create Developer Account
- Go to Google Play Console (https://play.google.com/console)
- Create developer account ($25 one-time fee)
- Accept agreements and policies

### 2. Create App Listing
- App name: "Vinh Khanh Guide"
- Package name: "com.vinhkhanhguide.app"
- App category: "Travel & Local"
- Content rating: Calculate rating questionnaire

### 3. Add App Details
- **Screenshots**
  - 2-8 screenshots (1080x1920 recommended)
  - Show key features: map, POIs, audio player, tours

- **Short description** (80 chars)
  "Explore Vinh Khanh's gastronomy via audio guide with maps and tours"

- **Full description** (4000 chars)
  "Experience Vinh Khanh street food like never before. Our Audio Guide app provides:
  - Interactive map with POI locations
  - Multilingual audio descriptions (VI/EN/JP)
  - Guided tours through famous food court
  - Auto-play when you approach locations
  - Offline mode for travel anywhere"

- **Privacy Policy URL**
  "https://vinhkhanh.guide/privacy"

- **Permissions Explanation**
  - Location: Show nearby POIs and auto-play
  - Camera: Scan QR codes for instant info
  - Audio: Play multilingual descriptions

### 4. Upload APK/AAB
- Go to "Release" → "Production"
- Upload signed AAB (Android App Bundle)
- Add release notes for version 1.0

### 5. Configure Store Listing
- Select content rating per IARC
- Add contact email
- Add website (optional)
- Specify target countries/regions

### 6. Review & Publish
- Google Play performs automated review (~30 mins)
- May request clarifications
- Once approved, app appears in Play Store
- Propagates to all countries in ~24 hours

## Version Management

### Versioning Scheme
- Format: MAJOR.MINOR.PATCH (e.g., 1.0.0)
- Major: New features, UI redesign
- Minor: New POIs, tours, languages
- Patch: Bug fixes, performance improvements

### Update releases/versionCode in app.json
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

## Post-Deployment

### Monitoring
- Monitor crash reports in Google Play Console
- Review user ratings and feedback
- Track download/install metrics

### Future Updates
- Version 1.1: Heatmap analytics, wishlist feature
- Version 1.2: Tours sharing, user-generated POIs
- Version 2.0: Offline content delivery, service worker

## Troubleshooting

### Build fails
```bash
# Clean build
cd MobileApp
rm -rf node_modules package-lock.json
npm install
./gradlew clean
```

### Signature verification fails
- Ensure keystore path is correct
- Verify passwords match during signing
- Use same keystore for all app updates

### App rejected by Play Store
- Check content policy compliance
- Verify all permissions are justified
- Remove suspicious third-party ads

## Success - App Live! 🚀

Once approved, your app is live on Google Play Store and ready for users to discover Vinh Khanh's food culture through an interactive audio guide.
