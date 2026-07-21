# Apply repo-root .worktreeinclude into a worktree (Cursor shim / orch path).
# Claude Code reads .worktreeinclude natively; this script is for Cursor
# (.cursor/worktrees.json) and for /vl-start-feature after git worktree add.
#
# Usage (from worktree cwd, Cursor - ROOT_WORKTREE_PATH set by Cursor):
#   powershell -NoProfile -File scripts/apply-worktreeinclude.ps1
# Orch (explicit dest):
#   powershell -NoProfile -File <main>/scripts/apply-worktreeinclude.ps1 -Dest <worktree> [-Source <main-clone>]
# Dry-run:
#   ... -WhatIf

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$Source = "",
  [string]$Dest = ""
)

$ErrorActionPreference = "Stop"

function Get-MainCloneRootFromGit([string]$StartDir) {
  Push-Location $StartDir
  try {
    $common = (git rev-parse --path-format=absolute --git-common-dir 2>$null)
    if (-not $common) { return $null }
    $common = $common.Trim() -replace '/', '\'
    if ($common -match '^(?<root>.+)\\\.git\\worktrees\\') {
      return $Matches['root']
    }
    if ($common -match '^(?<root>.+)\\\.git$') {
      return $Matches['root']
    }
    return $null
  } finally {
    Pop-Location
  }
}

function Get-MainCloneRoot([string]$HintDir) {
  if ($env:ROOT_WORKTREE_PATH -and (Test-Path -LiteralPath $env:ROOT_WORKTREE_PATH)) {
    return (Resolve-Path -LiteralPath $env:ROOT_WORKTREE_PATH).Path
  }
  $start = if ($HintDir) { $HintDir } else { (Get-Location).Path }
  $root = Get-MainCloneRootFromGit $start
  if (-not $root) {
    throw "Could not resolve main clone root from '$start' (set ROOT_WORKTREE_PATH or -Source)."
  }
  return $root
}

function Get-WorktreeRoot([string]$HintDir) {
  if ($HintDir -and (Test-Path -LiteralPath $HintDir)) {
    return (Resolve-Path -LiteralPath $HintDir).Path
  }
  Push-Location (Get-Location).Path
  try {
    $top = git rev-parse --show-toplevel 2>$null
    if ($top) { return ($top.Trim() -replace '/', '\') }
  } finally {
    Pop-Location
  }
  return (Get-Location).Path
}

function Get-IncludePatterns([string]$IncludeFile) {
  if (-not (Test-Path -LiteralPath $IncludeFile)) { return @() }
  $patterns = @()
  foreach ($line in Get-Content -LiteralPath $IncludeFile) {
    $t = $line.Trim()
    if (-not $t -or $t.StartsWith('#')) { continue }
    $patterns += $t
  }
  return $patterns
}

function Expand-IncludePattern([string]$Root, [string]$Pattern) {
  # Prefer explicit relative paths. Trailing /** or / means directory tree.
  $norm = ($Pattern -replace '/', '\').TrimStart('\')
  $recursiveDir = $false
  if ($norm.EndsWith('\**')) {
    $norm = $norm.Substring(0, $norm.Length - 3)
    $recursiveDir = $true
  } elseif ($norm.EndsWith('\')) {
    $norm = $norm.TrimEnd('\')
    $recursiveDir = $true
  }

  if ($norm -match '[\*\?]') {
    $fullGlob = Join-Path $Root $norm
    return @(Get-ChildItem -Path $fullGlob -Force -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName })
  }

  $full = Join-Path $Root $norm
  if (-not (Test-Path -LiteralPath $full)) { return @() }
  $item = Get-Item -LiteralPath $full -Force
  if ($item.PSIsContainer -and $recursiveDir) {
    return @($item.FullName)
  }
  return @($item.FullName)
}

function Test-GitIgnored([string]$RepoRoot, [string]$FullPath) {
  Push-Location $RepoRoot
  try {
    $rel = $FullPath.Substring($RepoRoot.Length).TrimStart([char]'\', [char]'/').Replace('\', '/')
    git check-ignore -q -- $rel 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
  } finally {
    Pop-Location
  }
}

$destRoot = Get-WorktreeRoot $Dest
$sourceRoot = if ($Source) {
  (Resolve-Path -LiteralPath $Source).Path
} else {
  Get-MainCloneRoot $destRoot
}

$includeFile = Join-Path $sourceRoot '.worktreeinclude'
$patterns = @(Get-IncludePatterns $includeFile)
if ($patterns.Count -eq 0) {
  Write-Host "apply-worktreeinclude: no patterns (missing or empty .worktreeinclude) - no-op"
  exit 0
}

$copied = 0
$skipped = 0
foreach ($pattern in $patterns) {
  $expandedPaths = @(Expand-IncludePattern $sourceRoot $pattern)
  if ($expandedPaths.Count -eq 0) {
    Write-Host "apply-worktreeinclude: skip (missing): $pattern"
    $skipped++
    continue
  }
  foreach ($srcPath in $expandedPaths) {
    if (-not (Test-GitIgnored $sourceRoot $srcPath)) {
      $badRel = $srcPath.Substring($sourceRoot.Length).TrimStart([char]'\')
      Write-Host "apply-worktreeinclude: skip (not gitignored): $badRel"
      $skipped++
      continue
    }
    $rel = $srcPath.Substring($sourceRoot.Length).TrimStart([char]'\', [char]'/')
    $destPath = Join-Path $destRoot $rel
    $destParent = Split-Path -Parent $destPath
    if ($PSCmdlet.ShouldProcess($destPath, "Copy from $srcPath")) {
      if (-not (Test-Path -LiteralPath $destParent)) {
        New-Item -ItemType Directory -Path $destParent -Force | Out-Null
      }
      if (Test-Path -LiteralPath $srcPath -PathType Container) {
        if (Test-Path -LiteralPath $destPath) {
          Remove-Item -LiteralPath $destPath -Recurse -Force
        }
        Copy-Item -LiteralPath $srcPath -Destination $destPath -Recurse -Force
      } else {
        Copy-Item -LiteralPath $srcPath -Destination $destPath -Force
      }
      Write-Host "apply-worktreeinclude: copied $rel"
      $copied++
    } else {
      Write-Host "apply-worktreeinclude: would copy $rel"
      $copied++
    }
  }
}

Write-Host "apply-worktreeinclude: done (copied=$copied skipped=$skipped) source=$sourceRoot dest=$destRoot"
exit 0
