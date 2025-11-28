# CI/CD Quick Start Guide

**Get your builds automated in 5 minutes!** ⚡

## 🚀 TL;DR

### ⚡ Automated Way (Recommended)

```bash
# One command does everything!
./scripts/release.sh 1.0.0
# OR
npm run release 1.0.0

# Automatically:
# ✅ Updates versions in package.json and Android
# ✅ Runs tests
# ✅ Commits changes
# ✅ Creates and pushes tag
# ✅ Triggers CI/CD pipeline

# Wait ~15 minutes, then download from GitHub Releases
```

### 📝 Manual Way

```bash
# 1. Push your code to GitHub
git push origin main

# 2. Create and push a release tag
git tag v1.0.0
git push origin v1.0.0

# 3. Wait ~15 minutes

# 4. Download builds from GitHub Releases
# https://github.com/YOUR-USERNAME/YOUR-REPO/releases/tag/v1.0.0
```

## ✅ Prerequisites

- [x] Code pushed to GitHub repository
- [x] GitHub Actions enabled (default for all repos)
- [x] (Optional) GitHub Secrets configured for production keystore

## 📋 Step-by-Step

### Step 1: Push Your Code

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for release"
git push origin main
```

### Step 2: Create a Release Tag

```bash
# Create a tag (must start with 'v')
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

**Tag naming:**
- ✅ `v1.0.0` - Production release
- ✅ `v2.0.0-beta` - Beta release
- ❌ `1.0.0` - Won't work (missing 'v')

### Step 3: Monitor the Build

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You'll see "Release Build" running
4. Click on it to watch progress

**Build time:** ~15-20 minutes

### Step 4: Download Your Builds

Once complete:

1. Go to **Releases** tab
2. Click on your version (e.g., `v1.0.0`)
3. Download from **Assets**:
   - `NativeBridge-v1.0.0.apk` (Android)
   - `NativeBridge-iOS-v1.0.0.app.zip` (iOS)

## 🎉 That's It!

Your builds are ready to use!

### Install Android APK

```bash
adb install NativeBridge-v1.0.0.apk
```

### Install iOS .app

```bash
# Extract
unzip NativeBridge-iOS-v1.0.0.app.zip

# Install to simulator
xcrun simctl install booted NativeBridgeDebugApplication.app
```

## ⚙️ Optional: Production Keystore

For production builds with your own keystore:

### Quick Setup

1. **Generate production keystore** (or use existing):
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore production.keystore \
     -alias production-key \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Encode to base64**:
   ```bash
   # macOS
   base64 -i production.keystore | pbcopy

   # Linux
   base64 -w 0 production.keystore | xclip -selection clipboard
   ```

3. **Add to GitHub Secrets**:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add these 4 secrets:
     - `ANDROID_KEYSTORE_BASE64` (paste base64 string)
     - `ANDROID_KEYSTORE_PASSWORD` (your password)
     - `ANDROID_KEY_ALIAS` (e.g., `production-key`)
     - `ANDROID_KEY_PASSWORD` (your password)

4. **Next build will use production keystore!**

**Detailed guide:** [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md)

## 🔍 What Gets Built?

| Platform | Output | Size | Compatible With |
|----------|--------|------|-----------------|
| Android | `.apk` | ~53MB | Emulators + Real Devices |
| iOS | `.app.zip` | Varies | Simulators |

## 📱 What's Included?

Both builds include:
- ✅ All NativeBridge features
- ✅ UI testing components
- ✅ Network operations
- ✅ Performance testing
- ✅ Biometric authentication
- ✅ QR code scanning
- ✅ File operations
- ✅ Storage testing

## 🐛 Common Issues

### Issue: "Workflow doesn't trigger"

**Fix:** Tag must start with 'v'
```bash
git tag v1.0.0  # ✅ Correct
git tag 1.0.0   # ❌ Wrong
```

### Issue: "Android build fails"

**Fix:** Check keystore configuration
- Pipeline uses dev keystore by default
- Or configure GitHub Secrets for production

### Issue: "iOS build fails"

**Fix:** Check iOS dependencies
- CocoaPods should install automatically
- If fails, may need to update pod specs

### Issue: "Can't find releases"

**Fix:** Check build status
1. Go to **Actions** tab
2. Wait for green checkmark
3. Then check **Releases** tab

## 📚 Learn More

**Complete Documentation:**
- [CICD_GUIDE.md](CICD_GUIDE.md) - Full CI/CD guide
- [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md) - Secrets configuration
- [BUILD_GUIDE.md](BUILD_GUIDE.md) - Manual builds
- [SECURITY.md](SECURITY.md) - Security practices

**Workflow File:**
- [.github/workflows/release-build.yml](.github/workflows/release-build.yml)

## 💡 Pro Tips

1. **Test locally first:**
   ```bash
   # Android
   cd android && ./gradlew assembleRelease

   # iOS (macOS only)
   cd ios && xcodebuild -workspace ...
   ```

2. **Use semantic versioning:**
   - `v1.0.0` → Major release
   - `v1.1.0` → New features
   - `v1.0.1` → Bug fixes

3. **Mark pre-releases:**
   - `v1.0.0-beta` → Beta version
   - `v1.0.0-alpha.1` → Alpha version

4. **Create from GitHub UI:**
   - **Releases** → **Create a new release**
   - Type tag name (e.g., `v1.0.0`)
   - Click "Create new tag"
   - Publish release
   - Pipeline triggers automatically!

## 🎯 Next Steps

1. ✅ Try creating your first release tag
2. ✅ Monitor the build in Actions
3. ✅ Download and test the artifacts
4. ✅ (Optional) Configure production keystore
5. ✅ Set up automated testing in CI/CD
6. ✅ Add quality checks (linting, tests)

## 🆘 Need Help?

- **Build logs:** Check Actions tab
- **Full guide:** [CICD_GUIDE.md](CICD_GUIDE.md)
- **Secrets setup:** [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md)
- **Manual builds:** [BUILD_GUIDE.md](BUILD_GUIDE.md)

---

**Ready to automate your builds?** Create your first tag now! 🚀

```bash
git tag v1.0.0 && git push origin v1.0.0
```
