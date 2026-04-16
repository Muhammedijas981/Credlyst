# Credlyst Extension — Package Script
# Creates a production-ready ZIP for Chrome Web Store submission
# Run from the repo root: .\pack-extension.ps1

$ErrorActionPreference = "Stop"

$SOURCE_DIR = "extension"
$OUTPUT_DIR = "dist"
$ZIP_NAME   = "credlyst-extension.zip"

Write-Host ""
Write-Host "Credlyst Extension Packager" -ForegroundColor Cyan
Write-Host "===========================`n" -ForegroundColor Cyan

# ── Validate source ───────────────────────────────────────────────────────────
if (-not (Test-Path $SOURCE_DIR)) {
    Write-Error "Extension directory not found at '$SOURCE_DIR'. Run from repo root."
    exit 1
}

$manifest = "$SOURCE_DIR\manifest.json"
if (-not (Test-Path $manifest)) {
    Write-Error "manifest.json not found in '$SOURCE_DIR'."
    exit 1
}

# ── Check required files ──────────────────────────────────────────────────────
$required = @(
    "manifest.json",
    "background.js",
    "content.js",
    "finder\finder.css",
    "finder\fuse.min.js",
    "icons\icon16.png",
    "icons\icon48.png",
    "icons\icon128.png",
    "popup\popup.html",
    "popup\popup.css",
    "popup\popup.js"
)

$missing = @()
foreach ($f in $required) {
    if (-not (Test-Path "$SOURCE_DIR\$f")) { $missing += $f }
}

if ($missing.Count -gt 0) {
    Write-Host "Missing files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "All required files present." -ForegroundColor Green

# ── Create output directory ───────────────────────────────────────────────────
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null

$zipPath = Join-Path $OUTPUT_DIR $ZIP_NAME

# Remove existing zip
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# ── Zip the extension folder ──────────────────────────────────────────────────
Write-Host "`nPackaging extension..."
Compress-Archive -Path "$SOURCE_DIR\*" -DestinationPath $zipPath -CompressionLevel Optimal

$size = [math]::Round((Get-Item $zipPath).Length / 1KB, 1)
Write-Host "Created: $zipPath ($size KB)" -ForegroundColor Green

Write-Host @"

Next steps for Chrome Web Store:
  1. Go to https://chrome.google.com/webstore/devconsole
  2. Click 'Add new item'
  3. Upload: $zipPath
  4. Fill in the store listing (title, description, screenshots)
  5. Submit for review

For local testing (Developer Mode):
  1. Open chrome://extensions
  2. Enable Developer Mode (top-right toggle)
  3. Click 'Load unpacked' and select: $(Resolve-Path $SOURCE_DIR)

"@ -ForegroundColor White
