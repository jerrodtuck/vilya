# Sync the canonical skills into the Claude Code + Cursor user-level skill dirs.
# Run from anywhere:  pwsh scripts/install-skills.ps1   (or Windows PowerShell)
$ErrorActionPreference = "Stop"

$src = Join-Path $PSScriptRoot "..\skills"
$targets = @("$HOME\.claude\skills", "$HOME\.cursor\skills")

foreach ($t in $targets) {
  New-Item -ItemType Directory -Force -Path $t | Out-Null
  Get-ChildItem -Directory $src | ForEach-Object {
    $dest = Join-Path $t $_.Name
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $_.FullName "SKILL.md") $dest -Force
    Write-Host "installed $($_.Name) -> $dest"
  }
}
Write-Host "done — one source of truth (skills/), installed to both tools."
