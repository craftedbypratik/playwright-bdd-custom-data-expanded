$ErrorActionPreference = "Stop"

Write-Host "Removing package-lock.json..."
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

Write-Host "Updating all dependencies to latest versions..."
npx npm-check-updates -u

Write-Host "Installing updated dependencies..."
npm install

Write-Host "Done. package.json has been updated to latest versions."
