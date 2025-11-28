# Release Scripts Documentation

This directory contains automation scripts for the NativeBridge project.

## 📋 Available Scripts

### `release.sh` - Automated Release Script

Automates the entire release process including version bumping, testing, and deployment.

## 🚀 Quick Start

```bash
# Create a new release
./scripts/release.sh 1.0.0

# Create a beta release
./scripts/release.sh 1.0.0-beta

# Dry run (see what would happen)
./scripts/release.sh 1.0.0 --dry-run

# Skip tests and build
./scripts/release.sh 1.0.1 --skip-tests --skip-build
```

## 📖 Detailed Usage

### Basic Syntax

```bash
./scripts/release.sh <version> [options]
```

### Arguments

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `version` | Yes | Semantic version number | `1.0.0`, `2.0.0-beta` |

### Options

| Option | Description |
|--------|-------------|
| `--skip-tests` | Skip running tests |
| `--skip-build` | Skip Android build verification |
| `--prerelease` | Mark as pre-release (for beta/alpha) |
| `--dry-run` | Show what would happen without making changes |
| `--force` | Skip all confirmations |
| `-h, --help` | Show help message |

### Examples

#### Standard Release

```bash
./scripts/release.sh 1.0.0
```

This will:
1. ✅ Validate version format
2. ✅ Check git status
3. ✅ Update `package.json` version
4. ✅ Update Android `versionCode` and `versionName`
5. ✅ Run tests
6. ✅ Verify Android build
7. ✅ Commit changes
8. ✅ Create tag `v1.0.0`
9. ✅ Push commit and tag
10. ✅ Trigger CI/CD pipeline

#### Beta Release

```bash
./scripts/release.sh 1.0.0-beta --prerelease
```

Creates a pre-release version.

#### Quick Release (Skip Tests)

```bash
./scripts/release.sh 1.0.1 --skip-tests --skip-build
```

Useful for hotfixes or documentation updates.

#### Dry Run

```bash
./scripts/release.sh 2.0.0 --dry-run
```

See what would happen without making any changes.

## 🔧 What the Script Does

### 1. Pre-flight Checks

- ✅ Validates version format (semantic versioning)
- ✅ Checks for required dependencies (`git`, `node`, `jq`)
- ✅ Verifies git repository status
- ✅ Checks for uncommitted changes
- ✅ Verifies current branch
- ✅ Checks if tag already exists

### 2. Version Updates

#### package.json

```json
{
  "version": "1.0.0"  // Updated to new version
}
```

#### android/app/build.gradle

```gradle
versionCode 10000      // Generated from version (1.0.0 -> 10000)
versionName "1.0.0"    // Set to version string
```

**Version Code Generation:**
- `1.0.0` → `10000`
- `1.2.3` → `10203`
- `2.5.1` → `20501`
- `1.0.0-beta` → `10000` (suffix ignored)

### 3. Testing & Building

- Runs `npm test` (unless `--skip-tests`)
- Verifies Android build with `./gradlew assembleRelease` (unless `--skip-build`)

### 4. Git Operations

#### Commit Message Format

```
chore: bump version to 1.0.0

- Updated package.json version
- Updated Android versionCode and versionName
- Preparing for release v1.0.0
```

#### Tag Format

```
Release v1.0.0

Version: 1.0.0
Date: 2025-11-29 12:30:45
Branch: main
Commit: abc1234

This release includes:
- Android APK: NativeBridge-v1.0.0.apk
- iOS .app: NativeBridge-iOS-v1.0.0.app.zip

Automated build via GitHub Actions CI/CD pipeline.
```

### 5. Remote Push

- Pushes commit to current branch
- Pushes tag to remote
- Triggers GitHub Actions CI/CD pipeline

## 📊 Output Example

```
╔════════════════════════════════════════════════════════════╗
║           NativeBridge Release Automation                 ║
╚════════════════════════════════════════════════════════════╝

Release Version: 1.0.0
Tag: v1.0.0

▶ Checking dependencies

✓ All required dependencies found

▶ Checking git status

✓ Working directory is clean
ℹ Current branch: main

▶ Updating package.json

✓ Updated package.json to version 1.0.0
ℹ New version in package.json:
  "version": "1.0.0",

▶ Updating Android build.gradle

ℹ Version: 1.0.0
ℹ Version Code: 10000
✓ Updated Android build.gradle
ℹ versionCode: 10000
ℹ versionName: 1.0.0

▶ Running tests

✓ All tests passed

▶ Verifying Android build

✓ Android build successful

▶ Committing version changes

✓ Changes committed

▶ Creating git tag

✓ Tag v1.0.0 created

▶ Pushing to remote

✓ Pushed commit to main
✓ Pushed tag v1.0.0
ℹ GitHub Actions will now build the release

✓ ═══════════════════════════════════════════════════════════
✓ Release 1.0.0 completed successfully! 🎉
✓ ═══════════════════════════════════════════════════════════

ℹ Next steps:
ℹ 1. Monitor the build at: https://github.com/your-org/your-repo/actions
ℹ 2. Download artifacts from: https://github.com/your-org/your-repo/releases/tag/v1.0.0
ℹ 3. Test the built APK and .app
```

## 🛠️ Requirements

### Required Dependencies

- **git** - Version control
- **node** - JavaScript runtime
- **npm** - Package manager

### Optional Dependencies

- **jq** - JSON processor (recommended for clean JSON manipulation)

