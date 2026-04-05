$ErrorActionPreference = "Stop"

function Assert-Admin {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($id)

    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "Please run this script in an elevated PowerShell window (Run as Administrator)."
    }
}

Assert-Admin

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppRoot = Split-Path -Parent $ScriptRoot

Set-Location $AppRoot

$ServiceName = "teleprompter-service"
$ServiceRuntime = Join-Path $ScriptRoot ".service-runtime"
$NodeVersion = "23.11.1"
$NodeZipName = "node-v23.11.1-win-x64.zip"
$NodeZipUrl = "https://nodejs.org/dist/v23.11.1/$NodeZipName"
$NodeZipPath = Join-Path $ServiceRuntime $NodeZipName
$NodeExtractRoot = Join-Path $ServiceRuntime "node-dist"
$NodeHome = Join-Path $NodeExtractRoot "node-v23.11.1-win-x64"
$NodeExe = Join-Path $NodeHome "node.exe"

$WinSWVersion = "2.8.0"
$WinSWUrl = "https://github.com/winsw/winsw/releases/download/v2.8.0/WinSW.NET4.exe"
$WinSWExe = Join-Path $ServiceRuntime "$ServiceName.exe"
$WinSWXml = Join-Path $ServiceRuntime "$ServiceName.xml"
$LogsDir = Join-Path $ServiceRuntime "logs"

$ServerJs = Join-Path $AppRoot "server.js"
$PackageJson = Join-Path $AppRoot "package.json"
$NextBuildDir = Join-Path $AppRoot ".next"

if (-not (Test-Path $ServerJs)) {
    throw "server.js not found in $AppRoot"
}

if (-not (Test-Path $PackageJson)) {
    throw "package.json not found in $AppRoot"
}

if (-not (Test-Path $NextBuildDir)) {
    throw ".next build output not found in $AppRoot"
}

New-Item -ItemType Directory -Force -Path $ServiceRuntime | Out-Null
New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null
New-Item -ItemType Directory -Force -Path $NodeExtractRoot | Out-Null

if (Test-Path $WinSWExe) {
    Write-Host "Stopping existing service if present..."
    try {
        & $WinSWExe stop | Out-Null
    } catch {
    }
    Start-Sleep -Seconds 2
}

if (-not (Test-Path $NodeExe)) {
    Write-Host "Downloading portable Node.js $NodeVersion..."
    Invoke-WebRequest -Uri $NodeZipUrl -OutFile $NodeZipPath

    Write-Host "Extracting Node.js..."
    if (Test-Path $NodeHome) {
        Remove-Item -LiteralPath $NodeHome -Recurse -Force
    }
    Expand-Archive -Path $NodeZipPath -DestinationPath $NodeExtractRoot -Force
} else {
    Write-Host "Portable Node.js already present, skipping download and extraction."
}

if (-not (Test-Path $NodeExe)) {
    throw "Bundled node.exe was not found after extraction: $NodeExe"
}

Write-Host "Bundled Node version:"
& $NodeExe -v

Write-Host "Using packaged app files and prebuilt .next output."

Write-Host "Downloading WinSW $WinSWVersion..."
Invoke-WebRequest -Uri $WinSWUrl -OutFile $WinSWExe

$xml = @"
<service>
  <id>$ServiceName</id>
  <name>Teleprompter Service</name>
  <description>Teleprompter Next.js + Express + Socket.IO server</description>
  <executable>$NodeExe</executable>
  <arguments>server.js</arguments>
  <workingdirectory>$AppRoot</workingdirectory>
  <env name="NODE_ENV" value="production" />
  <env name="PORT" value="14000" />
  <logpath>$LogsDir</logpath>
  <log mode="roll" />
  <startmode>Automatic</startmode>
  <stoptimeout>15 sec</stoptimeout>
  <onfailure action="restart" delay="10 sec" />
  <onfailure action="restart" delay="20 sec" />
  <onfailure action="restart" delay="30 sec" />
</service>
"@

Set-Content -Path $WinSWXml -Value $xml -Encoding UTF8

Write-Host "Uninstalling existing service if present..."
try {
    & $WinSWExe uninstall | Out-Null
} catch {
}

Write-Host "Installing Windows service..."
& $WinSWExe install
if ($LASTEXITCODE -ne 0) {
    throw "WinSW install failed."
}

Write-Host "Starting Windows service..."
& $WinSWExe start
if ($LASTEXITCODE -ne 0) {
    throw "WinSW start failed."
}
