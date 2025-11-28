# Android Configuration Files

This document contains all the necessary Android configuration files for the NativeBridge app.

## Directory Structure

```
NativeBridge/
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/
│   │   │       │       └── nativebridge/
│   │   │       │           └── io/
│   │   │       │               ├── MainActivity.kt
│   │   │       │               └── MainApplication.kt
│   │   │       ├── res/
│   │   │       │   ├── values/
│   │   │       │   │   └── strings.xml
│   │   │       │   └── xml/
│   │   │       │       └── network_security_config.xml
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── gradle.properties
│   └── build.gradle
```

---

## 1. MainActivity.kt

**Location:** `android/app/src/main/java/com/nativebridge/io/MainActivity.kt`

```kotlin
package com.nativebridge.io

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NativeBridge"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

**Key Points:**
- Package name: `com.nativebridge.io`
- Main component name: `NativeBridge` (must match app name in package.json)
- Uses React Native 0.74.7 New Architecture delegates

---

## 2. MainApplication.kt

**Location:** `android/app/src/main/java/com/nativebridge/io/MainApplication.kt`

```kotlin
package com.nativebridge.io

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
```

**Key Points:**
- Package name: `com.nativebridge.io`
- Supports New Architecture (React Native 0.74.7)
- Auto-links all React Native packages
- Hermes enabled by default

---

## 3. AndroidManifest.xml

**Location:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Biometric Permissions -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />

    <!-- Camera Permission (for QR scanning) -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- Storage Permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <!-- Network Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Location Permissions (for permission testing) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Contacts Permission (for permission testing) -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- Vibration Permission -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="true"
      android:networkSecurityConfig="@xml/network_security_config">

      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:screenOrientation="portrait"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>

</manifest>
```

**Key Permissions:**
- `USE_BIOMETRIC` and `USE_FINGERPRINT`: Required for biometric authentication
- `CAMERA`: For QR code scanning
- `READ/WRITE_EXTERNAL_STORAGE`: For file operations
- `INTERNET` and `ACCESS_NETWORK_STATE`: For network operations
- `ACCESS_FINE_LOCATION`: For location permission testing
- `READ_CONTACTS`: For contacts permission testing
- `VIBRATE`: For vibration feature

**Key Application Settings:**
- `usesCleartextTraffic="true"`: Allows HTTP connections (for testing)
- `networkSecurityConfig`: References custom network security config
- `screenOrientation="portrait"`: Locks app to portrait mode
- `android:exported="true"`: Required for launcher activity (Android 12+)

---

## 4. build.gradle (App Level)

**Location:** `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

react {
    /* Folders */
    root = file("../")
    reactNativeDir = file("../node_modules/react-native")
    codegenDir = file("../node_modules/@react-native/codegen")
    cliFile = file("../node_modules/react-native/cli.js")

    /* Variants */
    debuggableVariants = ["liteDebug", "prodDebug"]

    /* Bundling */
    nodeExecutableAndArgs = ["node"]

    bundleCommand = "ram-bundle"

    bundleConfig = file(../rn-cli.config.js)

    bundleAssetName = "MyApplication.android.bundle"

    entryFile = file("../js/MyApplication.android.js")

    extraPackagerArgs = []

    /* Hermes Commands */
    hermesCommand = "$rootDir/my-custom-hermesc/bin/hermesc"

    hermesFlags = ["-O", "-output-source-map"]
}

/**
 * Set this to true to Run Proguard on Release builds to minify the Java bytecode.
 */
def enableProguardInReleaseBuilds = false

/**
 * The preferred build flavor of JavaScriptCore (JSC)
 */
def jscFlavor = 'org.webkit:android-jsc:+'

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.nativebridge.io"

    defaultConfig {
        applicationId "com.nativebridge.io"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")
    implementation("com.facebook.react:flipper-integration")

    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

**Key Configuration:**
- `namespace`: `com.nativebridge.io`
- `applicationId`: `com.nativebridge.io` (must be unique on device)
- `versionCode`: 1 (increment for each release)
- `versionName`: "1.0.0"
- Hermes engine enabled by default
- Debug signing config included for testing

---

## 5. strings.xml

**Location:** `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">NativeBridge</string>
</resources>
```

**Purpose:** Defines the app name shown in launcher and system UI.

---

## 6. network_security_config.xml

**Location:** `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext traffic for all domains (development/testing only) -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>

    <!-- For production, you should specify specific domains instead -->
    <!--
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">example.com</domain>
    </domain-config>
    -->
</network-security-config>
```

**Purpose:**
- Allows HTTP connections for testing
- For production, restrict to specific domains only
- Trusts both system and user certificates

**Security Note:** In production apps, you should only allow HTTPS and specify explicit domains.

---

## 7. gradle.properties (Project Level)

**Location:** `android/gradle.properties`

```properties
# Project-wide Gradle settings.

# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.

# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html

# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
# Default value: -Xmx512m -XX:MaxMetaspaceSize=256m
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true

# Automatically convert third-party libraries to use AndroidX
android.enableJetifier=true

# Version of flipper SDK to use with React Native
FLIPPER_VERSION=0.182.0

# Use this property to specify which architecture you want to build.
# You can also override it from the CLI using
# ./gradlew <task> -PreactNativeArchitectures=x86_64
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# Use this property to enable support to the new architecture.
# This will allow you to use TurboModules and the Fabric render in
# your application. You should enable this flag either if you want
# to write custom TurboModules/Fabric components OR use libraries that
# are providing them.
newArchEnabled=false

# Use this property to enable or disable the Hermes JS engine.
# If set to false, you will be using JSC instead.
hermesEnabled=true
```

**Key Settings:**
- `android.useAndroidX=true`: Uses AndroidX libraries
- `newArchEnabled=false`: Disable New Architecture (can enable later)
- `hermesEnabled=true`: Use Hermes JavaScript engine
- `reactNativeArchitectures`: Build for all architectures (arm, x86)

---

## 8. build.gradle (Project Level)

**Location:** `android/build.gradle`

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.4")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

allprojects {
    repositories {
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url("$rootDir/../node_modules/react-native/android")
        }
        maven {
            // Android JSC is installed from npm
            url("$rootDir/../node_modules/jsc-android/dist")
        }

        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
```

**Key Versions:**
- `minSdkVersion = 23`: Android 6.0+ (required for biometric support)
- `compileSdkVersion = 34`: Android 14
- `targetSdkVersion = 34`: Android 14
- `kotlinVersion = "1.9.22"`: Latest Kotlin version
- Android Gradle Plugin: 8.1.4

**Repositories:**
- Google Maven (for AndroidX)
- Maven Central
- JitPack (for some React Native libraries)
- Local React Native repository from node_modules

---

## 9. index.js (Root Entry Point)

**Location:** `index.js` (project root)

```javascript
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

**Purpose:** Entry point for React Native app. Registers the App component.

---

## 10. app.json

**Location:** `app.json` (project root)

```json
{
  "name": "NativeBridge",
  "displayName": "NativeBridge"
}
```

**Purpose:** Defines the app name for React Native.

---

## Summary of Required Changes from NativeBridgeApp

When creating NativeBridge from NativeBridgeApp, update these values:

| File | Old Value | New Value |
|------|-----------|-----------|
| MainActivity.kt | `package com.nativebridgeapp` | `package com.nativebridge.io` |
| MainActivity.kt | `getMainComponentName() = "NativeBridgeApp"` | `getMainComponentName() = "NativeBridge"` |
| MainApplication.kt | `package com.nativebridgeapp` | `package com.nativebridge.io` |
| AndroidManifest.xml | `package="com.nativebridgeapp"` | Package attribute removed (uses namespace) |
| build.gradle (app) | `namespace "com.nativebridgeapp"` | `namespace "com.nativebridge.io"` |
| build.gradle (app) | `applicationId "com.nativebridgeapp"` | `applicationId "com.nativebridge.io"` |
| strings.xml | `<string name="app_name">NativeBridgeApp</string>` | `<string name="app_name">NativeBridge</string>` |
| app.json | `"name": "NativeBridgeApp"` | `"name": "NativeBridge"` |
| package.json | `"name": "NativeBridgeApp"` | `"name": "NativeBridge"` |

---

## Verification Checklist

After setup, verify:

- [ ] Package name is `com.nativebridge.io` in all files
- [ ] App name is "NativeBridge" in strings.xml and app.json
- [ ] All biometric permissions are in AndroidManifest.xml
- [ ] MainActivity.kt and MainApplication.kt are in correct directory structure
- [ ] Gradle build completes without errors
- [ ] App installs and launches successfully
- [ ] Biometric authentication prompt appears on launch

---

## Troubleshooting

**Error: Package name mismatch**
- Ensure all files use `com.nativebridge.io` consistently
- Check that Java/Kotlin files are in correct directory: `com/nativebridge/io/`

**Error: Main component not found**
- Verify `getMainComponentName()` returns "NativeBridge"
- Check app.json has correct name
- Ensure App.tsx exports default component

**Error: Biometric permission denied**
- Check AndroidManifest.xml has `USE_BIOMETRIC` and `USE_FINGERPRINT`
- Verify minSdkVersion is at least 23 (Android 6.0)
- Ensure device has biometric sensor and fingerprint enrolled

**Error: Gradle build failed**
- Clean gradle: `./gradlew clean`
- Delete `.gradle` folder in android directory
- Verify Java 17 is being used: `java -version`
- Check build.gradle versions match React Native 0.74.7 requirements