**Install jq:**

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Fedora
sudo dnf install jq
```

Without `jq`, the script will fall back to `sed` for JSON manipulation.

## 🔍 Troubleshooting

### Error: "Invalid version format"

**Problem:** Version doesn't follow semantic versioning.

**Solution:** Use format `MAJOR.MINOR.PATCH` (e.g., `1.0.0`, `1.2.3-beta`)

```bash
# ✅ Correct
./scripts/release.sh 1.0.0
./scripts/release.sh 1.2.3-beta

# ❌ Wrong
./scripts/release.sh 1.0        # Missing patch version
./scripts/release.sh v1.0.0     # Don't include 'v' prefix
./scripts/release.sh release-1  # Invalid format
```

### Error: "Tag already exists"

**Problem:** A tag with this version already exists.

**Solution:** Delete the existing tag or use a different version

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Or use a different version
./scripts/release.sh 1.0.1
```

### Error: "You have uncommitted changes"

**Problem:** Working directory has uncommitted changes.

**Solution:** Commit or stash your changes

```bash
# Commit changes
git add .
git commit -m "Your commit message"

# Or stash changes
git stash

# Or force release anyway
./scripts/release.sh 1.0.0 --force
```

### Error: "Not on main/master branch"

**Problem:** You're on a feature branch.

**Solution:** Switch to main branch or force release

```bash
# Switch to main
git checkout main

# Or force release from current branch
./scripts/release.sh 1.0.0 --force
```

### Error: "Tests failed"

**Problem:** npm test failed.

**Solution:** Fix tests or skip them

```bash
# Fix tests first
npm test

# Or skip tests (not recommended)
./scripts/release.sh 1.0.0 --skip-tests
```

### Error: "Android build failed"

**Problem:** gradlew assembleRelease failed.

**Solution:** Fix build or skip verification

```bash
# Fix build first
cd android && ./gradlew assembleRelease

# Or skip build verification
./scripts/release.sh 1.0.0 --skip-build
```

## 🎯 Best Practices

### 1. Always Run Dry Run First

```bash
# See what will happen
./scripts/release.sh 1.0.0 --dry-run

# If everything looks good
./scripts/release.sh 1.0.0
```

### 2. Use Semantic Versioning

- **MAJOR** (2.0.0) - Breaking changes
- **MINOR** (1.1.0) - New features, backwards compatible
- **PATCH** (1.0.1) - Bug fixes, backwards compatible

### 3. Don't Skip Tests in Production

```bash
# ✅ Good - runs tests
./scripts/release.sh 1.0.0

# ⚠️ Use with caution
./scripts/release.sh 1.0.0 --skip-tests
```

### 4. Use Pre-release Tags for Beta/Alpha

```bash
# Beta release
./scripts/release.sh 1.0.0-beta --prerelease

# Alpha release
./scripts/release.sh 2.0.0-alpha.1 --prerelease
```

### 5. Check Build Status After Release

```bash
# After running release script
# Go to GitHub Actions to monitor build
# URL will be printed by the script
```

## 🔄 Integration with CI/CD

The release script integrates seamlessly with the GitHub Actions CI/CD pipeline:

1. **Script runs** → Bumps versions, commits, pushes tag
2. **Tag push** → Triggers [`.github/workflows/release-build.yml`](../.github/workflows/release-build.yml)
3. **CI/CD builds** → Produces Android APK and iOS .app
4. **GitHub Release** → Artifacts attached automatically

## 📚 Related Documentation

- [CICD_GUIDE.md](../CICD_GUIDE.md) - Complete CI/CD pipeline documentation
- [QUICKSTART_CICD.md](../QUICKSTART_CICD.md) - Quick start guide
- [BUILD_GUIDE.md](../BUILD_GUIDE.md) - Manual build instructions
- [SECURITY.md](../SECURITY.md) - Security best practices

## 🧪 Testing the Script

### Test in Dry Run Mode

```bash
# Safe - no changes made
./scripts/release.sh 1.0.0 --dry-run
```

### Test with Different Options

```bash
# Test skipping tests
./scripts/release.sh 1.0.0 --skip-tests --dry-run

# Test skipping build
./scripts/release.sh 1.0.0 --skip-build --dry-run

# Test force mode
./scripts/release.sh 1.0.0 --force --dry-run
```

## 📝 Script Workflow Diagram

```
┌─────────────────────────┐
│  Run release.sh 1.0.0   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Validate Arguments     │
│  - Check version format │
│  - Check dependencies   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Check Git Status       │
│  - Uncommitted changes? │
│  - Correct branch?      │
│  - Tag exists?          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Update Versions        │
│  - package.json         │
│  - build.gradle         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Run Tests              │
│  (if not --skip-tests)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Verify Build           │
│  (if not --skip-build)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Commit Changes         │
│  - Add updated files    │
│  - Create commit        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Create & Push Tag      │
│  - Create annotated tag │
│  - Push commit          │
│  - Push tag             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Trigger CI/CD Pipeline │
│  - GitHub Actions runs  │
│  - Builds APK & .app    │
│  - Creates release      │
└─────────────────────────┘
```

## 🆘 Getting Help

```bash
# Show help message
./scripts/release.sh --help

# View script source
cat scripts/release.sh

# Test in dry run mode
./scripts/release.sh 1.0.0 --dry-run
```

---

**Last Updated:** 2025-11-29

For questions or issues, please check the [CICD_GUIDE.md](../CICD_GUIDE.md) or open an issue.
