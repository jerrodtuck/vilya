#!/usr/bin/env bash
# Sync the standard label set into a repo — the set every board shares:
# type:* (bug/feature/epic/task), priority:* (critical/high/medium/low), and the
# autonomy pair (auto:ready, needs:decision). Standard set ONLY — area:* labels
# are repo-specific by definition; create them from the repo's config file
# (docs/project-tracking/GITHUB-PROJECTS.md, "Area labels" section).
#
# Usage: bash docs/project-tracking/scripts/sync-labels.sh <owner>/<repo> [--dry-run]
#
# Idempotent: `gh label create --force` updates color/description when the label
# already exists. --dry-run echoes what would be synced without calling gh.
# Windows parity twin: sync-labels.ps1 (keep the two behaviorally identical).
set -euo pipefail

repo=""
dry_run=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) dry_run=1; shift ;;
    -*) echo "unknown flag: $1" >&2; exit 2 ;;
    *)
      if [[ -n "$repo" ]]; then echo "unexpected argument: $1" >&2; exit 2; fi
      repo="$1"; shift ;;
  esac
done
if [[ -z "$repo" ]]; then
  echo "usage: bash docs/project-tracking/scripts/sync-labels.sh <owner>/<repo> [--dry-run]" >&2
  exit 2
fi

# name|color|description — colors per the canon's existing scheme.
labels=(
  "type:bug|d73a4a|Something is broken"
  "type:feature|0e8a16|New capability"
  "type:epic|5319e7|Multi-issue effort"
  "type:task|c5def5|Chore or small unit of work"
  "priority:critical|b60205|Drop everything"
  "priority:high|d93f0b|Next up"
  "priority:medium|fbca04|Normal queue"
  "priority:low|0e8a16|When idle"
  "auto:ready|0e8a16|Safe for night-shift to pick up autonomously"
  "needs:decision|d93f0b|Loop stopped at a fork - operator decision needed"
)

for entry in "${labels[@]}"; do
  IFS='|' read -r name color desc <<<"$entry"
  if [[ $dry_run -eq 1 ]]; then
    echo "would sync  $name  #$color  ($desc)"
  else
    gh label create "$name" --repo "$repo" --color "$color" --description "$desc" --force
    echo "synced  $name"
  fi
done

echo ""
echo "Standard set only. Now create this repo's area:* labels from its config file"
echo "(docs/project-tracking/GITHUB-PROJECTS.md, 'Area labels' section)."
