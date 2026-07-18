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
# -TargetRoot <dir> overrides the target root (for testing against a temp dir);
# it replaces the default roots entirely.
param(
  [switch]$IncludeCursor,
  [string]$TargetRoot
)
$ErrorActionPreference = "Stop"

$src = (Resolve-Path (Join-Path $PSScriptRoot "..\skills")).Path

$targets = @()
if ($TargetRoot) {
  $targets += $TargetRoot
} else {
  $targets += (Join-Path $HOME ".claude\skills")
  if ($IncludeCursor) { $targets += (Join-Path $HOME ".cursor\skills") }
}

$linked = 0; $migrated = 0; $skipped = 0

foreach ($t in $targets) {
  New-Item -ItemType Directory -Force -Path $t | Out-Null
  $t = (Resolve-Path $t).Path
  foreach ($s in Get-ChildItem -Directory $src) {
    $dest = Join-Path $t $s.Name
    $srcPath = $s.FullName
    if (Test-Path -LiteralPath $dest) {
      $item = Get-Item -LiteralPath $dest -Force
      if ($item.LinkType) {
        $current = @($item.Target)[0]
        if ($current -and ($current.TrimEnd('\') -ieq $srcPath.TrimEnd('\'))) {
          Write-Host "linked   $($s.Name) (already -> $srcPath)"
          $skipped++
          continue
        }
        # Reparse point aimed elsewhere — Delete() removes only the link itself.
        $item.Delete()
        New-Item -ItemType Junction -Path $dest -Target $srcPath | Out-Null
        Write-Host "linked   $($s.Name) (replaced link, was -> $current)"
        $linked++
      } else {
        # Plain directory: a copy from the old copy mode. Remove it and link.
        Remove-Item -LiteralPath $dest -Recurse -Force
        New-Item -ItemType Junction -Path $dest -Target $srcPath | Out-Null
        Write-Host "migrated $($s.Name) (copy -> junction)"
        $migrated++
      }
    } else {
      New-Item -ItemType Junction -Path $dest -Target $srcPath | Out-Null
      Write-Host "linked   $($s.Name) -> $srcPath"
      $linked++
    }
  }
  Write-Host "entries in $t without a matching skills/<name> were left untouched."
}
Write-Host "done - $linked linked, $migrated migrated, $skipped skipped (already linked). skill merges are live on pull."
