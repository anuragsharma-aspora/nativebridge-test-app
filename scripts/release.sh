#!/bin/bash

################################################################################
# NativeBridge Release Script
#
# This script automates the release process:
# 1. Bumps version in package.json
# 2. Commits version changes
# 3. Creates and pushes git tag
# 4. Triggers CI/CD pipeline
#
# Usage:
#   ./scripts/release.sh <version> [options]
#
# Examples:
#   ./scripts/release.sh 1.0.0
#   ./scripts/release.sh 1.2.3 --skip-tests
#   ./scripts/release.sh 2.0.0-beta --prerelease
#
# Author: NativeBridge Team
# License: MIT
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Files to update
PACKAGE_JSON="$PROJECT_ROOT/package.json"
ANDROID_BUILD_GRADLE="$PROJECT_ROOT/android/app/build.gradle"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           NativeBridge Release Automation                 ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}\n"
}

show_usage() {
    cat << EOF
Usage: $0 <version> [options]

Arguments:
  version       Version number (e.g., 1.0.0, 2.0.0-beta)

Options:
  --skip-tests      Skip running tests
  --skip-build      Skip build verification
  --prerelease      Mark as pre-release
  --dry-run         Show what would happen without making changes
  --force           Skip confirmations
  -h, --help        Show this help message

Examples:
  $0 1.0.0
  $0 1.2.3 --skip-tests
  $0 2.0.0-beta --prerelease
  $0 1.0.1 --dry-run

EOF
}

################################################################################
# Validation Functions
################################################################################

check_dependencies() {
    print_step "Checking dependencies"

    local missing_deps=()

    # Check git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi

    # Check node
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi

    # Check jq (for JSON manipulation)
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Installing it is recommended for JSON manipulation."
        print_info "macOS: brew install jq"
        print_info "Linux: sudo apt-get install jq"
        USE_JQ=false
    else
        USE_JQ=true
        print_success "jq is available"
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi

    print_success "All required dependencies found"
}

validate_version() {
    local version=$1

    # Regex for semantic versioning
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
        print_error "Invalid version format: $version"
        print_info "Version must follow semantic versioning (e.g., 1.0.0, 1.2.3-beta)"
        return 1
    fi

    return 0
}

check_git_status() {
    print_step "Checking git status"

    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi

    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        print_warning "You have uncommitted changes:"
        git status -s

        if [[ "$FORCE" != true ]]; then
            echo ""
            read -p "Continue anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "Aborted by user"
                exit 1
            fi
        fi
    else
        print_success "Working directory is clean"
    fi

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"

    if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
        print_warning "Not on main/master branch"

        if [[ "$FORCE" != true ]]; then
            read -p "Continue anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "Aborted by user"
                exit 1
            fi
        fi
    fi
}

check_tag_exists() {
    local version=$1
    local tag="v$version"

    if git rev-parse "$tag" >/dev/null 2>&1; then
        print_error "Tag $tag already exists"
        print_info "Delete it with: git tag -d $tag"
        exit 1
    fi
}

################################################################################
# Version Bump Functions
################################################################################

update_package_json() {
    local version=$1

    print_step "Updating package.json"

    if [[ "$USE_JQ" == true ]]; then
        # Use jq for clean JSON manipulation
        local temp_file=$(mktemp)
        jq --arg version "$version" '.version = $version' "$PACKAGE_JSON" > "$temp_file"
        mv "$temp_file" "$PACKAGE_JSON"
        print_success "Updated package.json to version $version"
    else
        # Fallback to sed (less robust but works without jq)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/\"version\": \".*\"/\"version\": \"$version\"/" "$PACKAGE_JSON"
        else
            # Linux
            sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" "$PACKAGE_JSON"
        fi
        print_success "Updated package.json to version $version"
    fi

    # Show the change
    print_info "New version in package.json:"
    grep '"version"' "$PACKAGE_JSON"
}

update_android_version() {
    local version=$1

    print_step "Updating Android build.gradle"

    # Generate versionCode from version number
    # 1.2.3 -> 10203
    # 1.0.0 -> 10000
    local version_code=$(echo "$version" | sed 's/-.*//' | awk -F. '{printf "%d%02d%02d", $1, $2, $3}')

    print_info "Version: $version"
    print_info "Version Code: $version_code"

    # Update versionCode
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/versionCode [0-9]*/versionCode $version_code/" "$ANDROID_BUILD_GRADLE"
        sed -i '' "s/versionName \".*\"/versionName \"$version\"/" "$ANDROID_BUILD_GRADLE"
    else
        sed -i "s/versionCode [0-9]*/versionCode $version_code/" "$ANDROID_BUILD_GRADLE"
        sed -i "s/versionName \".*\"/versionName \"$version\"/" "$ANDROID_BUILD_GRADLE"
    fi

    print_success "Updated Android build.gradle"
    print_info "versionCode: $version_code"
    print_info "versionName: $version"
}

################################################################################
# Build & Test Functions
################################################################################

