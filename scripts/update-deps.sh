#!/usr/bin/env bash
set -euo pipefail

echo "Removing package-lock.json..."
rm -f package-lock.json

echo "Updating all dependencies to latest versions..."
npx npm-check-updates -u

echo "Installing updated dependencies..."
npm install

echo "Done. package.json has been updated to latest versions."
