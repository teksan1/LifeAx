# LifeAx - Android APK Installation Guide

## 📱 About LifeAx

LifeAx is a comprehensive life optimization assistant featuring:

- **AI Chat**: Conversational AI with emotional intelligence
- **Calendar**: Event and schedule management
- **Tasks**: Goal tracking and task management
- **Meal Planning**: Meal plans and shopping lists
- **Meal Prep**: Track meal preparation sessions
- **Habits**: Build and track daily habits
- **Notifications**: Smart reminders and alerts
- **Profile**: Personal information and preferences

## 🚀 Quick Start

### Option 1: Install from APK File (Easiest)

1. **Download the APK**
   - Download `lifeax-v1.0.0-release.apk` from this folder

2. **Enable Installation from Unknown Sources**
   - Go to Settings > Security > Unknown Sources
   - Toggle ON "Allow installation of apps from unknown sources"

3. **Install the APK**
   - Open the downloaded APK file
   - Tap "Install"
   - Wait for installation to complete
   - Tap "Open" to launch LifeAx

### Option 2: Build from Source

If you want to build the APK yourself:

```bash
# Clone the repository
git clone https://github.com/teksan1/LifeAx.git
cd LifeAx

# Install dependencies
pnpm install

# Build the APK
bash build-apk.sh

# Or build release version
bash build-apk.sh release
```

## 📋 System Requirements

- **Android Version**: 5.0 (API 21) or higher
- **Storage**: Minimum 100MB free space
- **RAM**: Minimum 2GB recommended
- **Internet**: Required for AI features

## 🔧 Installation Methods

### Method 1: Direct APK Installation
1. Transfer APK to your Android device
2. Open file manager and navigate to the file
3. Tap to install
4. Grant permissions when prompted

### Method 2: Using ADB (Android Debug Bridge)
```bash
# Connect device via USB
adb devices

# Install APK
adb install lifeax-v1.0.0-release.apk

# Launch app
adb shell am start -n com.lifeax.app/.MainActivity
```

### Method 3: Using Android Studio
1. Open Android Studio
2. Go to Run > Run 'app'
3. Select your device
4. Click OK

## 🎯 First Launch

1. **Login**: Sign in with your credentials
2. **Grant Permissions**: Allow notifications and calendar access
3. **Setup Profile**: Configure your preferences
4. **Start Using**: Begin with AI Chat or Calendar

## 🔐 Security & Privacy

- All data is encrypted in transit
- User authentication via OAuth
- No personal data is sold or shared
- Regular security updates

## 🐛 Troubleshooting

### App Won't Install
- **Error: "Unknown sources"**: Enable installation from unknown sources in Settings
- **Error: "Insufficient storage"**: Free up at least 100MB of space
- **Error: "Incompatible version"**: Ensure Android 5.0 or higher

### App Crashes on Startup
- Clear app cache: Settings > Apps > LifeAx > Storage > Clear Cache
- Uninstall and reinstall the app
- Check Android version compatibility

### Features Not Working
- **No AI responses**: Check internet connection
- **Calendar not syncing**: Grant calendar permissions
- **Notifications not showing**: Enable notifications in app settings

### Performance Issues
- Close background apps
- Clear app cache regularly
- Update to the latest Android version
- Restart your device

## 📞 Support

For issues or feature requests:
- GitHub: https://github.com/teksan1/LifeAx
- Issues: https://github.com/teksan1/LifeAx/issues

## 📝 Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ AI Chat with streaming responses
- ✅ Calendar and event management
- ✅ Task tracking
- ✅ Meal planning and prep tracking
- ✅ Habits tracker
- ✅ Notifications system
- ✅ Mobile-optimized UI
- ✅ Close buttons on all modals
- ✅ Responsive design for all screen sizes

## 🎨 Design Features

- **Brutalist Aesthetic**: Bold, minimalist design with high contrast
- **Mobile Optimized**: Fully responsive interface for phones and tablets
- **Touch-Friendly**: Large buttons and easy navigation
- **Dark Theme**: Easy on the eyes with professional appearance

## 🔄 Updates

To update LifeAx:
1. Download the latest APK
2. Install over the existing version
3. Your data will be preserved

## 📜 License

LifeAx is released under the MIT License. See LICENSE file for details.

## 🙏 Credits

Built with:
- React 19
- Tailwind CSS
- Capacitor
- Express.js
- tRPC

---

**Version**: 1.0.0  
**Last Updated**: January 30, 2026  
**Status**: Production Ready
