#!/bin/bash
# BotToll Release Script

VERSION="1.0.0"
echo "Building BotToll v$VERSION..."

# Clean and build
npm run clean
npm run build

# Create release package
mkdir -p release
cp -r dist release/
cp server.ts release/
cp package.json release/
cp README.md release/
cp BUILD.md release/

# Create zip
zip -r bottoll-v$VERSION.zip release/

echo "Release v$VERSION created: bottoll-v$VERSION.zip"
