<#
.SYNOPSIS
  Local test helper: generate GitHub stats and build the site with one command.

.DESCRIPTION
  This script mirrors the CI flow while avoiding storing personal tokens in the repo.
  - Prefer copying a downloaded artifact into `public/github-stats.json` for local testing.
  - Alternatively, set `GITHUB_TOKEN` in your environment and run the generator locally.

.EXAMPLE
  # Copy a previously-downloaded artifact
  Copy-Item .\artifacts\github-stats.json .\public\github-stats.json -Force
  .\scripts\local-test.ps1 -Build

  # Run generator locally if you have GITHUB_TOKEN available
  $env:GITHUB_TOKEN = '<YOUR_TOKEN>'
  .\scripts\local-test.ps1 -GenerateOnly
#>

param(
  [switch]$Build,
  [switch]$GenerateOnly
)

function Fail($msg) {
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Fail 'npm is not installed or not in PATH. Install Node.js and npm first.'
}

try {
  if ($GenerateOnly) {
    if (-not $env:GITHUB_TOKEN) {
      Write-Host 'GITHUB_TOKEN not found. Skipping live generation. Copy a downloaded artifact to public/github-stats.json to test fallback.' -ForegroundColor Yellow
      exit 0
    }
    Write-Host 'Running generator: npm run gen:github-stats'
    npm run gen:github-stats
    if ($LASTEXITCODE -ne 0) { Fail 'Generator failed. See output above.' }
  }
  elseif ($Build) {
    Write-Host 'Running full build: npm run build'
    npm run build
    if ($LASTEXITCODE -ne 0) { Fail 'Build failed. See output above.' }
  }
  else {
    Write-Host 'Starting dev server: npm run dev'
    Write-Host "Open http://localhost:3000 in your browser to inspect the site"
    npm run dev
    exit 0
  }

  # Verification step: check for public/github-stats.json
  $statsPath = Join-Path -Path (Get-Location) -ChildPath 'public\github-stats.json'
  if (Test-Path $statsPath) {
    Write-Host "Found generated file: $statsPath" -ForegroundColor Green
    try {
      $json = Get-Content $statsPath -Raw | ConvertFrom-Json
      Write-Host "generatedAt: $($json.generatedAt)"
      Write-Host "user: $($json.user)  year: $($json.year)"
      Write-Host "totalContributions: $($json.totalContributions)"
      Write-Host "commits: $($json.totalCommitContributions)  PRs: $($json.totalPullRequestContributions)  issues: $($json.totalIssueContributions)"
      if ($json.repo) { Write-Host "repo stars: $($json.repo.stars) forks: $($json.repo.forks)" }
    } catch {
      Write-Host 'Could not parse public/github-stats.json — raw content:' -ForegroundColor Yellow
      Get-Content $statsPath -Raw
    }
  }
  else {
    Write-Host 'public/github-stats.json not found. If you need test data, copy a downloaded artifact to public/github-stats.json.' -ForegroundColor Yellow
  }

} finally {
  Write-Host 'Done.' -ForegroundColor Cyan
}
<#
.SYNOPSIS
  Local test helper: generate GitHub stats and build the site with one command.

.DESCRIPTION
  This script mirrors the CI flow while avoiding storing personal tokens in the repo.
  - Prefer copying a downloaded artifact into `public/github-stats.json` for local testing.
  - Alternatively, set `GITHUB_TOKEN` in your environment and run the generator locally.

.EXAMPLE
  # Copy a previously-downloaded artifact
  Copy-Item .\artifacts\github-stats.json .\public\github-stats.json -Force
  .\scripts\local-test.ps1 -Build

  # Run generator locally if you have GITHUB_TOKEN available
  $env:GITHUB_TOKEN = '<YOUR_TOKEN>'
  .\scripts\local-test.ps1 -GenerateOnly
#>

param(
  [switch]$Build,
  [switch]$GenerateOnly
)

function Fail($msg) {
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Fail 'npm is not installed or not in PATH. Install Node.js and npm first.'
}

try {
  if ($GenerateOnly) {
    if (-not $env:GITHUB_TOKEN) {
      Write-Host 'GITHUB_TOKEN not found. Skipping live generation. Copy a downloaded artifact to public/github-stats.json to test fallback.' -ForegroundColor Yellow
      exit 0
    }
    Write-Host 'Running generator: npm run gen:github-stats'
    npm run gen:github-stats
    if ($LASTEXITCODE -ne 0) { Fail 'Generator failed. See output above.' }
  }
  elseif ($Build) {
    Write-Host 'Running full build: npm run build'
    npm run build
    if ($LASTEXITCODE -ne 0) { Fail 'Build failed. See output above.' }
  }
  else {
    Write-Host 'Starting dev server: npm run dev'
    Write-Host "Open http://localhost:3000 in your browser to inspect the site"
    npm run dev
    exit 0
  }

  # Verification step: check for public/github-stats.json
  $statsPath = Join-Path -Path (Get-Location) -ChildPath 'public\github-stats.json'
  if (Test-Path $statsPath) {
    Write-Host "Found generated file: $statsPath" -ForegroundColor Green
    try {
      $json = Get-Content $statsPath -Raw | ConvertFrom-Json
      Write-Host "generatedAt: $($json.generatedAt)"
      Write-Host "user: $($json.user)  year: $($json.year)"
      Write-Host "totalContributions: $($json.totalContributions)"
      Write-Host "commits: $($json.totalCommitContributions)  PRs: $($json.totalPullRequestContributions)  issues: $($json.totalIssueContributions)"
      if ($json.repo) { Write-Host "repo stars: $($json.repo.stars) forks: $($json.repo.forks)" }
    } catch {
      Write-Host 'Could not parse public/github-stats.json — raw content:' -ForegroundColor Yellow
      Get-Content $statsPath -Raw
    }
  }
  else {
    Write-Host 'public/github-stats.json not found. If you need test data, copy a downloaded artifact to public/github-stats.json.' -ForegroundColor Yellow
  }

} finally {
  Write-Host 'Done.' -ForegroundColor Cyan
}
