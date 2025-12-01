# iOS Simulator Build - Testing Guide

This guide explains how to test the iOS simulator build workflow before integrating it into the main release pipeline.

## 📋 Overview

**Workflow File:** [`.github/workflows/ios-simulator-build.yml`](workflows/ios-simulator-build.yml)

**Purpose:** Build iOS .app for simulators and create a zip archive for easy distribution

**Trigger Methods:**
1. **Manual trigger** via GitHub Actions UI (recommended for testing)
2. **Push to test branch** `test-ios-build`

---

## 🚀 Testing Methods

### Method 1: Manual Workflow Dispatch (Recommended)

This is the easiest way to test the iOS build.

#### Steps:

1. **Go to GitHub Actions**
   - Navigate to your repository on GitHub
   - Click **Actions** tab
   - Find **"iOS Simulator Build (Test)"** in the left sidebar

2. **Run workflow**
   - Click **"Run workflow"** button (top right)
   - Select branch: `main` (or your current branch)
   - Enter version: `1.0.0` (or any version you want)
   - Click **"Run workflow"**

3. **Monitor progress**
   - Click on the running workflow to see live logs
   - Wait for completion (~5-10 minutes)

4. **Download artifact**
   - Once complete, scroll to **Artifacts** section
   - Download `NativeBridge-iOS-Simulator-v1.0.0`
   - Extract the zip file

5. **Test on simulator**
   ```bash
   # Extract the zip
   unzip NativeBridge-iOS-v1.0.0.app.zip

   # Start a simulator
   open -a Simulator

   # Install to simulator
   xcrun simctl install booted NativeBridgeDebugApplication.app

   # Launch the app
   xcrun simctl launch booted com.nativebridge.debugapp
   ```

---

### Method 2: Push to Test Branch

Create a test branch to trigger the workflow automatically.

#### Steps:

1. **Create test branch**
   ```bash
   git checkout -b test-ios-build
   ```

2. **Make a small change** (optional)
   ```bash
   # Update version in package.json or make any change
   echo "# iOS Test" >> README.md
   git add .
   git commit -m "test: trigger iOS build"
   ```

3. **Push to GitHub**
   ```bash
   git push origin test-ios-build
   ```

4. **Monitor in Actions tab**
   - Go to Actions tab
   - Workflow should start automatically
   - Monitor progress

5. **Download and test** (same as Method 1, steps 4-5)

---

## 🔍 What the Workflow Does

### Step-by-Step Process

1. **Checkout Code**
   - Clones the repository

2. **Set Version**
   - Uses input version or defaults to 1.0.0

3. **Setup Node.js**
   - Installs Node.js 18
   - Caches npm dependencies

4. **Install Dependencies**
   - Runs `npm ci`
   - Installs CocoaPods dependencies (`pod install`)

5. **Setup Xcode**
   - Selects latest Xcode
   - Verifies Xcode version

6. **Build iOS App**
   - Uses `xcodebuild` to build for simulator
   - Target: iPhone 15 (latest iOS)
   - Configuration: Release
   - SDK: iphonesimulator
   - Sets version from input

7. **Locate .app Directory**
   - Finds built .app in derived data
   - Verifies it exists
   - Gets size information

8. **Create Zip Archive**
   - Creates `NativeBridge-iOS-v{VERSION}.app.zip`
   - Stores in `release-artifacts/` directory
   - Preserves .app directory structure

9. **Upload Artifact**
   - Uploads to GitHub Actions
   - Retention: 90 days
   - Name: `NativeBridge-iOS-Simulator-v{VERSION}`

10. **Build Summary**
    - Shows build info
    - Provides installation instructions

---

## ✅ Expected Results

### Successful Build

When the workflow completes successfully, you should see:

**In GitHub Actions Summary:**
```
### iOS Simulator Build Complete ✅

**Version:** 1.0.0
**App Name:** NativeBridgeDebugApplication.app
**App Size:** ~50M
**Zip Size:** ~20M
**Archive:** NativeBridge-iOS-v1.0.0.app.zip

### 📝 Installation Instructions

# 1. Download and extract the zip
unzip NativeBridge-iOS-v1.0.0.app.zip

# 2. Install to running simulator
xcrun simctl install booted NativeBridgeDebugApplication.app

# 3. Launch the app
xcrun simctl launch booted <bundle-identifier>
```

**Artifact Available:**
- Name: `NativeBridge-iOS-Simulator-v1.0.0`
- Contains: `NativeBridge-iOS-v1.0.0.app.zip`
- Size: ~20MB (compressed)

---

## 🧪 Testing the Built App

### Prerequisites

- macOS computer
- Xcode installed
- iOS Simulator

### Installation Steps

1. **Download artifact** from GitHub Actions

2. **Extract the zip**
   ```bash
   unzip NativeBridge-iOS-v1.0.0.app.zip
   ```

3. **Start iOS Simulator**
   ```bash
   # Open Simulator app
   open -a Simulator

   # Or boot specific device
   xcrun simctl boot "iPhone 15"
   ```

4. **Install app**
   ```bash
   xcrun simctl install booted NativeBridgeDebugApplication.app
   ```

