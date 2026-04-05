$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackageScript = Join-Path $ScriptRoot "package-deployment.ps1"
$IssFile = Join-Path $ScriptRoot "teleprompter-service-installer.iss"
$OutputRoot = Join-Path $ScriptRoot "output"
$AppRoot = Split-Path -Parent $ScriptRoot

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

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

$ISCC = $Candidates[0]
& $ISCC $IssFile
if ($LASTEXITCODE -ne 0) {
    throw "Inno Setup compilation failed."
}
