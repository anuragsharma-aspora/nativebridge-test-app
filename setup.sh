#!/bin/bash

# NativeBridge Setup Script
# Automates the complete setup process for NativeBridge app

set -e  # Exit on any error

echo "🚀 NativeBridge Setup Script"
echo "================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js >= 18"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm version: $NPM_VERSION"

# Check Java
if ! command -v java &> /dev/null; then
    print_error "Java is not installed. Please install JDK 17"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
print_success "Java version: $JAVA_VERSION"

# Check if source app exists
SOURCE_APP="/Users/himanshukukreja/autoflow/appium-test-scripts/android-test-apps/NativeBridgeApp"
if [ ! -d "$SOURCE_APP" ]; then
    print_error "Source app not found at: $SOURCE_APP"
    exit 1
fi
print_success "Source app found"

echo ""
echo "================================"
echo "Step 1: Copying NativeBridgeApp..."
echo "================================"

# Check if we're already in NativeBridge directory
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"NativeBridge"* ]]; then
    DEST_DIR="$CURRENT_DIR"
    print_info "Already in NativeBridge directory: $DEST_DIR"
else
    DEST_DIR="/Users/himanshukukreja/autoflow/NativeBridge"
    print_info "Setting up in: $DEST_DIR"
fi

# Copy files if not already copied
if [ ! -f "$DEST_DIR/App.tsx" ] || [ ! -d "$DEST_DIR/android" ]; then
    print_info "Copying source files..."

    # Copy all necessary files
    cp -R "$SOURCE_APP/android" "$DEST_DIR/" 2>/dev/null || true
    cp -R "$SOURCE_APP/ios" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/App.tsx" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/index.js" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/app.json" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/.gitignore" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/.eslintrc.js" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/.prettierrc.js" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/babel.config.js" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/metro.config.js" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/tsconfig.json" "$DEST_DIR/" 2>/dev/null || true
    cp "$SOURCE_APP/jest.config.js" "$DEST_DIR/" 2>/dev/null || true

    print_success "Files copied successfully"
else
    print_warning "Files already exist, skipping copy"
fi

cd "$DEST_DIR"

echo ""
echo "================================"
echo "Step 2: Updating package names..."
echo "================================"

# Update AndroidManifest.xml
if grep -q "com.nativebridgeapp" android/app/src/main/AndroidManifest.xml 2>/dev/null; then
    print_info "Updating AndroidManifest.xml..."
    sed -i '' 's/com.nativebridgeapp/com.nativebridge.io/g' android/app/src/main/AndroidManifest.xml
    print_success "AndroidManifest.xml updated"
else
    print_warning "AndroidManifest.xml already updated or not found"
fi

# Update build.gradle
if grep -q "com.nativebridgeapp" android/app/build.gradle 2>/dev/null; then
    print_info "Updating build.gradle..."
    sed -i '' 's/com.nativebridgeapp/com.nativebridge.io/g' android/app/build.gradle
    print_success "build.gradle updated"
else
    print_warning "build.gradle already updated or not found"
fi

# Update app.json
if [ -f "app.json" ]; then
    print_info "Updating app.json..."
    sed -i '' 's/NativeBridgeApp/NativeBridge/g' app.json
    print_success "app.json updated"
fi

# Update package name in Java/Kotlin files
JAVA_DIR="android/app/src/main/java/com"
if [ -d "$JAVA_DIR/nativebridgeapp" ]; then
    print_info "Renaming Java package directory..."

    # Create new directory structure
    mkdir -p "$JAVA_DIR/nativebridge/io"

    # Move files
    if [ -f "$JAVA_DIR/nativebridgeapp/MainActivity.kt" ]; then
        mv "$JAVA_DIR/nativebridgeapp/MainActivity.kt" "$JAVA_DIR/nativebridge/io/"
    fi
    if [ -f "$JAVA_DIR/nativebridgeapp/MainApplication.kt" ]; then
        mv "$JAVA_DIR/nativebridgeapp/MainApplication.kt" "$JAVA_DIR/nativebridge/io/"
    fi

    # Remove old directory
    rm -rf "$JAVA_DIR/nativebridgeapp"

    # Update package declarations in Kotlin files
    if [ -f "$JAVA_DIR/nativebridge/io/MainActivity.kt" ]; then
        sed -i '' 's/package com.nativebridgeapp/package com.nativebridge.io/g' "$JAVA_DIR/nativebridge/io/MainActivity.kt"
    fi
    if [ -f "$JAVA_DIR/nativebridge/io/MainApplication.kt" ]; then
        sed -i '' 's/package com.nativebridgeapp/package com.nativebridge.io/g' "$JAVA_DIR/nativebridge/io/MainApplication.kt"
    fi

    print_success "Java package directory updated"
