# CI/CD Troubleshooting Guide

Common issues and solutions for the GitHub Actions CI/CD pipeline.

## 🔥 Common Build Errors

### 1. Kotlin Compilation Error

**Error:**
```
Execution failed for task ':gradle-plugin:react-native-gradle-plugin:compileKotlin'
> Compilation error
```

**Cause:** Gradle/Kotlin version incompatibility or corrupted cache

**Solutions:**

#### Solution 1: Updated Workflow (Already Applied)
The workflow now includes:
- ✅ Proper Gradle setup with caching
- ✅ Gradle wrapper validation
- ✅ Clean build before assembly
- ✅ Detailed logging with `--info` flag

#### Solution 2: Clear GitHub Actions Cache
1. Go to repository **Actions** tab
2. Click **Caches** in left sidebar
3. Delete all caches
4. Re-run the workflow

#### Solution 3: Local Test First
```bash
# Test locally before pushing
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace
```

### 2. Keystore Not Found

**Error:**
```
Keystore file not found
```

**Solution:**
- Check GitHub Secrets are configured
- OR ensure local keystore exists at `android/app/nativebridge-release.keystore`
- See [SECRETS_SETUP.md](SECRETS_SETUP.md)

### 3. Version Already Exists

**Error:**
```
Tag v1.0.0 already exists
```

**Solution:**
```bash
# Delete the tag locally and remotely
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Use a new version
./scripts/release.sh 1.0.1
```

### 4. iOS Build Fails

**Error:**
```
CocoaPods installation failed
```

**Solution:**
The workflow will automatically:
- Install CocoaPods
- Run `pod install`
- Retry on failure

If persists, check `ios/Podfile` for syntax errors

### 5. No Changes to Commit

**Error:**
```
nothing to commit, working tree clean
```

**Solution:**
You're trying to release the same version that's already set:
```bash
# Check current version
grep '"version"' package.json

# Use a different version
./scripts/release.sh 1.0.1
```

## 🛠️ Debugging Steps

### Step 1: Check Workflow Logs

1. Go to **Actions** tab
2. Click on failed workflow
3. Expand failed job
4. Review error messages

### Step 2: Test Build Locally

```bash
# Android
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace

# Should complete without errors
```

### Step 3: Verify Dependencies

```bash
# Check Node version
node --version  # Should be 18+

# Check Java version
java --version  # Should be 17+

# Check Gradle version
cd android && ./gradlew --version
```

### Step 4: Check GitHub Secrets

If using production keystore:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify all 4 secrets exist:
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

### Step 5: Clean and Rebuild

```bash
# Clean everything
cd android
./gradlew clean
rm -rf .gradle
rm -rf build
rm -rf app/build

# Rebuild
./gradlew assembleRelease
```

## 🔄 Retry Failed Build

### Option 1: Re-run from GitHub UI

1. Go to **Actions** → Failed workflow
2. Click **Re-run jobs** → **Re-run failed jobs**

### Option 2: Push a New Commit

```bash
# Make a small change
git commit --allow-empty -m "chore: trigger CI rebuild"
git push
```

### Option 3: Delete and Recreate Tag

```bash
# Delete tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Push again (this triggers new build)
git push origin v1.0.0
```

## 📊 Build Performance

### Expected Build Times

- **Android:** 5-8 minutes
- **iOS:** 10-15 minutes
- **Total:** ~15-20 minutes

### If Build Takes Too Long

1. Check for network issues
2. Review `--info` logs for stuck tasks
3. Cancel and retry

## 🔍 Detailed Logs

The workflow now includes `--info` flag for detailed logging:

```yaml
./gradlew assembleRelease --stacktrace --info
```

This shows:
- All Gradle tasks executed
- Dependency resolution
- Compilation progress
- Cache hits/misses

## ⚙️ Workflow Configuration

### Current Setup

```yaml
env:
  NODE_VERSION: '18'
  JAVA_VERSION: '17'
```

### Gradle Actions

```yaml
- uses: gradle/actions/setup-gradle@v3
  with:
    cache-read-only: false
```

### Gradle Wrapper Validation

```yaml
- uses: gradle/wrapper-validation-action@v2
```

## 🚨 Emergency Fixes

### Quick Fix: Skip Failing Build

If you need artifacts urgently and build is failing:

```bash
# Build locally
cd android
./gradlew assembleRelease

# APK at: android/app/build/outputs/apk/release/app-release.apk

# Upload manually to GitHub Releases
```

### Reset Everything

```bash
# Delete all local build artifacts
cd android
./gradlew clean
rm -rf .gradle build */build

# Delete node_modules
cd ..
rm -rf node_modules
npm install

# Rebuild
cd android
./gradlew assembleRelease
```

## 📞 Getting More Help

1. Check workflow logs in **Actions** tab
2. Search for error message in:
   - React Native GitHub Issues
   - Stack Overflow
   - Gradle Documentation
3. Review [CICD_GUIDE.md](../CICD_GUIDE.md)
4. Check [BUILD_GUIDE.md](../BUILD_GUIDE.md) for manual build steps

## 🔗 Useful Links

- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Gradle Build Scans](https://scans.gradle.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android Build Troubleshooting](https://developer.android.com/studio/build/troubleshoot)

---

**Last Updated:** 2025-11-29
