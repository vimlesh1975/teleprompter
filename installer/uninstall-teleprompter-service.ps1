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
$RuntimeRoot = Join-Path $ScriptRoot ".service-runtime"
$WinSWExe = Join-Path $RuntimeRoot "teleprompter-service.exe"

if (-not (Test-Path $WinSWExe)) {
    Write-Host "Service wrapper not found at $WinSWExe"
    exit 0
}

try {
    & $WinSWExe stop
} catch {
}

Start-Sleep -Seconds 2
& $WinSWExe uninstall