run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        print_warning "Skipping tests (--skip-tests)"
        return
    fi

    print_step "Running tests"

    cd "$PROJECT_ROOT"

    if npm test; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

verify_build() {
    if [[ "$SKIP_BUILD" == true ]]; then
        print_warning "Skipping build verification (--skip-build)"
        return
    fi

    print_step "Verifying Android build"

    cd "$PROJECT_ROOT/android"

    if ./gradlew assembleRelease --no-daemon; then
        print_success "Android build successful"
    else
        print_error "Android build failed"
        exit 1
    fi
}

################################################################################
# Git Functions
################################################################################

commit_version_changes() {
    local version=$1

    print_step "Committing version changes"

    cd "$PROJECT_ROOT"

    # Add changed files
    git add "$PACKAGE_JSON" "$ANDROID_BUILD_GRADLE"

    # Commit
    git commit -m "chore: bump version to $version

- Updated package.json version
- Updated Android versionCode and versionName
- Preparing for release v$version"

    print_success "Changes committed"
}

create_and_push_tag() {
    local version=$1
    local tag="v$version"

    print_step "Creating git tag"

    cd "$PROJECT_ROOT"

    # Create annotated tag
    git tag -a "$tag" -m "Release $tag

Version: $version
Date: $(date '+%Y-%m-%d %H:%M:%S')
Branch: $(git branch --show-current)
Commit: $(git rev-parse --short HEAD)

This release includes:
- Android APK: NativeBridge-v${version}.apk
- iOS .app: NativeBridge-iOS-v${version}.app.zip

Automated build via GitHub Actions CI/CD pipeline."

    print_success "Tag $tag created"

    # Push commit and tag
    print_step "Pushing to remote"

    git push origin "$CURRENT_BRANCH"
    print_success "Pushed commit to $CURRENT_BRANCH"

    git push origin "$tag"
    print_success "Pushed tag $tag"

    print_info "GitHub Actions will now build the release"
}

################################################################################
# Main Release Process
################################################################################

perform_release() {
    local version=$1

    print_header

    echo -e "${GREEN}Release Version: $version${NC}"
    echo -e "${GREEN}Tag: v$version${NC}"
    echo ""

    # Validate version format
    if ! validate_version "$version"; then
        exit 1
    fi

    # Check dependencies
    check_dependencies

    # Check git status
    check_git_status

    # Check if tag already exists
    check_tag_exists "$version"

    # Show summary and confirm
    if [[ "$DRY_RUN" != true && "$FORCE" != true ]]; then
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Release Summary:${NC}"
        echo -e "${YELLOW}  Version:      $version${NC}"
        echo -e "${YELLOW}  Tag:          v$version${NC}"
        echo -e "${YELLOW}  Branch:       $CURRENT_BRANCH${NC}"
        echo -e "${YELLOW}  Skip Tests:   ${SKIP_TESTS:-false}${NC}"
        echo -e "${YELLOW}  Skip Build:   ${SKIP_BUILD:-false}${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        read -p "Continue with release? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Release cancelled by user"
            exit 1
        fi
    fi

    if [[ "$DRY_RUN" == true ]]; then
        print_warning "DRY RUN MODE - No changes will be made"
        echo ""
        print_info "Would update package.json to version $version"
        print_info "Would update Android build.gradle"
        print_info "Would run tests (if not skipped)"
        print_info "Would verify build (if not skipped)"
        print_info "Would commit changes"
        print_info "Would create and push tag v$version"
        print_info "Would trigger CI/CD pipeline"
        echo ""
        print_success "Dry run completed"
        exit 0
    fi

    # Update versions
    update_package_json "$version"
    update_android_version "$version"

    # Run tests
    run_tests

    # Verify build
    verify_build

    # Commit changes
    commit_version_changes "$version"

    # Create and push tag
    create_and_push_tag "$version"

    # Success message
    echo ""
    print_success "═══════════════════════════════════════════════════════════"
    print_success "Release $version completed successfully! 🎉"
    print_success "═══════════════════════════════════════════════════════════"
    echo ""
    print_info "Next steps:"
    print_info "1. Monitor the build at: https://github.com/$(git config --get remote.origin.url | sed 's/.*://; s/.git$//')/actions"
    print_info "2. Download artifacts from: https://github.com/$(git config --get remote.origin.url | sed 's/.*://; s/.git$//')/releases/tag/v$version"
    print_info "3. Test the built APK and .app"
    echo ""
}

################################################################################
# Entry Point
################################################################################

main() {
    # Parse arguments
    VERSION=""
    SKIP_TESTS=false
    SKIP_BUILD=false
    PRERELEASE=false
    DRY_RUN=false
    FORCE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --prerelease)
                PRERELEASE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            -*)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [[ -z "$VERSION" ]]; then
                    VERSION="$1"
                else
                    print_error "Multiple versions specified"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Check if version was provided
    if [[ -z "$VERSION" ]]; then
        print_error "Version number required"
        echo ""
        show_usage
        exit 1
    fi

    # Perform the release
    perform_release "$VERSION"
}

# Run main function
main "$@"
