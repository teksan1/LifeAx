# LifeAx Android APK Build Guide

## Overview

This guide explains how to build and install the LifeAx application as an Android APK (installable application package).

## Prerequisites

Before building the APK, ensure you have the following installed:

1. **Java Development Kit (JDK)** - Version 11 or higher
   ```bash
   java -version
   ```

2. **Android SDK** - With build tools and platform tools
   ```bash
   export ANDROID_HOME=/usr/lib/android-sdk
   export ANDROID_SDK_ROOT=/usr/lib/android-sdk
   ```

3. **Gradle** - Build system for Android
   ```bash
   gradle --version
   ```

4. **Node.js and npm/pnpm** - Already installed

## Build Instructions

### Step 1: Prepare the Web Assets

The web application has already been built and is ready in the `dist/` directory.

```bash
cd /home/ubuntu/lifeax_permanent
```

### Step 2: Build Using Capacitor (Recommended)

Capacitor is already configured. To build the APK:

```bash
# Set Android SDK environment variables
export ANDROID_SDK_ROOT=/usr/lib/android-sdk
export ANDROID_HOME=/usr/lib/android-sdk

# Sync web assets with Android project
npx cap sync android

# Navigate to Android project
cd android

# Build the APK (debug version)
./gradlew assembleDebug

# Build the APK (release version - requires signing)
./gradlew assembleRelease
```

### Step 3: Locate the Built APK

After successful build, the APK file will be located at:

**Debug APK:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK:**
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installation on Android Device

### Using ADB (Android Debug Bridge)

1. Connect your Android device via USB
2. Enable USB Debugging on your device (Settings > Developer Options > USB Debugging)
3. Install the APK:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Manual Installation

1. Transfer the APK file to your Android device
2. Open the file manager on your device
3. Navigate to the APK file
4. Tap to install
5. Grant necessary permissions

## Troubleshooting

### Gradle Build Failures

If you encounter Gradle build errors:

1. **Java Version Mismatch:**
   ```bash
   # Check Java version
   java -version
   
   # Update to Java 17 if needed
   sudo apt-get install openjdk-17-jdk
   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
   ```

2. **Android SDK Issues:**
   ```bash
   # Accept all Android SDK licenses
   yes | sdkmanager --licenses
   
   # Update Android SDK
   sdkmanager --update
   ```

3. **Gradle Daemon Issues:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

### APK Installation Failures

1. **Unknown Sources:** Allow installation from unknown sources in Settings
2. **Incompatible Version:** Ensure your device runs Android 5.0 or higher
3. **Storage Space:** Ensure your device has sufficient storage space

## Configuration

### App Metadata

The app is configured with the following details:

- **App ID:** `com.lifeax.app`
- **App Name:** `LifeAx`
- **Version:** 1.0.0
- **Minimum Android Version:** 5.0 (API 21)
- **Target Android Version:** 13+ (API 33+)

To modify these settings, edit:
- `capacitor.config.ts` - Capacitor configuration
- `android/app/build.gradle` - Android build configuration

## Features Included in APK

The APK includes all LifeAx features:

- ✅ AI Chat with streaming responses
- ✅ Calendar and event management
- ✅ Task tracking and management
- ✅ Meal planning and meal prep tracking
- ✅ Habits tracker
- ✅ Notifications and alerts
- ✅ User profile management
- ✅ Responsive mobile-optimized UI
- ✅ Brutalist design aesthetic

## Release Build (Production)

For production releases, you need to sign the APK:

1. **Create a keystore:**
   ```bash
   keytool -genkey -v -keystore ~/lifeax-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias lifeax
   ```

2. **Configure signing in `android/app/build.gradle`:**
   ```gradle
   signingConfigs {
       release {
           storeFile file(System.getenv("KEYSTORE_FILE") ?: "~/lifeax-release.keystore")
           storePassword System.getenv("KEYSTORE_PASSWORD")
           keyAlias System.getenv("KEY_ALIAS")
           keyPassword System.getenv("KEY_PASSWORD")
       }
   }
   ```

3. **Build signed release APK:**
   ```bash
   export KEYSTORE_FILE=~/lifeax-release.keystore
   export KEYSTORE_PASSWORD=your_password
   export KEY_ALIAS=lifeax
   export KEY_PASSWORD=your_password
   
   cd android
   ./gradlew assembleRelease
   ```

## Support

For issues or questions, refer to:
- [Capacitor Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/)
- [Gradle Documentation](https://gradle.org/documentation/)

---

**Last Updated:** January 25, 2026
**LifeAx Version:** 1.0.0
