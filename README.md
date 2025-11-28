# NativeBridge App

## Overview

**NativeBridge** is a production-ready Android application with biometric authentication gate. Users must authenticate with fingerprint/biometrics before accessing any features.

**Package Name:** `com.nativebridge.io`
**Based on:** NativeBridgeApp testing framework
**Key Feature:** Biometric authentication required on app launch

---

## Project Structure

```
NativeBridge/
├── README.md                          (This file)
├── SETUP_GUIDE.md                     (Setup instructions)
├── BIOMETRIC_IMPLEMENTATION.md        (Auth gate documentation)
├── setup.sh                           (Automated setup script)
├── App.tsx                            (Will be created during setup)
├── package.json
├── android/
│   ├── app/
│   │   ├── src/main/java/com/nativebridge/io/
│   │   │   ├── MainActivity.kt
│   │   │   └── MainApplication.kt
│   │   └── build.gradle
│   └── gradlew
└── builds/
    └── nativebridge-v1.apk            (Output APK)
```

---

## Quick Start

### 1. Run Setup Script

```bash
cd /Users/himanshukukreja/autoflow/NativeBridge
chmod +x setup.sh
./setup.sh
```

This will:
- Copy NativeBridgeApp template
- Update package name to com.nativebridge.io
- Add custom logo
- Install dependencies
- Build release APK

### 2. Install & Test

```bash
# Install APK on device
adb install -r builds/nativebridge-v1.apk

# Launch app
adb shell am start -n com.nativebridge.io/.MainActivity

# Monitor logs
adb logcat | grep -E "NativeBridge|Biometric"
```

---

## App Behavior

### Launch Flow

1. **App Starts** → Shows biometric authentication screen
2. **Biometric Prompt** → System fingerprint dialog appears
3. **User Authenticates** → Scans enrolled fingerprint
4. **Success Message** → "Authentication Successful! 🎉"
5. **App Unlocks** → Access to all features

### Features (After Authentication)

- ✅ UI Components Testing
- ✅ Network Operations (GET, POST, Upload, Download)
- ✅ Performance Testing (CPU, Memory)
- ✅ Permissions Management
- ✅ Storage & Clipboard
- ✅ File Operations (Upload, CSV Save)
- ✅ QR Code Scanning
- ✅ Biometric Features

---

## Requirements

### Device Requirements

- Android device with fingerprint sensor
- At least one fingerprint enrolled in Settings
- Screen lock (PIN/Pattern/Password) configured

### Development Requirements

- Node.js >= 18
- React Native 0.74.7
- Android SDK
- Java 17 or 23

---

## Key Differences from NativeBridgeApp

| Feature | NativeBridgeApp | NativeBridge |
|---------|-----------------|--------------|
| **Purpose** | Testing framework | Production app |
| **Package** | com.nativebridgeapp | com.nativebridge.io |
| **Authentication** | Optional (Bio tab) | Required on launch |
| **Access** | Open | Locked until authenticated |
| **Frida Gadget** | ✅ Embedded | ❌ Not included |
| **Logo** | Default | Custom NativeBridge |

---

## Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **BIOMETRIC_IMPLEMENTATION.md** - How biometric authentication works
- **setup.sh** - Automated setup script

---

## Troubleshooting

### App Won't Launch

```bash
# Check logs
adb logcat | grep AndroidRuntime

# Common issues:
# 1. Package name mismatch in AndroidManifest
# 2. Missing dependencies
```

### Biometric Not Available

**Solution:**
1. Go to Settings → Security → Fingerprint
2. Enroll at least one fingerprint
3. Restart app

### Build Fails

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## Support

For issues, check:
1. Logs: `adb logcat | grep -i biometric`
2. Package name: `grep -r "com.nativebridge.io" android/`
3. Dependencies: `npm list`

---

**Ready to build secure, authenticated Android apps! 🔒**
