# Security Guidelines

This document outlines security best practices for the NativeBridge application, particularly regarding keystore management and credential handling.

## 🔒 Critical Security Files

### Files That Should NEVER Be Public

The following files contain sensitive information and should be protected:

1. **Release Keystore**
   - `android/app/nativebridge-release.keystore`
   - Contains the private key used to sign your app
   - **If lost, you cannot update your app in the Play Store!**
   - **If stolen, attackers can impersonate your app!**

2. **Credentials in gradle.properties**
   - `android/gradle.properties` (lines 52-55)
   - Contains keystore passwords
   - Current passwords are for development only

3. **KEYSTORE_INFO.md**
   - Contains all keystore details and passwords
   - Useful for development, but should be secured for production

## ✅ What's Already Protected

The `.gitignore` file is configured to protect:

- ✅ All `.keystore` files (except debug.keystore)
- ✅ Common credential files (key.properties, keystore.properties, etc.)
- ✅ Build artifacts (APKs, AABs)
- ✅ Environment files (.env, .env.local)

## ⚠️ Current Setup Status

### Development/Testing (Current)
```
Status: SUITABLE FOR TESTING ✅
- Keystore: Simple password for convenience
- Distribution: Internal testing, QA, development
- Risk Level: Low (not public release)
```

### Production Release (Recommended Changes)
```
Status: REQUIRES HARDENING ⚠️
- Generate new keystore with strong passwords
- Store credentials securely (not in gradle.properties)
- Use CI/CD secrets or key management service
```

## 🛡️ Security Best Practices

### 1. For Production Release

Before releasing to the Google Play Store:

#### Generate a Production Keystore

```bash
cd android/app

# Generate with strong credentials
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore nativebridge-production.keystore \
  -alias nativebridge-production \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Use strong passwords (20+ characters, mixed characters)
# Store passwords in a password manager immediately!
```

#### Secure Password Management

**Option 1: Environment Variables (Recommended for CI/CD)**

```bash
# Set environment variables
export MYAPP_RELEASE_STORE_PASSWORD='your-strong-password'
export MYAPP_RELEASE_KEY_PASSWORD='your-strong-password'

# Remove passwords from gradle.properties
# Gradle will read from environment variables
```

**Option 2: Separate Properties File (Recommended for Local)**

Create `android/gradle.properties.secret` (git-ignored):
```properties
MYAPP_RELEASE_STORE_FILE=nativebridge-production.keystore
MYAPP_RELEASE_KEY_ALIAS=nativebridge-production
MYAPP_RELEASE_STORE_PASSWORD=your-strong-password-here
MYAPP_RELEASE_KEY_PASSWORD=your-strong-password-here
```

Then load it in `android/app/build.gradle`:
```gradle
def keystorePropertiesFile = rootProject.file("gradle.properties.secret")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

**Option 3: CI/CD Secrets (Best for Automation)**

Use your CI/CD platform's secret management:
- GitHub Actions: Repository Secrets
- GitLab CI: Protected Variables
- Jenkins: Credentials Plugin
- CircleCI: Environment Variables

### 2. Keystore Backup Strategy

**Critical:** If you lose your production keystore, you CANNOT update your app in Play Store!

#### Backup Steps

1. **Immediate Backup After Creation**
   ```bash
   # Copy to multiple secure locations
   cp android/app/nativebridge-production.keystore ~/secure-backup/
   cp android/app/nativebridge-production.keystore /path/to/encrypted/drive/
   ```

2. **Encrypted Cloud Backup**
   - Use encrypted cloud storage (e.g., iCloud Keychain, 1Password, BitWarden)
   - Store in company's secure document repository
   - Never use public cloud storage without encryption

3. **Password Manager**
   - Store all passwords in a password manager (1Password, LastPass, Bitwarden)
   - Enable 2FA on password manager
   - Share with trusted team members via secure sharing

4. **Physical Backup**
   - Store encrypted copy on external drive
   - Keep in secure location (safe, locked cabinet)
   - Document the backup procedure

### 3. Git Repository Protection

#### Files to NEVER Commit

- ❌ Production keystores (*.keystore)
- ❌ Passwords in plain text
- ❌ Private keys
- ❌ API keys and secrets
- ❌ Credentials in code

#### Verify Before Committing

```bash
# Check what will be committed
git status

# Search for potential secrets
git grep -i "password"
git grep -i "api.key"
git grep -i "secret"

# Use git-secrets or similar tools
git secrets --scan
```

#### If You Accidentally Commit Secrets

1. **Do NOT just delete in next commit** - history still contains it!
2. Use tools to remove from history:
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   git filter-repo --path android/app/nativebridge-release.keystore --invert-paths
   ```
3. **Immediately rotate compromised credentials**
4. **Generate new keystore if production key was exposed**

### 4. Team Access Control

#### Who Should Have Access

| Role | Access Level |
|------|-------------|
| Developers | Debug keystore only |
| DevOps/CI | Environment variables, no direct keystore access |
| Release Manager | Production keystore, secure storage only |
| Team Leads | Backup access, secure storage only |

#### Access Procedures

1. **Principle of Least Privilege**
   - Only give access when needed
   - Revoke access when no longer needed
   - Regular access reviews

2. **Audit Trail**
   - Log who accessed keystore
   - Track when builds are signed
   - Monitor for unusual activity

## 🔍 Security Checklist

### Before First Production Release

- [ ] Generate production keystore with strong passwords
- [ ] Backup keystore to multiple secure locations
- [ ] Store passwords in password manager
- [ ] Remove passwords from gradle.properties
- [ ] Set up CI/CD secrets
- [ ] Test production build signing
- [ ] Document who has keystore access
- [ ] Set up keystore backup procedure
- [ ] Enable Play App Signing (recommended)
- [ ] Review all code for hardcoded secrets

### Regular Security Review

- [ ] Rotate keystore passwords annually
- [ ] Review team access quarterly
- [ ] Verify backups are intact
- [ ] Update security documentation
- [ ] Audit CI/CD secret usage
- [ ] Check for leaked secrets in git history
- [ ] Review .gitignore effectiveness

## 🚨 Incident Response

### If Keystore is Lost

1. **For apps not yet released:**
   - Generate new keystore
   - Update build configuration
   - No user impact

2. **For released apps:**
   - **Cannot be recovered!**
   - Must release as new app (new package name)
   - Lose all users and reviews
   - **This is why backup is critical!**

### If Keystore is Compromised

1. **Immediate Actions:**
   - Revoke compromised keystore if using Play App Signing
   - Generate new keystore
   - Release emergency update
   - Notify users if necessary

2. **Investigation:**
   - Determine how compromise occurred
   - Check for malicious app versions
   - Review access logs
   - Update security procedures

## 📚 Additional Resources

- [Android: Sign your app](https://developer.android.com/studio/publish/app-signing)
- [Google Play: App signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security-testing-guide/)
- [Android Security Best Practices](https://developer.android.com/topic/security/best-practices)

## 📞 Security Contact

For security concerns or questions:
1. Review this document first
2. Check [KEYSTORE_INFO.md](KEYSTORE_INFO.md) for technical details
3. Consult with your security team
4. Follow your organization's security policies

---

**Remember:** Security is not a one-time task. Regular reviews and updates are essential!

**Last Updated:** 2025-11-27
