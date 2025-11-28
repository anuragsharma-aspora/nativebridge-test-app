# GitHub Secrets Setup Guide

This guide shows you how to configure GitHub Secrets for the CI/CD pipeline.

## 🔐 Why Use GitHub Secrets?

GitHub Secrets allow you to:
- ✅ Store sensitive data securely (passwords, keystores)
- ✅ Keep credentials out of code repository
- ✅ Use production keystores in CI/CD
- ✅ Protect your app signing keys

## 📋 Required Secrets

For production Android builds, configure these secrets:

| Secret Name | Required | Description |
|-------------|----------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Optional* | Base64-encoded keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Optional* | Keystore password |
| `ANDROID_KEY_ALIAS` | Optional* | Key alias in keystore |
| `ANDROID_KEY_PASSWORD` | Optional* | Key password |

\* If not provided, the pipeline will use the development keystore from the repository.

## 🔧 Step-by-Step Setup

### Step 1: Access Repository Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Prepare Your Keystore

#### Option A: Use Existing Production Keystore

If you have a production keystore:

```bash
# Navigate to your keystore location
cd /path/to/your/keystore

# Encode to base64 (macOS)
base64 -i your-production.keystore | pbcopy

# Or on Linux
base64 -w 0 your-production.keystore | xclip -selection clipboard

# The base64 string is now in your clipboard
```

#### Option B: Generate New Production Keystore

```bash
# Navigate to android app directory
cd android/app

# Generate new production keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore nativebridge-production.keystore \
  -alias nativebridge-production \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Follow prompts and remember your passwords!
# Store passwords in a password manager immediately!

# Encode to base64
base64 -i nativebridge-production.keystore | pbcopy
```

### Step 3: Add Secrets to GitHub

#### 1. ANDROID_KEYSTORE_BASE64

**Name:** `ANDROID_KEYSTORE_BASE64`

**Value:** Paste the base64-encoded keystore string

**Steps:**
1. Click **New repository secret**
2. Name: `ANDROID_KEYSTORE_BASE64`
3. Secret: Paste the base64 string (it will be very long)
4. Click **Add secret**

#### 2. ANDROID_KEYSTORE_PASSWORD

**Name:** `ANDROID_KEYSTORE_PASSWORD`

**Value:** Your keystore password

**Steps:**
1. Click **New repository secret**
2. Name: `ANDROID_KEYSTORE_PASSWORD`
3. Secret: Enter your keystore password
4. Click **Add secret**

#### 3. ANDROID_KEY_ALIAS

**Name:** `ANDROID_KEY_ALIAS`

**Value:** Your key alias (e.g., `nativebridge-production`)

**Steps:**
1. Click **New repository secret**
2. Name: `ANDROID_KEY_ALIAS`
3. Secret: Enter your key alias
4. Click **Add secret**

#### 4. ANDROID_KEY_PASSWORD

**Name:** `ANDROID_KEY_PASSWORD`

**Value:** Your key password

**Steps:**
1. Click **New repository secret**
2. Name: `ANDROID_KEY_PASSWORD`
3. Secret: Enter your key password
4. Click **Add secret**

### Step 4: Verify Secrets

After adding all secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all 4 secrets listed
3. Secrets will show as `***` (hidden)
4. You cannot view secret values after creation (only update/delete)

## ✅ Testing Your Secrets

### Trigger a Test Build

```bash
# Create a test tag
git tag v0.0.1-test

# Push the tag
git push origin v0.0.1-test

# Watch the build in Actions tab
```

### Check Build Logs

1. Go to **Actions** tab
2. Click on the running workflow
3. Check "Setup Android Keystore" step
4. Should see: "Using keystore from GitHub Secrets"

### Verify APK Signature

After build completes:

```bash
# Download the APK from releases or artifacts

# Verify signature (requires Android SDK)
apksigner verify --verbose NativeBridge-v0.0.1-test.apk

# Or use jarsigner
jarsigner -verify -verbose -certs NativeBridge-v0.0.1-test.apk
```

## 🔄 Updating Secrets

### To Update a Secret

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret name
3. Click **Update secret**
4. Enter new value
5. Click **Update secret**

### To Delete a Secret

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **Remove** next to the secret
3. Confirm deletion

## 🚨 Security Best Practices

### DO ✅

- ✅ Use strong, unique passwords for production keystores
- ✅ Store keystore passwords in a password manager
- ✅ Backup your production keystore securely
- ✅ Limit repository access to trusted team members
- ✅ Use different keystores for dev/staging/production
- ✅ Rotate secrets periodically
- ✅ Enable 2FA on your GitHub account

### DON'T ❌

- ❌ Share secrets via email or chat
- ❌ Commit secrets to repository (even private repos)
- ❌ Use weak passwords
- ❌ Give unnecessary people access
- ❌ Store secrets in code or config files
- ❌ Forget to backup your production keystore

## 🔍 Troubleshooting

### "Keystore was tampered with, or password was incorrect"

**Causes:**
- Wrong password in secret
- Corrupted base64 encoding
- Wrong keystore file

**Solutions:**
```bash
# Re-encode the keystore
base64 -i your-keystore.keystore > keystore.txt
cat keystore.txt | pbcopy

# Update the ANDROID_KEYSTORE_BASE64 secret
```

### "Key alias not found"

**Causes:**
- Wrong alias name
- Keystore doesn't contain that alias

**Solutions:**
```bash
# List aliases in keystore
keytool -list -v -keystore your-keystore.keystore

# Update ANDROID_KEY_ALIAS secret with correct alias
```

### Build Uses Local Keystore Instead of Secrets

**Causes:**
- Secrets not properly configured
- Missing one or more required secrets

**Solutions:**
1. Verify all 4 secrets are added
2. Check secret names match exactly (case-sensitive)
3. Re-run the workflow

## 📊 Environment Variables

The pipeline automatically sets these environment variables:

| Variable | Source | Description |
|----------|--------|-------------|
| `KEYSTORE_BASE64` | GitHub Secret | Base64 keystore |
| `KEYSTORE_PASSWORD` | GitHub Secret | Keystore password |
| `KEY_ALIAS` | GitHub Secret | Key alias |
| `KEY_PASSWORD` | GitHub Secret | Key password |

## 🔐 Using Development Keystore

If you don't want to use production secrets (for testing):

**No action needed!** The pipeline will automatically:
1. Detect missing secrets
2. Fall back to local development keystore
3. Use development passwords from `gradle.properties`

**When to use:**
- Internal testing
- Development builds
- Non-production releases

## 📚 Additional Resources

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Keystore Management](../KEYSTORE_INFO.md)
- [CI/CD Guide](../CICD_GUIDE.md)

## 🆘 Getting Help

If you need help:

1. Check build logs in Actions tab
2. Verify secret names are correct
3. Test keystore locally first
4. Review [SECURITY.md](../SECURITY.md)

## ✨ Quick Reference

### Base64 Encoding Commands

**macOS:**
```bash
base64 -i keystore.keystore | pbcopy
```

**Linux:**
```bash
base64 -w 0 keystore.keystore | xclip -selection clipboard
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("keystore.keystore")) | Set-Clipboard
```

### Verifying APK Signature

```bash
# Using apksigner
apksigner verify --verbose app.apk

# Using jarsigner
jarsigner -verify -verbose -certs app.apk

# Get certificate fingerprint
keytool -list -v -keystore keystore.keystore
```

---

**Last Updated:** 2025-11-27

For security questions, see [SECURITY.md](../SECURITY.md)
