$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppRoot = Split-Path -Parent $ScriptRoot
$BuildRoot = Join-Path $ScriptRoot "build"
$StageRoot = Join-Path $BuildRoot "app"

$ExcludeDirs = @(
    ".git",
    ".vscode",
    "installer",
    "installer\.service-runtime",
    "installer\build"
)

$ExcludeFiles = @(
    "dotenvdotlocal"
)

function Remove-IfExists {
    param([string] $Path)
    if (Test-Path $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force
    }
}

function Copy-Tree {
    param(
        [string] $Source,
        [string] $Destination,
        [string] $RelativePath = ""
    )

    $currentRelative = if ([string]::IsNullOrWhiteSpace($RelativePath)) { "" } else { $RelativePath }

    foreach ($dir in Get-ChildItem -LiteralPath $Source -Directory -Force) {
        $childRelative = if ($currentRelative) { Join-Path $currentRelative $dir.Name } else { $dir.Name }
        if ($ExcludeDirs -contains $childRelative) { continue }
        $targetDir = Join-Path $Destination $dir.Name
        New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        Copy-Tree -Source $dir.FullName -Destination $targetDir -RelativePath $childRelative
    }

    foreach ($file in Get-ChildItem -LiteralPath $Source -File -Force) {
        $childRelative = if ($currentRelative) { Join-Path $currentRelative $file.Name } else { $file.Name }
        if ($ExcludeFiles -contains $childRelative) { continue }
        Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $Destination $file.Name) -Force
    }
}

New-Item -ItemType Directory -Force -Path $BuildRoot | Out-Null
Remove-IfExists -Path $StageRoot
New-Item -ItemType Directory -Force -Path $StageRoot | Out-Null

Copy-Tree -Source $AppRoot -Destination $StageRoot
