#!/usr/bin/env bash
# Sync the canonical skills into the user-level skill dir.
# Run from anywhere: bash scripts/install-skills.sh
#
# Default target is ~/.claude/skills ONLY. Current Cursor discovers that same
# directory through its compatibility roots (~/.claude/skills, ~/.codex/skills,
# ...), so a second copy in ~/.cursor/skills would list every skill twice in
# Cursor's slash menu. Pass --include-cursor only for older Cursor builds that
# read ~/.cursor/skills exclusively.
set -euo pipefail

src="$(cd "$(dirname "$0")/../skills" && pwd)"
targets=("$HOME/.claude/skills")
if [[ "${1:-}" == "--include-cursor" ]]; then
  targets+=("$HOME/.cursor/skills")
fi

for t in "${targets[@]}"; do
  mkdir -p "$t"
  for d in "$src"/*/; do
    name="$(basename "$d")"
    mkdir -p "$t/$name"
    cp "$d/SKILL.md" "$t/$name/SKILL.md"
    echo "installed $name -> $t/$name/SKILL.md"
  done
done
echo "done — one source of truth (skills/), one install root (Cursor reads it too)."