5. **Get bundle identifier**
   ```bash
   # Read from Info.plist
   /usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" \
     NativeBridgeDebugApplication.app/Info.plist
   ```

6. **Launch app**
   ```bash
   # Replace with actual bundle ID
   xcrun simctl launch booted com.nativebridge.debugapp
   ```

7. **Test the app**
   - Verify all features work
   - Test biometric functionality
   - Check UI components
   - Test permissions, storage, etc.

---

## 🐛 Troubleshooting

### Issue: Workflow fails at "Install CocoaPods dependencies"

**Error:**
```
[!] CocoaPods could not find compatible versions for pod "..."
```

**Solution:**
1. Update pod versions in `ios/Podfile`
2. Run locally: `cd ios && pod update`
3. Commit updated `Podfile.lock`
4. Push changes and retry

---

### Issue: "No workspace or project found"

**Error:**
```
❌ Error: No workspace or project found
```

**Solution:**
- Verify `ios/NativeBridgeDebugApplication.xcworkspace` exists
- Or verify `ios/NativeBridgeDebugApplication.xcodeproj` exists
- Run `pod install` locally if workspace is missing

---

### Issue: ".app directory not found"

**Error:**
```
❌ Error: .app directory not found
```

**Solution:**
1. Check Xcode build logs in Actions
2. Verify scheme name is correct: `NativeBridgeDebugApplication`
3. Check for build errors in logs
4. Ensure all dependencies are installed

---

### Issue: Zip creation fails

**Error:**
```
❌ Failed to create zip
```

**Solution:**
- Check disk space in runner
- Verify .app directory exists
- Check permissions

---

### Issue: App won't install on simulator

**Error:**
```
An error was encountered processing the command (domain=IXUserPresentableErrorDomain, code=1)
```

**Solution:**
1. **Check architecture**
   ```bash
   # Verify .app is built for simulator (x86_64 or arm64)
   lipo -info NativeBridgeDebugApplication.app/NativeBridgeDebugApplication
   ```

2. **Reinstall**
   ```bash
   # Uninstall first
   xcrun simctl uninstall booted com.nativebridge.debugapp

   # Then install again
   xcrun simctl install booted NativeBridgeDebugApplication.app
   ```

3. **Try different simulator**
   ```bash
   # List available simulators
   xcrun simctl list devices

   # Boot different device
   xcrun simctl boot "iPhone 14"
   ```

---

## 📊 Build Metrics

### Expected Build Time

- **Total workflow time:** 5-10 minutes
  - Checkout & setup: ~1 min
  - npm install: ~1 min
  - pod install: ~2-3 min
  - Xcode build: ~2-4 min
  - Zip & upload: ~30 sec

### Expected Sizes

- **.app directory:** ~50-80 MB (uncompressed)
- **.app.zip file:** ~15-25 MB (compressed)

### Runner Resources

- **OS:** macOS latest
- **Xcode:** Latest stable
- **Node.js:** 18
- **Storage:** ~500 MB required

---

## 🔄 Next Steps After Testing

Once you've verified the iOS build works:

1. **Review build output**
   - Check artifact quality
   - Verify app functionality
   - Test on multiple simulators

2. **Integration decision**
   - If successful → Integrate into main release workflow
   - If issues → Debug and iterate

3. **Main workflow integration**
   - Merge iOS build steps into `release-build.yml`
   - Add iOS artifact to GitHub Releases
   - Update release notes template

4. **Documentation**
   - Update BUILD_GUIDE.md
   - Update QUICKSTART_CICD.md
   - Add iOS installation instructions

---

## 📝 Workflow Customization

### Change iOS Version

Edit workflow file to target specific iOS version:

```yaml
-destination 'platform=iOS Simulator,name=iPhone 15,OS=17.0'
```

### Change Build Configuration

Switch to Debug build:

```yaml
-configuration Debug  # Instead of Release
```

### Add Multiple Architectures

Build for both Intel and Apple Silicon simulators:

```yaml
xcodebuild \
  ... \
  -arch x86_64 -arch arm64 \
  build
```

---

## 🎯 Success Criteria

The iOS build is ready for integration when:

- ✅ Workflow completes without errors
- ✅ .app.zip artifact is created
- ✅ Zip file is ~15-25 MB
- ✅ .app installs on simulator successfully
- ✅ App launches and runs correctly
- ✅ All features work as expected
- ✅ Build time is reasonable (<10 min)

---

## 📚 Related Documentation

- **Main Release Workflow:** [release-build.yml](workflows/release-build.yml)
- **Build Guide:** [BUILD_GUIDE.md](../BUILD_GUIDE.md)
- **Quick Start:** [QUICKSTART_CICD.md](../QUICKSTART_CICD.md)

---

## 🆘 Support

**Workflow Issues:**
- Check GitHub Actions logs
- Review this troubleshooting guide
- Check Xcode version compatibility

**iOS Build Issues:**
- Review BUILD_GUIDE.md
- Check CocoaPods documentation
- Verify Xcode project settings

**Integration Help:**
- See NATIVEBRIDGE_CICD.md
- Review main workflow structure

---

**Last Updated:** 2025-11-29
**Workflow File:** `.github/workflows/ios-simulator-build.yml`
