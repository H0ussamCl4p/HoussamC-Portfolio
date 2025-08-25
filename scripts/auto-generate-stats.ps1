param(
    [switch]$RunWorkflow,
    [switch]$Debug,
    [string]$Year = (Get-Date).Year,
    [string]$User = $env:GITHUB_STATS_USER
)

if (-not $User) {
    $User = Read-Host "Enter GitHub username to fetch stats for (default: H0ussamCl4p)"
    if (-not $User) { $User = 'H0ussamCl4p' }
}

Write-Host "Using user: $User and year: $Year"

# Optionally run workflow instead of local generator
if ($RunWorkflow) {
    # This helper now uses the repository's Actions token and the workflow dispatch + artifact download flow.
    Write-Host "Dispatching generate-github-stats workflow (no PAT required)..."
    gh workflow run generate-github-stats.yml --repo H0ussamCl4p/HoussamC-Portfolio --ref main

    Write-Host "Workflow dispatched. Polling for completion..."
    Start-Sleep -Seconds 3
    do {
        $runs = gh run list --repo H0ussamCl4p/HoussamC-Portfolio --workflow=generate-github-stats.yml --json number,conclusion,status -L 1
        $obj = $runs | ConvertFrom-Json
        $status = $obj.status
        Write-Host "Workflow status: $status"
        if ($status -ne 'completed') { Start-Sleep -Seconds 4 }
    } while ($status -ne 'completed')

    Write-Host "Downloading artifact to .\artifacts..."
    gh run download --repo H0ussamCl4p/HoussamC-Portfolio --name github-stats --dir .\artifacts
    Copy-Item -Path .\artifacts\github-stats.json -Destination .\public\github-stats.json -Force
    Write-Host "Copied artifact to public/github-stats.json"
} else {
    Write-Host "Running generator locally (debug: $Debug)"
    $env:GITHUB_STATS_USER = $User
    $env:YEAR = $Year
    if ($Debug) {
        node .\scripts\fetch-github-stats.js --debug
    } else {
        node .\scripts\fetch-github-stats.js
    }
}

Write-Host "Done."
