# LifeAx Installation Instructions

## 📱 Android Installation

### Prerequisites
- Android device running Android 5.0 or higher
- Minimum 100MB free storage space
- Internet connection (for AI features)

### Step-by-Step Installation

#### Step 1: Enable Unknown Sources
1. Open **Settings** on your Android device
2. Navigate to **Security** or **Privacy**
3. Find **Unknown Sources** or **Install Unknown Apps**
4. Toggle the switch to **ON**
5. Confirm the warning message

#### Step 2: Download the APK
1. Download `lifeax-v1.0.0-release.apk` to your device
2. Or transfer the file via USB from a computer

#### Step 3: Install the APK
1. Open **File Manager** on your device
2. Navigate to **Downloads** folder
3. Find `lifeax-v1.0.0-release.apk`
4. Tap the file to start installation
5. Review permissions and tap **Install**
6. Wait for installation to complete (usually 30-60 seconds)

#### Step 4: Launch the App
1. After installation, tap **Open** or
2. Find **LifeAx** in your app drawer
3. Tap to launch the application

### Permissions Required
When you first launch LifeAx, you may be asked to grant:
- **Calendar Access**: For calendar features
- **Notifications**: For reminders and alerts
- **Internet**: For AI chat and data sync
- **Storage**: For saving data locally

Grant these permissions for full functionality.

---

## 💻 Windows/Mac/Linux Installation (for Development)

### Prerequisites
- Node.js 16+ and npm/pnpm
- Java 11+
- Android SDK
- Gradle

### Build from Source

```bash
# 1. Clone repository
git clone https://github.com/teksan1/LifeAx.git
cd LifeAx

# 2. Install dependencies
pnpm install

# 3. Build web assets
pnpm build

# 4. Set up Android environment
export ANDROID_SDK_ROOT=/path/to/android-sdk
export ANDROID_HOME=/path/to/android-sdk

# 5. Sync with Capacitor
npx cap sync android

# 6. Build APK
cd android
./gradlew assembleDebug    # For debug version
./gradlew assembleRelease  # For release version

# 7. Find your APK
# Debug: android/app/build/outputs/apk/debug/app-debug.apk
# Release: android/app/build/outputs/apk/release/app-release.apk
```

### Using the Build Script

```bash
# Make the script executable
chmod +x build-apk.sh

# Build debug APK
./build-apk.sh

# Build release APK
./build-apk.sh release
```

---

## 🔗 Installation via ADB (Advanced)

### Prerequisites
- Android SDK Platform Tools installed
- USB debugging enabled on device
- Device connected via USB

### Steps

```bash
# 1. Verify device is connected
adb devices

# 2. Install APK
adb install lifeax-v1.0.0-release.apk

# 3. Launch app
adb shell am start -n com.lifeax.app/.MainActivity

# 4. View logs (optional)
adb logcat
```

---

## 🌐 Web Installation (Browser)

LifeAx is also available as a web application:

1. Visit: https://lifeax.manus.space
2. Sign in with your credentials
3. Start using immediately (no installation needed)

---

## ✅ Verification

After installation, verify everything works:

1. **Launch the app** - Should open without errors
2. **Sign in** - Enter your credentials
3. **Test AI Chat** - Send a message to the AI
4. **Check Calendar** - View your calendar
5. **Create a Task** - Add a new task

---

## 🔄 Updating LifeAx

### Update from APK
1. Download the new APK file
2. Install it over the existing version
3. Your data will be preserved automatically

### Update from Source
```bash
# Pull latest changes
git pull origin main

# Rebuild APK
pnpm build
npx cap sync android
cd android
./gradlew assembleRelease
```

---

## 🗑️ Uninstallation

### From Android Device
1. Open **Settings**
2. Go to **Apps** or **Application Manager**
3. Find and tap **LifeAx**
4. Tap **Uninstall**
5. Confirm the action

### From Command Line
```bash
adb uninstall com.lifeax.app
```

---

## 🆘 Troubleshooting

### Installation Issues

**"Unknown app" warning**
- This is normal for apps from unknown sources
- Tap "Install anyway" or "Continue"

**"Insufficient storage" error**
- Free up at least 100MB of space
- Delete unused apps or files
- Try again

**"App not compatible" error**
- Your Android version is too old
- Update to Android 5.0 or higher
- Check device compatibility

**Installation hangs**
- Restart your device
- Clear Play Store cache
- Try again

### Runtime Issues

**App crashes on startup**
- Clear app cache: Settings > Apps > LifeAx > Storage > Clear Cache
- Uninstall and reinstall
- Check Android version

**Features not working**
- Check internet connection
- Grant required permissions
- Clear app cache
- Restart the app

**Performance is slow**
- Close background apps
- Clear app cache
- Restart device
- Free up storage space

---

## 📊 System Information

### Supported Android Versions
- ✅ Android 5.0 (API 21) - Minimum
- ✅ Android 6.0 - 12.x
- ✅ Android 13+ - Recommended

### Device Requirements
- **Processor**: ARM or x86
- **RAM**: 2GB minimum, 4GB+ recommended
- **Storage**: 100MB for app + data
- **Screen**: 4.5" or larger recommended

### Network Requirements
- **Connection**: WiFi or mobile data
- **Speed**: 1Mbps+ recommended
- **Latency**: Low latency for real-time features

---

## 📞 Getting Help

If you encounter issues:

1. **Check this guide** - Most issues are covered above
2. **GitHub Issues** - https://github.com/teksan1/LifeAx/issues
3. **Documentation** - https://github.com/teksan1/LifeAx/wiki
4. **Community** - Discuss with other users

---

## 🎓 First Time Setup

### Initial Configuration
1. **Create Account** - Sign up or log in
2. **Profile Setup** - Add your name and preferences
3. **Permissions** - Grant necessary permissions
4. **Preferences** - Configure app settings
5. **Start Using** - Begin with any feature

### Recommended First Steps
1. **Explore AI Chat** - Get familiar with the AI
2. **Add Calendar Events** - Schedule your activities
3. **Create Tasks** - Set up your goals
4. **Configure Habits** - Start tracking habits
5. **Enable Notifications** - Get reminders

---

**Last Updated**: January 30, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
