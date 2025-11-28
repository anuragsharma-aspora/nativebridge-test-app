# NativeBridge Setup Guide

Complete step-by-step guide to set up the NativeBridge app with biometric authentication.

## Prerequisites

- macOS with Xcode installed
- Node.js >= 18
- Java JDK 17 (required for React Native 0.74.7)
- Android SDK and Android Studio
- React Native development environment set up

## Quick Setup (Automated)

```bash
cd /Users/himanshukukreja/autoflow/NativeBridge
chmod +x setup.sh
./setup.sh
```

This will automatically:
1. Copy NativeBridgeApp source
2. Update package names
3. Install dependencies
4. Update App.tsx with authentication gate
5. Build the APK
6. Copy APK to builds folder

## Manual Setup (Step-by-Step)

### Step 1: Copy the Base App

```bash
cd /Users/himanshukukreja/autoflow
cp -R appium-test-scripts/android-test-apps/NativeBridgeApp NativeBridge
cd NativeBridge
```

### Step 2: Update Package Name

Update the following files to change `com.nativebridgeapp` to `com.nativebridge.io`:

**Android Manifest** (`android/app/src/main/AndroidManifest.xml`):
```bash
sed -i '' 's/com.nativebridgeapp/com.nativebridge.io/g' android/app/src/main/AndroidManifest.xml
```

**build.gradle** (`android/app/build.gradle`):
```bash
sed -i '' 's/com.nativebridgeapp/com.nativebridge.io/g' android/app/build.gradle
```

**MainActivity.kt** - Rename directory:
```bash
cd android/app/src/main/java/com
mv nativebridgeapp nativebridge
mkdir -p nativebridge/io
mv nativebridge/* nativebridge/io/
cd nativebridge/io
```

Update package in `MainActivity.kt`:
```bash
sed -i '' 's/package com.nativebridgeapp/package com.nativebridge.io/g' MainActivity.kt
```

**MainApplication.kt** - Same directory, update package:
```bash
sed -i '' 's/package com.nativebridgeapp/package com.nativebridge.io/g' MainApplication.kt
```

### Step 3: Update App Name

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">NativeBridge</string>
</resources>
```

### Step 4: Install Dependencies

```bash
cd /Users/himanshukukreja/autoflow/NativeBridge
npm install --legacy-peer-deps
```

Dependencies include:
- react-native@0.74.7
- react-native-biometrics@3.0.1
- react-native-camera@4.2.1
- react-native-document-picker@8.2.1
- react-native-fs@2.20.0
- @react-native-clipboard/clipboard@1.14.1
- react-native-safe-area-context@4.10.9

### Step 5: Update App.tsx

Replace the contents of `App.tsx` with the authentication-gated version provided in this repository. The key changes include:

1. **Add authentication state**:
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isAuthenticating, setIsAuthenticating] = useState(false);
const [authError, setAuthError] = useState('');
```

2. **Add useEffect hook** to trigger authentication on launch:
```typescript
useEffect(() => {
  checkAndAuthenticateOnLaunch();
}, []);
```

3. **Add conditional rendering** to show auth screen or main app

See `App.tsx` in this repository for the complete implementation.

### Step 6: Verify Android Permissions

Ensure `android/app/src/main/AndroidManifest.xml` includes:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Step 7: Add App Icon (Optional)

If you have a PNG logo, convert it to Android mipmap formats:

```bash
# Place your logo.png in the NativeBridge folder
# Then run ImageMagick commands:

magick logo.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
magick logo.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
magick logo.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
magick logo.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
magick logo.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

### Step 8: Build the APK

#### Debug Build:
```bash
cd android
./gradlew clean assembleDebug
```

Debug APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release Build (Signed):
```bash
cd android
./gradlew clean assembleRelease
```

Release APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 9: Copy APK to Builds Folder

```bash
mkdir -p /Users/himanshukukreja/autoflow/NativeBridge/builds
cp android/app/build/outputs/apk/release/app-release.apk builds/nativebridge-v1.apk
```

Or for debug:
```bash
cp android/app/build/outputs/apk/debug/app-debug.apk builds/nativebridge-debug-v1.apk
```

## Testing the App

### 1. Install on Device/Emulator

```bash
adb install builds/nativebridge-v1.apk
```

Or connect to LambdaTest device:
```bash
adb connect <device-id>
adb -s <device-id> install builds/nativebridge-v1.apk
```

### 2. Expected Behavior

**On Launch:**
1. App shows biometric authentication screen
2. Fingerprint/biometric sensor icon visible
3. User must authenticate to proceed

**If Biometrics Not Available:**
1. App shows error message
2. Cannot access any features
3. Must enable biometrics in device settings

**After Successful Authentication:**
1. Shows "Authentication Successful!" message
2. Unlocks the main app interface
3. All features become accessible:
   - Network Testing
   - UI Testing
   - Performance Testing
   - Permission Testing
   - File Operations
   - QR Code Scanner
   - Biometric Re-authentication

### 3. Test All Features

After authentication, test each section:

- **Network**: Make API calls, test connectivity
- **UI Testing**: Test button interactions
- **Performance**: Check metrics
- **Permissions**: Test permission requests
- **Files**: Upload and create CSV files
- **QR Scanner**: Scan QR codes
- **Biometric**: Test re-authentication

## Troubleshooting

### Build Errors

**Error: Java version mismatch**
```bash
# Check Java version
java -version

# Should be Java 17 for RN 0.74.7
# Set Java 17:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

**Error: Gradle build failed**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

**Error: npm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Runtime Errors

**Error: Biometric sensor not detected**
- Ensure device has fingerprint sensor or face unlock
- Enable biometric authentication in device settings
- For emulators: Use AVD with fingerprint support enabled

**Error: Camera not working**
- Grant camera permission in app settings
- Check if camera permission is in AndroidManifest.xml
- Restart app after granting permission

**Error: File operations fail**
- Grant storage permission
- For Android 13+: Use scoped storage (already implemented)
- Check if WRITE_EXTERNAL_STORAGE permission granted

**Error: App crashes on launch**
```bash
# Check logcat for errors
adb logcat | grep -i "nativebridge\|error\|crash"
```

### Authentication Issues

**Biometric prompt doesn't appear:**
- Check if `USE_BIOMETRIC` permission in manifest
- Verify react-native-biometrics is properly linked
- Restart app and try again

**Authentication fails repeatedly:**
- Check device biometric settings
- Re-enroll fingerprint in device settings
- Try using device PIN as fallback (if `allowDeviceCredentials: true`)

**App stuck on authentication screen:**
- Check console logs for errors
- Verify authentication state management in App.tsx
- Try force-closing and reopening app

## Version History

### v1.0
- Initial release
- Based on NativeBridgeApp with all features
- Added mandatory biometric authentication gate
- React Native 0.74.7
- Package: com.nativebridge.io

## Additional Resources

- [React Native Biometrics Documentation](https://github.com/SelfLender/react-native-biometrics)
- [Android BiometricPrompt API](https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt)
- [React Native 0.74 Setup Guide](https://reactnative.dev/docs/environment-setup)

## Support

For issues or questions:
1. Check this documentation
2. Review `BIOMETRIC_IMPLEMENTATION.md` for technical details
3. Check logcat for error messages
4. Review the original NativeBridgeApp implementation
