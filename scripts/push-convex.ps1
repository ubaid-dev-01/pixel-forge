# Run this in YOUR terminal (interactive) — Cursor agent cannot complete Convex login.
# Pushes PixelForge Convex functions so auth:signIn exists.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "1) Logging into Convex (browser will open)..." -ForegroundColor Cyan
npx convex login

Write-Host "2) Linking / pushing to your deployment..." -ForegroundColor Cyan
# Uses existing deployment if configured; otherwise prompts to select one.
npx convex dev --once

Write-Host "3) Auth env vars (if not set yet)..." -ForegroundColor Cyan
Write-Host "   Dashboard → Environment Variables → paste from .convex-auth-keys.env"
Write-Host "   Or run: node scripts/write-auth-keys.mjs"
Write-Host ""
Write-Host "Done. Keep this running while developing:" -ForegroundColor Green
Write-Host "  npx convex dev"
Write-Host "Then retry Sign up on http://localhost:3000/signup"
