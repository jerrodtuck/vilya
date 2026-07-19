# Sync the standard label set into a repo — the set every board shares:
# type:* (bug/feature/epic/task), priority:* (critical/high/medium/low), and the
# autonomy set (needs:plan, plan:ready, night-shift:ready, needs:decision).
# Standard set ONLY — area:* labels are repo-specific by definition; create them
# from the repo's config file (docs/project-tracking/GITHUB-PROJECTS.md,
# "Area labels" section).
#
# Usage: powershell -File docs/project-tracking/scripts/sync-labels.ps1 <owner>/<repo> [-DryRun]
#
# Idempotent: `gh label create --force` updates color/description when the label
# already exists. -DryRun echoes what would be synced without calling gh.
# POSIX parity twin: sync-labels.sh (keep the two behaviorally identical).
#
# Migration: `auto:ready` was renamed to `night-shift:ready`. This script does
# not delete or rename the old label — see GITHUB-PROJECTS.md "Migrating
# auto:ready → night-shift:ready".
param(
    [Parameter(Position = 0)][string]$Repo,
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'

if (-not $Repo) {
    [Console]::Error.WriteLine("usage: powershell -File docs/project-tracking/scripts/sync-labels.ps1 <owner>/<repo> [-DryRun]")
    exit 2
}

# name / color / description — colors per the canon's existing scheme.
$labels = @(
    @{ Name = 'type:bug';            Color = 'd73a4a'; Desc = 'Something is broken' },
    @{ Name = 'type:feature';        Color = '0e8a16'; Desc = 'New capability' },
    @{ Name = 'type:epic';           Color = '5319e7'; Desc = 'Multi-issue effort' },
    @{ Name = 'type:task';           Color = 'c5def5'; Desc = 'Chore or small unit of work' },
    @{ Name = 'priority:critical';   Color = 'b60205'; Desc = 'Drop everything' },
    @{ Name = 'priority:high';       Color = 'd93f0b'; Desc = 'Next up' },
    @{ Name = 'priority:medium';     Color = 'fbca04'; Desc = 'Normal queue' },
    @{ Name = 'priority:low';        Color = '0e8a16'; Desc = 'When idle' },
    @{ Name = 'needs:plan';          Color = '1d76db'; Desc = 'Enqueue for Planner (kickoff + verify plan)' },
    @{ Name = 'plan:ready';          Color = '0e8a16'; Desc = 'Planner finished - kickoff + verify plan on issue' },
    @{ Name = 'night-shift:ready';   Color = '0e8a16'; Desc = 'Safe for night-shift to pick up autonomously' },
    @{ Name = 'needs:decision';      Color = 'd93f0b'; Desc = 'Loop stopped at a fork - operator decision needed' }
)

foreach ($l in $labels) {
    if ($DryRun) {
        "would sync  $($l.Name)  #$($l.Color)  ($($l.Desc))"
    } else {
        gh label create $l.Name --repo $Repo --color $l.Color --description $l.Desc --force
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        "synced  $($l.Name)"
    }
}

""
"Standard set only. Now create this repo's area:* labels from its config file"
"(docs/project-tracking/GITHUB-PROJECTS.md, 'Area labels' section)."
