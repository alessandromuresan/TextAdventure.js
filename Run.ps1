param(
    [switch] $NoBuild,
    [switch] $NoInstall,
    [switch] $Debug,
    [switch] $Devmode,
    [switch] $DeleteSaves,

    [int] $Port = 3000
)

$ErrorActionPreference = "Stop"

Write-Host ""

if (!$NoInstall) {
    npm ci
} else {
    Write-Warning "Make sure to run 'npm ci' before running this script"
}

if (!$NoBuild) {
    npm run build
} else {
    Write-Warning "Make sure to run 'npm run build' before running this script"
}

$SavesDirectory = Join-Path $PSScriptRoot "saves"

if ($DeleteSaves -and (Test-Path $SavesDirectory)) {
    Write-Warning "Deleting old save directory: $SavesDirectory"
    Remove-Item -Path $SavesDirectory -Force -Recurse | Out-Null
}

if (!(Test-Path $SavesDirectory)) {
    New-Item -Path $SavesDirectory -ItemType "Directory" | Out-Null
}

$ENV:NECRO_PORT = $Port
$ENV:NECRO_SAVESDIRECTORY = $SavesDirectory
$ENV:NECRO_DEBUG = if ($Debug) { "true" } else { "false" }
$ENV:NECRO_DEVMODE = if ($Devmode) { "true" } else { "false" }

Start-Process "http://localhost:$($Port)"

npm start
