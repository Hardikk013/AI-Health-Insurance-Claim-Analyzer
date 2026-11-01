# ClaimFight One-Click Setup Script for Windows PowerShell

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " ClaimFight Setup & Verification Launcher " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Check Node
Write-Host "`n[1/3] Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js not detected. Please install Node.js v20+ or v24+." -ForegroundColor Red
    exit 1
}
Write-Host "Detected Node.js $nodeVersion" -ForegroundColor Green

# 2. Generate Sample PDFs
Write-Host "`n[2/3] Generating watermarked sample claim documents in public/samples..." -ForegroundColor Yellow
node scripts/generate_sample_pdfs.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate sample documents." -ForegroundColor Red
    exit 1
}

# 3. Test Build
Write-Host "`n[3/3] Compiling TypeScript and Vite production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}
Write-Host "`nBuild succeeded! To start the development server, run:" -ForegroundColor Green
Write-Host "npm run dev`n" -ForegroundColor Cyan
