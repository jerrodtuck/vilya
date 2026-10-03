# Link the canonical skills into the user-level skill dir (directory junctions —
# no admin rights needed). Run from anywhere:  pwsh scripts/install-skills.ps1
#
# Link mode: ~/.claude/skills/<name> IS <repo>/skills/<name>, so skill merges are
# live on `git pull` — run this ONCE per machine (re-run only if the repo moves).
# Existing plain-directory copies from the old copy mode are migrated in place.
# Entries under the target root with no matching skills/<name> in this repo are
# never touched.
#
# Default target root is ~/.claude/skills ONLY. Current Cursor discovers that same
# directory through its compatibility roots (~/.claude/skills, ~/.codex/skills,
# ...), so a second install root in ~/.cursor/skills would list every skill twice
# in Cursor's slash menu. Pass -IncludeCursor only for older Cursor builds that
# read ~/.cursor/skills exclusively.
#
# -IncludeCodex additionally links ~/.agents/skills (Codex local discovery).
# https://learn.chatgpt.com/docs/build-skills (verified 2026-10-03).
# -TargetRoot <dir> overrides the target root (for testing against a temp dir);
# it replaces the default roots entirely.
param(
  [switch]$IncludeCursor,
  [string]$TargetRoot,
  [switch]$IncludeCodex
)
$ErrorActionPreference = "Stop"

# Resolve ancestor junctions too: an alias to the repo must not bypass overlap checks.
function Resolve-PhysicalDirectory([string]$Path) {
  $item = Get-Item -LiteralPath $Path -Force
  if ($item.LinkType) { return Resolve-PhysicalDirectory ($item.ResolveLinkTarget($true).FullName) }
  if ($null -eq $item.Parent) { return $item.FullName }
  return Join-Path (Resolve-PhysicalDirectory $item.Parent.FullName) $item.Name
}
$src = Resolve-PhysicalDirectory (Join-Path $PSScriptRoot "..\skills")

$targets = @()
if ($TargetRoot) {
  $targets += $TargetRoot
} else {
  $targets += (Join-Path $HOME ".claude\skills")
  if ($IncludeCodex) { $targets += (Join-Path $HOME ".agents\skills") }
  if ($IncludeCursor) { $targets += (Join-Path $HOME ".cursor\skills") }
}

$linked = 0; $migrated = 0; $skipped = 0

foreach ($t in $targets) {
  New-Item -ItemType Directory -Force -Path $t | Out-Null
  $t = Resolve-PhysicalDirectory $t
  $sourcePrefix = $src.TrimEnd('\') + '\'
  $targetPrefix = $t.TrimEnd('\') + '\'
  if ($sourcePrefix.StartsWith($targetPrefix, [StringComparison]::OrdinalIgnoreCase) -or
      $targetPrefix.StartsWith($sourcePrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Source and target roots must not overlap: $t"
  }
  foreach ($s in Get-ChildItem -Directory $src | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "SKILL.md") -PathType Leaf }) {
    $dest = Join-Path $t $s.Name
    $srcPath = $s.FullName
    # Validate the lexical entry path; never resolve through a destination link.
    $dest = [IO.Path]::GetFullPath($dest)
    if ([IO.Path]::GetDirectoryName($dest) -ne $t.TrimEnd([IO.Path]::DirectorySeparatorChar)) {
      throw "Destination escapes target root: $dest"
    }
    $item = Get-Item -LiteralPath $dest -Force -ErrorAction SilentlyContinue
    if ($null -ne $item) {
      if ($item.LinkType) {
        $current = @($item.Target)[0]
        if ($current -and ($current.TrimEnd('\') -ieq $srcPath.TrimEnd('\'))) {
          Write-Host "linked   $($s.Name) (already -> $srcPath)"
          $skipped++
          continue
        }
        # Reparse point aimed elsewhere — Delete() removes only the link itself.
        $item.Delete()
        $status = "linked   $($s.Name) (replaced link, was -> $current)"
        $linked++
      } else {
        # Plain directory: a copy from the old copy mode. Remove it and link.
        Remove-Item -LiteralPath $dest -Recurse -Force
        $status = "migrated $($s.Name) (copy -> junction)"
        $migrated++
      }
    } else {
      $status = "linked   $($s.Name) -> $srcPath"
      $linked++
    }
    New-Item -ItemType Junction -Path $dest -Target $srcPath | Out-Null
    Write-Host $status
  }
  Write-Host "entries in $t without a matching skills/<name> were left untouched."
}
Write-Host "done - $linked linked, $migrated migrated, $skipped skipped (already linked). skill merges are live on pull."