else
    print_warning "Java package directory already updated or not found"
fi

# Update strings.xml
STRINGS_XML="android/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_XML" ]; then
    if grep -q "NativeBridgeApp" "$STRINGS_XML"; then
        print_info "Updating app name in strings.xml..."
        sed -i '' 's/<string name="app_name">NativeBridgeApp<\/string>/<string name="app_name">NativeBridge<\/string>/g' "$STRINGS_XML"
        print_success "strings.xml updated"
    else
        print_warning "strings.xml already updated"
    fi
fi

echo ""
echo "================================"
echo "Step 3: Installing dependencies..."
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages..."
    npm install --legacy-peer-deps
    print_success "Dependencies installed"
else
    print_warning "node_modules exists. Skipping npm install."
    print_info "To reinstall, run: rm -rf node_modules && npm install --legacy-peer-deps"
fi

echo ""
echo "================================"
echo "Step 4: Verifying App.tsx..."
echo "================================"

# Check if App.tsx has been updated with authentication gate
if grep -q "isAuthenticated" App.tsx; then
    print_success "App.tsx appears to have authentication gate"
else
    print_warning "App.tsx may need to be updated with authentication gate"
    print_info "Please replace App.tsx with the version from this repository"
    print_info "See: /Users/himanshukukreja/autoflow/NativeBridge/App.tsx"
fi

echo ""
echo "================================"
echo "Step 5: Building Android APK..."
echo "================================"

cd android

print_info "Cleaning previous builds..."
./gradlew clean

print_info "Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    print_success "Debug APK built successfully"

    DEBUG_APK="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$DEBUG_APK" ]; then
        APK_SIZE=$(du -h "$DEBUG_APK" | cut -f1)
        print_success "APK Location: android/$DEBUG_APK"
        print_success "APK Size: $APK_SIZE"
    fi
else
    print_error "Debug build failed"
    cd ..
    exit 1
fi

# Optional: Build release APK
read -p "Do you want to build release APK? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Building release APK..."
    ./gradlew assembleRelease

    if [ $? -eq 0 ]; then
        print_success "Release APK built successfully"

        RELEASE_APK="app/build/outputs/apk/release/app-release.apk"
        if [ -f "$RELEASE_APK" ]; then
            APK_SIZE=$(du -h "$RELEASE_APK" | cut -f1)
            print_success "APK Location: android/$RELEASE_APK"
            print_success "APK Size: $APK_SIZE"
        fi
    else
        print_error "Release build failed"
    fi
fi

cd ..

echo ""
echo "================================"
echo "Step 6: Organizing APK files..."
echo "================================"

# Create builds directory
mkdir -p builds

# Copy debug APK
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    print_info "Copying debug APK to builds folder..."
    cp android/app/build/outputs/apk/debug/app-debug.apk builds/nativebridge-debug-v1.apk
    print_success "Debug APK copied to: builds/nativebridge-debug-v1.apk"
fi

# Copy release APK if exists
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    print_info "Copying release APK to builds folder..."
    cp android/app/build/outputs/apk/release/app-release.apk builds/nativebridge-v1.apk
    print_success "Release APK copied to: builds/nativebridge-v1.apk"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
print_success "NativeBridge app is ready!"
echo ""
echo "📱 APK Files:"
if [ -f "builds/nativebridge-debug-v1.apk" ]; then
    echo "   - Debug: builds/nativebridge-debug-v1.apk"
fi
if [ -f "builds/nativebridge-v1.apk" ]; then
    echo "   - Release: builds/nativebridge-v1.apk"
fi
echo ""
echo "📚 Documentation:"
echo "   - README.md - Overview and quick start"
echo "   - SETUP_GUIDE.md - Detailed setup instructions"
echo "   - BIOMETRIC_IMPLEMENTATION.md - Technical documentation"
echo ""
echo "🧪 Testing:"
echo "   - Install: adb install builds/nativebridge-debug-v1.apk"
echo "   - Or connect to LambdaTest device and install"
echo ""
echo "🔐 App Behavior:"
echo "   - On launch, biometric authentication is required"
echo "   - After successful authentication, all features are unlocked"
echo "   - Includes all NativeBridgeApp features with security gate"
echo ""
print_success "Setup script completed successfully!"
