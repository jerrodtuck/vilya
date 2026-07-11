#!/usr/bin/env bash
# Sync the canonical skills into the Claude Code + Cursor user-level skill dirs.
# Run from anywhere: bash scripts/install-skills.sh
set -euo pipefail

src="$(cd "$(dirname "$0")/../skills" && pwd)"
targets=("$HOME/.claude/skills" "$HOME/.cursor/skills")

for t in "${targets[@]}"; do
  mkdir -p "$t"
  for d in "$src"/*/; do
    name="$(basename "$d")"
    mkdir -p "$t/$name"
    cp "$d/SKILL.md" "$t/$name/SKILL.md"
    echo "installed $name -> $t/$name/SKILL.md"
  done
done
echo "done — one source of truth (skills/), installed to both tools."
