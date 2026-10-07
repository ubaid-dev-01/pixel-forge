# PixelForge unified tests. Prefer: npm run test:all
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
node scripts/test-all.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
