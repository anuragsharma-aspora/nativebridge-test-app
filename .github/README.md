# GitHub Configuration

This directory contains GitHub-specific configuration files for the NativeBridge project.

## 📁 Directory Structure

```
.github/
├── workflows/
│   └── release-build.yml    # CI/CD pipeline for releases
├── SECRETS_SETUP.md         # Guide for configuring GitHub Secrets
└── README.md                # This file
```

## 🚀 CI/CD Pipeline

### Release Build Workflow

**File:** [`workflows/release-build.yml`](workflows/release-build.yml)

**Triggers:** When a release tag is pushed (e.g., `v1.0.0`)

**Builds:**
1. Android APK (production release)
2. iOS .app (simulator build)
3. Creates GitHub Release with both artifacts

**Documentation:** See [CICD_GUIDE.md](../CICD_GUIDE.md) for detailed usage

### Quick Start

```bash
# Create and push a release tag
git tag v1.0.0
git push origin v1.0.0

# Pipeline automatically:
# 1. Builds Android APK
# 2. Builds iOS .app
# 3. Creates GitHub Release
# 4. Attaches artifacts
```

## 🔐 GitHub Secrets

For production builds with secure keystores, configure these secrets:

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded production keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

**Setup Guide:** See [SECRETS_SETUP.md](SECRETS_SETUP.md)

## 📝 Workflow Features

### Android Build
- ✅ Node.js 18 setup
- ✅ JDK 17 setup
- ✅ Gradle caching
- ✅ Automatic versioning
- ✅ Keystore from secrets or fallback to dev
- ✅ APK signed and ready

### iOS Build
- ✅ Node.js 18 setup
- ✅ CocoaPods installation
- ✅ Xcode latest stable
- ✅ Simulator build
- ✅ .app zipped for download

### Release Creation
- ✅ Automatic GitHub Release
- ✅ Version-tagged artifacts
- ✅ Generated release notes
- ✅ Pre-release detection (beta, alpha tags)

## 🎯 Supported Tag Formats

| Tag Format | Result | Pre-release |
|------------|--------|-------------|
| `v1.0.0` | Release 1.0.0 | No |
| `v1.2.3` | Release 1.2.3 | No |
| `v2.0.0-beta` | Release 2.0.0-beta | Yes |
| `v1.5.0-alpha.1` | Release 1.5.0-alpha.1 | Yes |

## 📦 Artifacts

### Retention

- **GitHub Actions Artifacts:** 90 days
- **GitHub Release Artifacts:** Permanent

### Download

**From Actions:**
1. Actions tab → Select workflow run
2. Artifacts section → Download

**From Releases:**
1. Releases tab → Select version
2. Assets section → Download

## 🔧 Customization

To modify the pipeline:

1. Edit [`workflows/release-build.yml`](workflows/release-build.yml)
2. Test changes on a branch first
3. Create a test tag to verify
4. Merge to main when ready

## 📚 Documentation

- [CICD_GUIDE.md](../CICD_GUIDE.md) - Complete CI/CD documentation
- [SECRETS_SETUP.md](SECRETS_SETUP.md) - GitHub Secrets configuration
- [BUILD_GUIDE.md](../BUILD_GUIDE.md) - Manual build instructions
- [SECURITY.md](../SECURITY.md) - Security best practices

## 🆘 Troubleshooting

**Build fails?**
1. Check Actions tab for logs
2. Verify tag format (`v*` required)
3. Check secrets configuration
4. Review [CICD_GUIDE.md](../CICD_GUIDE.md) troubleshooting section

**Need help?**
- Review workflow logs in Actions tab
- Check [CICD_GUIDE.md](../CICD_GUIDE.md)
- Verify secrets in repository settings

---

**Last Updated:** 2025-11-27
