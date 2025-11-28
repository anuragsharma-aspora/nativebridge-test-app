# NativeBridge Build Guide

This document provides step-by-step instructions for building the NativeBridge application for different platforms and environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Android Builds](#android-builds)
  - [Production APK for Emulators and Physical Devices](#production-apk-for-emulators-and-physical-devices)
  - [Debug APK](#debug-apk)
- [iOS Builds](#ios-builds)
  - [.app Directory for iOS Simulators](#app-directory-for-ios-simulators)
  - [.ipa for iOS Physical Devices](#ipa-for-ios-physical-devices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### General Requirements
- Node.js (v14 or higher)
- npm or yarn
- React Native CLI installed globally: `npm install -g react-native-cli`

### Android Requirements
- Android Studio
- Android SDK (API level 21 or higher)
- Java Development Kit (JDK 11 or higher)
- Set `ANDROID_HOME` environment variable

### iOS Requirements (macOS only)
- Xcode (latest stable version)
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`
- Valid Apple Developer account (for physical device builds)

---

## Android Builds

### Production APK for Emulators and Physical Devices

A production APK is optimized, signed, and suitable for distribution. It works on both emulators and physical devices.

#### Step 1: Navigate to Project Directory
```bash
cd /Users/himanshukukreja/autoflow/NativeBridge-Debug-Application
```

#### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

#### Step 3: Generate Release Keystore (First Time Only)

If you don't have a keystore, create one:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted to enter:
- Keystore password (remember this!)
- Key password (remember this!)
- Your name, organization, location details

#### Step 4: Configure Gradle for Signing

Edit `android/gradle.properties` and add:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

**⚠️ Important:** Never commit this file with real passwords to version control!

Edit `android/app/build.gradle` and add the signing configuration:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

#### Step 5: Build the Production APK

```bash
cd android
./gradlew assembleRelease
```

#### Step 6: Locate the APK

The production APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### Optional: Build an Android App Bundle (AAB) for Play Store

```bash
cd android
./gradlew bundleRelease
```

The AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

### Debug APK

For development and testing purposes, you can build a debug APK:

```bash
cd android
./gradlew assembleDebug
```

Debug APK location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## iOS Builds

### .app Directory for iOS Simulators

The `.app` directory is used for running the app on iOS Simulators.

#### Step 1: Navigate to Project Directory
```bash
cd /Users/himanshukukreja/autoflow/NativeBridge-Debug-Application
```

#### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

#### Step 3: Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

#### Step 4: Build for Simulator

Open the project in Xcode:
```bash
open ios/NativeBridgeDebugApplication.xcworkspace
```

Or build from command line:

```bash
# For specific simulator (e.g., iPhone 14 Pro)
npx react-native run-ios --simulator="iPhone 14 Pro"

# Build only (without running)
xcodebuild -workspace ios/NativeBridgeDebugApplication.xcworkspace \
  -scheme NativeBridgeDebugApplication \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath ios/build
```

#### Step 5: Locate the .app Directory

The `.app` directory will be at:
```
ios/build/Build/Products/Debug-iphonesimulator/NativeBridgeDebugApplication.app
```

#### Using the .app with Appium/Testing

To use this build with Appium or other testing frameworks:

```javascript
// Appium capabilities example
{
  platformName: 'iOS',
  platformVersion: '16.0',
  deviceName: 'iPhone 14 Pro',
  app: '/path/to/NativeBridgeDebugApplication.app',
  automationName: 'XCUITest'
}
```

---

### .ipa for iOS Physical Devices

An `.ipa` (iOS App Store Package) is required for installing on physical iOS devices.

#### Step 1: Configure Code Signing in Xcode

1. Open the project in Xcode:
   ```bash
   open ios/NativeBridgeDebugApplication.xcworkspace
   ```

2. Select the project in the navigator
3. Select your app target
4. Go to "Signing & Capabilities" tab
5. Select your Team (requires Apple Developer account)
6. Ensure "Automatically manage signing" is checked
7. Select a valid provisioning profile

#### Step 2: Build Archive in Xcode

**Using Xcode GUI:**

1. In Xcode, select **Product > Archive**
2. Wait for the archive process to complete
3. The Organizer window will open automatically

**Using Command Line:**

```bash
# Clean previous builds
xcodebuild clean -workspace ios/NativeBridgeDebugApplication.xcworkspace \
  -scheme NativeBridgeDebugApplication

# Create archive
xcodebuild archive \
  -workspace ios/NativeBridgeDebugApplication.xcworkspace \
  -scheme NativeBridgeDebugApplication \
  -configuration Release \
  -archivePath ios/build/NativeBridgeDebugApplication.xcarchive
```

#### Step 3: Export the .ipa

**Using Xcode Organizer:**

1. In the Organizer window, select your archive
2. Click "Distribute App"
3. Select distribution method:
   - **Development**: For testing on registered devices
   - **Ad Hoc**: For distribution outside the App Store to registered devices
   - **Enterprise**: For enterprise distribution (requires Enterprise account)
   - **App Store**: For App Store submission
4. Follow the prompts and export

**Using Command Line:**

First, create an export options plist file `exportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <!-- Options: development, ad-hoc, enterprise, app-store -->
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <true/>
</dict>
</plist>
```

Then export:

```bash
xcodebuild -exportArchive \
  -archivePath ios/build/NativeBridgeDebugApplication.xcarchive \
  -exportPath ios/build \
  -exportOptionsPlist exportOptions.plist
```

#### Step 4: Locate the .ipa

The `.ipa` file will be at:
```
ios/build/NativeBridgeDebugApplication.ipa
```

#### Step 5: Install on Physical Device

**Method 1: Using Xcode**
1. Connect your device
2. Open Xcode
3. Go to **Window > Devices and Simulators**
4. Drag and drop the `.ipa` file onto your device

**Method 2: Using Command Line**
```bash
# Install using ios-deploy
npm install -g ios-deploy
ios-deploy --bundle ios/build/NativeBridgeDebugApplication.ipa
```

**Method 3: Using Apple Configurator 2**
1. Download Apple Configurator 2 from the Mac App Store
2. Connect your device
3. Drag the `.ipa` file onto your device in Apple Configurator

---

## Troubleshooting

### Android Issues

**Gradle Build Fails**
```bash
# Clean the build
cd android
./gradlew clean

# Check Java version (should be 11 or higher)
java -version

# Rebuild
./gradlew assembleRelease --stacktrace
```

**Signing Configuration Issues**
- Verify keystore file path in `gradle.properties`
- Ensure passwords are correct
- Check that the keystore file exists

**Out of Memory Errors**
Edit `android/gradle.properties` and add:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

### iOS Issues

**CocoaPods Installation Fails**
```bash
cd ios
pod deintegrate
pod cache clean --all
pod install
```

**Code Signing Errors**
- Ensure you're logged into Xcode with your Apple ID
- Check that your provisioning profile is valid
- Verify your bundle identifier matches your App ID
- Update provisioning profiles: `fastlane sigh` (if using Fastlane)

**Build Fails for Physical Device**
- Ensure your device is registered in your Apple Developer account
- Check that the deployment target in Xcode matches your device's iOS version
- Clean build folder: **Product > Clean Build Folder** in Xcode

**Archive Not Showing in Organizer**
- Ensure you selected "Any iOS Device (arm64)" as the build target (not a simulator)
- Check build configuration is set to "Release"
- Verify code signing settings are correct

---

## Quick Reference Commands

### Android
```bash
# Production APK
cd android && ./gradlew assembleRelease

# Debug APK
cd android && ./gradlew assembleDebug

# Clean build
cd android && ./gradlew clean
```

### iOS Simulator
```bash
# Install pods
cd ios && pod install && cd ..

# Run on simulator
npx react-native run-ios --simulator="iPhone 14 Pro"

# Build .app
xcodebuild -workspace ios/NativeBridgeDebugApplication.xcworkspace \
  -scheme NativeBridgeDebugApplication \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath ios/build
```

### iOS Physical Device
```bash
# Archive
xcodebuild archive \
  -workspace ios/NativeBridgeDebugApplication.xcworkspace \
  -scheme NativeBridgeDebugApplication \
  -configuration Release \
  -archivePath ios/build/NativeBridgeDebugApplication.xcarchive

# Export IPA
xcodebuild -exportArchive \
  -archivePath ios/build/NativeBridgeDebugApplication.xcarchive \
  -exportPath ios/build \
  -exportOptionsPlist exportOptions.plist
```

---

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Developer Guide](https://developer.android.com/studio/build)
- [iOS Developer Guide](https://developer.apple.com/documentation/xcode)
- [Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android)
- [Publishing to Apple App Store](https://reactnative.dev/docs/publishing-to-app-store)

---

**Last Updated:** 2025-11-27
