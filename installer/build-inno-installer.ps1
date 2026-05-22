$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackageScript = Join-Path $ScriptRoot "package-deployment.ps1"
$IssFile = Join-Path $ScriptRoot "teleprompter-service-installer.iss"
$OutputRoot = Join-Path $ScriptRoot "output"
$AppRoot = Split-Path -Parent $ScriptRoot

function Get-TeleprompterTimestampedName {
    $Now = Get-Date
    return "Teleprompter_{0}_{1}_{2}" -f $Now.ToString("ddMMyyyy"), $Now.ToString("HHmm"), $Now.ToString("ss")
}

function Reset-InstallerOutput {
    param(
        [string] $Path,
        [string] $Root
    )

    $FullPath = [System.IO.Path]::GetFullPath($Path)
    $FullRoot = [System.IO.Path]::GetFullPath($Root)
    $ParentPath = Split-Path -Parent $FullPath
    $FolderName = Split-Path -Leaf $FullPath

    if ($ParentPath -ne $FullRoot -or $FolderName -ne "output") {
        throw "Refusing to clear unexpected installer output path: $FullPath"
    }

    if (Test-Path $FullPath) {
        Remove-Item -LiteralPath $FullPath -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path $FullPath | Out-Null
}

$Candidates = @(@(
    (Get-Command ISCC.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe")
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique)

if ($Candidates.Count -eq 0) {
    throw "Inno Setup compiler (ISCC.exe) was not found."
}

Push-Location $AppRoot
try {
    Write-Host "Building app locally before packaging..."
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Local npm run build failed."
    }
} finally {
    Pop-Location
}

& powershell -ExecutionPolicy Bypass -File $PackageScript
if ($LASTEXITCODE -ne 0) {
    throw "Packaging step failed."
}

Reset-InstallerOutput -Path $OutputRoot -Root $ScriptRoot

$ISCC = $Candidates[0]
$InstallerBaseFilename = Get-TeleprompterTimestampedName
Write-Host "Installer output filename: $InstallerBaseFilename.exe"

& $ISCC "/DInstallerBaseFilename=$InstallerBaseFilename" $IssFile
if ($LASTEXITCODE -ne 0) {
    throw "Inno Setup compilation failed."
}
