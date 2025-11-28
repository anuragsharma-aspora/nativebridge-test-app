# Release Keystore Information

This document contains important information about the release keystore used for signing the production APK.

## ⚠️ IMPORTANT - KEEP THIS SECURE

The release keystore is critical for app updates and distribution. **Never lose or share this file publicly!**

## Keystore Details

### Location
```
android/app/nativebridge-release.keystore
```

### Keystore Information
- **Keystore File:** `nativebridge-release.keystore`
- **Keystore Type:** PKCS12
- **Key Alias:** `nativebridge-key`
- **Algorithm:** RSA 2048-bit
- **Validity:** 10,000 days (approximately 27 years)
- **Distinguished Name:**
  - CN: NativeBridge
  - OU: Development
  - O: NativeBridge
  - L: San Francisco
  - ST: California
  - C: US

### Credentials
- **Keystore Password:** `nativebridge2025`
- **Key Password:** `nativebridge2025`

## Gradle Configuration

The keystore is configured in the following files:

### android/gradle.properties
```properties
MYAPP_RELEASE_STORE_FILE=nativebridge-release.keystore
MYAPP_RELEASE_KEY_ALIAS=nativebridge-key
MYAPP_RELEASE_STORE_PASSWORD=nativebridge2025
MYAPP_RELEASE_KEY_PASSWORD=nativebridge2025
```

### android/app/build.gradle
The release signing configuration is set up to use these properties automatically.

## Security Best Practices

### For Development/Testing
The current keystore is suitable for:
- ✅ Internal testing
- ✅ QA and UAT environments
- ✅ Development builds
- ✅ Internal distribution

### For Production Release
**Before releasing to the Play Store or public distribution:**

1. **Generate a new secure keystore** with:
   - Strong passwords (20+ characters, mix of symbols, numbers, letters)
   - Secure storage (encrypted backup, password manager)
   - Limited access (only authorized personnel)

2. **Backup the keystore securely:**
   ```bash
   # Create encrypted backup
   cp android/app/nativebridge-release.keystore ~/secure-backup/
   # Store passwords in a password manager (1Password, LastPass, etc.)
   ```

3. **Never commit keystore to version control:**
   - Add to `.gitignore`
   - Use CI/CD secrets for automated builds
   - Store credentials in environment variables

4. **Use separate keystores for different environments:**
   - Development keystore (current one is fine)
   - Staging keystore
   - Production keystore (highly secure)

## Generating a New Production Keystore

If you need to generate a more secure keystore for production:

```bash
cd android/app

# Generate new keystore with interactive prompts
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore nativebridge-production.keystore \
  -alias nativebridge-production-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You will be prompted for:
# - Keystore password (use a strong password!)
# - Key password (use a strong password!)
# - Your name, organization, etc.
```

Then update `gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=nativebridge-production.keystore
MYAPP_RELEASE_KEY_ALIAS=nativebridge-production-key
MYAPP_RELEASE_STORE_PASSWORD=<your-secure-password>
MYAPP_RELEASE_KEY_PASSWORD=<your-secure-password>
```

## Viewing Keystore Information

To view the current keystore details:

```bash
keytool -list -v -keystore android/app/nativebridge-release.keystore -storepass nativebridge2025
```

## Verifying APK Signature

To verify the production APK is properly signed:

```bash
# Using apksigner (from Android SDK)
apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk

# Or using jarsigner
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### "Keystore was tampered with, or password was incorrect"
- Verify you're using the correct password
- Check the keystore file isn't corrupted
- Ensure PKCS12 format is supported

### "Certificate fingerprint does not match"
- You may have regenerated the keystore
- Play Store requires the same certificate for updates
- Keep the original keystore backed up securely

## Google Play Store Requirements

When uploading to Google Play Store:

1. **App Signing by Google Play (Recommended):**
   - Upload key is separate from app signing key
   - Google manages the app signing key
   - More secure and allows key upgrade

2. **Traditional App Signing:**
   - You manage the signing key
   - Must never lose the keystore
   - Cannot recover if lost

For more information, see:
- [Sign your app - Android Developers](https://developer.android.com/studio/publish/app-signing)
- [App signing - Play Console Help](https://support.google.com/googleplay/android-developer/answer/9842756)

---

**Created:** 2025-11-27
**Last Updated:** 2025-11-27

⚠️ **Remember:** Treat your production keystore like a password. If lost, you cannot update your app in the Play Store!
