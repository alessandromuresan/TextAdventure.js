param(
    [switch] $Production,
    [switch] $NoBuild,
    [switch] $NoInstall,
    [switch] $Debug,
    [switch] $Devmode,
    [switch] $DeleteSave,
    [switch] $MusicEnabled,

    [ValidateRange(0, 100)]
    [int] $MusicVolume = 50,

    $RootDirectory = $PSScriptRoot,
    $EngineDirectory = "$($PSScriptRoot)/engine",
    $ClientDirectory = "$($PSScriptRoot)/client"
)

$ErrorActionPreference = "Stop"

function Main {

    Build-Engine
    Build-Client
}

function Build-Engine {

    cd $EngineDirectory

    Write-Dev "Building engine"

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

    $SaveFile = Join-Path $PSScriptRoot "savefile.json"

    if ($DeleteSave -and (Test-Path $SaveFile)) {
        Write-Warning "Deleting old save file: $SaveFile"
        Remove-Item -Path $SaveFile -Force | Out-Null
    }

    $ENV:NECRO_SAVEFILE = $SaveFile
    $ENV:NECRO_DEBUG = if ($Debug) { "true" } else { "false" }
    $ENV:NECRO_DEVMODE = if ($Devmode) { "true" } else { "false" }
    $ENV:NECRO_MUSICENABLED = if ($MusicEnabled) { "true" } else { "false" }
    $ENV:NECRO_MUSICVOLUME = $MusicVolume

    cd $RootDirectory
}

function Build-Client {

    cd $ClientDirectory

    Write-Dev "Installing Angular CLI"

    npm install -g @angular/cli@8.3.21

    Write-Dev "Building client"

    if ($Production) {
        ng build --configuration=production
    } else {
        ng build
    }

    if (!$Production) {
        ng serve
    }

    cd $RootDirectory
}

function Write-Dev {

    param(
        [Parameter(Mandatory)]
        [string] $Message
    )

    Write-Host ([System.Environment]::NewLine + "> " + $Message + [System.Environment]::NewLine) -ForegroundColor "Cyan"
}

Main
