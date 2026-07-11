# Sync the canonical skills into the user-level skill dir.
# Run from anywhere:  powershell scripts/install-skills.ps1
#
# Default target is ~/.claude/skills ONLY. Current Cursor discovers that same
# directory through its compatibility roots (~/.claude/skills, ~/.codex/skills,
# ...), so a second copy in ~/.cursor/skills would list every skill twice in
# Cursor's slash menu. Pass -IncludeCursor only for older Cursor builds that
# read ~/.cursor/skills exclusively.
param([switch]$IncludeCursor)
$ErrorActionPreference = "Stop"

$src = Join-Path $PSScriptRoot "..\skills"
$targets = @("$HOME\.claude\skills")
if ($IncludeCursor) { $targets += "$HOME\.cursor\skills" }

foreach ($t in $targets) {
  New-Item -ItemType Directory -Force -Path $t | Out-Null
  Get-ChildItem -Directory $src | ForEach-Object {
    $dest = Join-Path $t $_.Name
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $_.FullName "SKILL.md") $dest -Force
    Write-Host "installed $($_.Name) -> $dest"
  }
}
Write-Host "done - one source of truth (skills/), one install root (Cursor reads it too)."
