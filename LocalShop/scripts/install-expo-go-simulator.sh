#!/bin/bash
# One-time: install Expo Go on the booted iOS Simulator (fixes "TypeError: fetch failed" when pressing i)
set -e

EXPO_GO_URL="https://github.com/expo/expo-go-releases/releases/download/Expo-Go-2.33.17/Expo-Go-2.33.17.tar.gz"
TMP_DIR="/tmp/expo-go-simulator-install"
APP_PATH="$TMP_DIR/ExpoGo.app"

echo "Opening Simulator..."
open -a Simulator

echo "Waiting for a booted simulator..."
for i in {1..30}; do
  if xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
    break
  fi
  sleep 1
done

if ! xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
  echo "No simulator is booted. In Simulator: File → Open Simulator → pick an iPhone."
  exit 1
fi

echo "Downloading Expo Go (SDK 53)..."
rm -rf "$TMP_DIR"
mkdir -p "$APP_PATH"
curl -L -o "$TMP_DIR/expo-go.tar.gz" "$EXPO_GO_URL"
tar -xzf "$TMP_DIR/expo-go.tar.gz" -C "$APP_PATH"

echo "Installing Expo Go on simulator..."
xcrun simctl install booted "$APP_PATH"

echo "Done. Expo Go is installed."
echo "Now run: cd LocalShop && npx expo start --localhost"
echo "Then press i, or open Expo Go on the simulator and enter: exp://127.0.0.1:8081"
