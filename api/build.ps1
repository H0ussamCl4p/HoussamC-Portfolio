#!/usr/bin/env pwsh
# Build script for Rust serverless functions and WASM

$ErrorActionPreference = "Stop"

Write-Host "🦀 Building Portfolio Rust APIs..." -ForegroundColor Cyan

# ============================================
# Environment Variable Validation
# ============================================
Write-Host "`n🔐 Validating environment variables..." -ForegroundColor Yellow

$envWarnings = @()
$envErrors = @()

# Google Drive CMS - Required for production
if (-not $env:GOOGLE_SERVICE_ACCOUNT_JSON) {
    # Check for base64 encoded fallback
    if ($env:GOOGLE_SA_BASE64) {
        Write-Host "  ✓ GOOGLE_SA_BASE64 found (base64 encoded)" -ForegroundColor Green
    }
    else {
        $envWarnings += "GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SA_BASE64 not set - Google Drive CMS will be unavailable"
    }
}
else {
    # Validate JSON structure
    try {
        $saJson = $env:GOOGLE_SERVICE_ACCOUNT_JSON | ConvertFrom-Json
        if (-not $saJson.client_email -or -not $saJson.private_key) {
            $envErrors += "GOOGLE_SERVICE_ACCOUNT_JSON missing required fields (client_email, private_key)"
        }
        else {
            Write-Host "  ✓ GOOGLE_SERVICE_ACCOUNT_JSON validated (client: $($saJson.client_email))" -ForegroundColor Green
        }
    }
    catch {
        $envErrors += "GOOGLE_SERVICE_ACCOUNT_JSON contains invalid JSON"
    }
}

# Google Drive Root Folder IDs - Required for nested folder structure
$driveFolders = @{
    "DRIVE_PROJECTS_FOLDER_ID" = "Projects folder"
    "DRIVE_BLOG_FOLDER_ID" = "Blog folder"
    "DRIVE_CANVA_FOLDER_ID" = "Canva folder"
}

$missingFolders = @()
foreach ($folderVar in $driveFolders.Keys) {
    $folderValue = [Environment]::GetEnvironmentVariable($folderVar)
    if ($folderValue) {
        Write-Host "  ✓ $folderVar configured" -ForegroundColor Green
    }
    else {
        $missingFolders += "$folderVar ($($driveFolders[$folderVar]))"
    }
}

if ($missingFolders.Count -gt 0) {
    $envWarnings += "Missing Drive folder IDs: $($missingFolders -join ', ')"
}

# Optional: Vercel-specific environment
if ($env:VERCEL_ENV) {
    Write-Host "  ℹ️  Vercel environment: $($env:VERCEL_ENV)" -ForegroundColor Cyan
}

# Display warnings
foreach ($warning in $envWarnings) {
    Write-Host "  ⚠️  $warning" -ForegroundColor Yellow
}

# Display errors and exit if critical
if ($envErrors.Count -gt 0) {
    foreach ($err in $envErrors) {
        Write-Host "  ❌ $err" -ForegroundColor Red
    }
    
    # Only fail in production
    if ($env:VERCEL_ENV -eq "production") {
        Write-Host "`n❌ Critical environment variables missing in production!" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "`n⚠️  Continuing build despite env warnings (non-production)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# Rust Toolchain Check
# ============================================

# Check if Rust is installed
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust not found. Install from https://rustup.rs" -ForegroundColor Red
    exit 1
}

Push-Location $PSScriptRoot

try {
    # Build serverless functions
    Write-Host "`n📦 Building serverless functions (release mode)..." -ForegroundColor Yellow
    cargo build --release

    if ($LASTEXITCODE -ne 0) {
        throw "Cargo build failed"
    }

    Write-Host "✅ Serverless functions built successfully!" -ForegroundColor Green

    # Run tests
    Write-Host "`n🧪 Running tests..." -ForegroundColor Yellow
    cargo test

    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed"
    }

    Write-Host "✅ All tests passed!" -ForegroundColor Green

    # Check binary sizes
    Write-Host "`n📊 Binary sizes:" -ForegroundColor Yellow
    $binaries = @(
        "target/release/mdx-parse.exe",
        "target/release/design-manifest.exe"
    )

    foreach ($bin in $binaries) {
        if (Test-Path $bin) {
            $size = (Get-Item $bin).Length / 1MB
            $name = Split-Path $bin -Leaf
            Write-Host "  $name : $([math]::Round($size, 2)) MB"
        }
    }

    # Build WASM (optional)
    if (Get-Command wasm-pack -ErrorAction SilentlyContinue) {
        Write-Host "`n🌐 Building WASM module..." -ForegroundColor Yellow

        # Create wasm output directory
        $wasmDir = Join-Path $PSScriptRoot ".." "public" "wasm"
        if (-not (Test-Path $wasmDir)) {
            New-Item -ItemType Directory -Path $wasmDir -Force | Out-Null
        }

        wasm-pack build --target web --out-dir $wasmDir

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ WASM module built to public/wasm/" -ForegroundColor Green

            # Show WASM size
            $wasmFile = Join-Path $wasmDir "portfolio_wasm_bg.wasm"
            if (Test-Path $wasmFile) {
                $wasmSize = (Get-Item $wasmFile).Length / 1KB
                Write-Host "  WASM size: $([math]::Round($wasmSize, 2)) KB"
            }
        }
        else {
            Write-Host "⚠️ WASM build failed (optional)" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "`n⚠️ wasm-pack not found. Skipping WASM build." -ForegroundColor Yellow
        Write-Host "  Install with: cargo install wasm-pack" -ForegroundColor Gray
    }

    Write-Host "`n✨ Build complete!" -ForegroundColor Cyan

}
finally {
    Pop-Location
}
