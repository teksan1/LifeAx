#!/bin/bash

# LifeAx APK Build Script
# This script automates the APK build process

set -e

echo "========================================="
echo "LifeAx Android APK Builder"
echo "========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 11 or higher."
    exit 1
fi

if ! command -v gradle &> /dev/null; then
    echo "❌ Gradle not found. Please install Gradle."
    exit 1
fi

echo "✓ Java version: $(java -version 2>&1 | head -1)"
echo "✓ Gradle version: $(gradle --version | head -1)"
echo ""

# Set Android SDK paths
export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-/usr/lib/android-sdk}
export ANDROID_HOME=${ANDROID_HOME:-/usr/lib/android-sdk}

if [ ! -d "$ANDROID_SDK_ROOT" ]; then
    echo "❌ Android SDK not found at $ANDROID_SDK_ROOT"
    echo "Please set ANDROID_SDK_ROOT environment variable."
    exit 1
fi

echo "✓ Android SDK: $ANDROID_SDK_ROOT"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Build web assets
echo "Step 1: Building web assets..."
pnpm build
echo "✓ Web assets built successfully"
echo ""

# Step 2: Sync with Capacitor
echo "Step 2: Syncing with Capacitor..."
npx cap sync android
echo "✓ Capacitor sync completed"
echo ""

# Step 3: Build APK
echo "Step 3: Building Android APK..."
cd android

BUILD_TYPE=${1:-debug}

if [ "$BUILD_TYPE" = "release" ]; then
    echo "Building RELEASE APK..."
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    echo "Building DEBUG APK..."
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

echo ""
echo "========================================="
echo "✓ APK Build Successful!"
echo "========================================="
echo ""
echo "APK Location: $SCRIPT_DIR/$APK_PATH"
echo ""
echo "Installation Instructions:"
echo "1. Connect your Android device via USB"
echo "2. Enable USB Debugging on your device"
echo "3. Run: adb install $APK_PATH"
echo ""
echo "Or transfer the APK file to your device and install manually."
echo ""

