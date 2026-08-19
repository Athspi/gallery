#!/bin/bash
set -e

echo "=========================================="
echo "  Google AI Edge Gallery - Android Build  "
echo "=========================================="

cd "$(dirname "$0")/Android/src"

chmod +x ./gradlew

echo "--> Building Release and Debug APKs..."
./gradlew assembleRelease assembleDebug

echo ""
echo "=========================================="
echo "  Build Completed Successfully!           "
echo "=========================================="
echo "Saved APK Locations:"
echo "  1. Release APK: Android/src/app/build/outputs/apk/release/app-release.apk"
echo "  2. Debug APK:   Android/src/app/build/outputs/apk/debug/app-debug.apk"
echo "=========================================="
