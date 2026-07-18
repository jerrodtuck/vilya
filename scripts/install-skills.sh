#!/usr/bin/env bash
# Link the canonical skills into the user-level skill dir (directory symlinks).
# Run from anywhere: bash scripts/install-skills.sh
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
# in Cursor's slash menu. Pass --include-cursor only for older Cursor builds that
# read ~/.cursor/skills exclusively.
#
# --target-root <dir> (or INSTALL_SKILLS_TARGET env) overrides the target root
# (for testing against a temp dir); it replaces the default roots entirely.
set -euo pipefail

src="$(cd "$(dirname "$0")/../skills" && pwd)"

include_cursor=0
target_root="${INSTALL_SKILLS_TARGET:-}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --include-cursor) include_cursor=1; shift ;;
    --target-root) target_root="$2"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

# On Git Bash / MSYS, `ln -s` silently COPIES unless native symlinks are requested.
# nativestrict makes it create a real symlink or fail loudly (needs Windows
# Developer Mode); on Windows prefer scripts/install-skills.ps1 (junctions).
case "$(uname -s)" in
  MINGW* | MSYS*) export MSYS=winsymlinks:nativestrict ;;
esac

targets=()
if [[ -n "$target_root" ]]; then
  targets+=("$target_root")
else
  targets+=("$HOME/.claude/skills")
  if [[ $include_cursor -eq 1 ]]; then
    targets+=("$HOME/.cursor/skills")
  fi
fi

linked=0 migrated=0 skipped=0

for t in "${targets[@]}"; do
  mkdir -p "$t"
  for d in "$src"/*/; do
    name="$(basename "$d")"
    src_path="$src/$name"
    dest="$t/$name"
    if [[ -L "$dest" ]]; then
      current="$(readlink "$dest")"
      if [[ "$current" == "$src_path" ]]; then
        echo "linked   $name (already -> $src_path)"
        skipped=$((skipped + 1))
        continue
      fi
      rm "$dest"
      ln -s "$src_path" "$dest"
      echo "linked   $name (replaced link, was -> $current)"
      linked=$((linked + 1))
    elif [[ -e "$dest" ]]; then
      rm -rf "$dest"
      ln -s "$src_path" "$dest"
      echo "migrated $name (copy -> symlink)"
      migrated=$((migrated + 1))
    else
      ln -s "$src_path" "$dest"
      echo "linked   $name -> $src_path"
      linked=$((linked + 1))
    fi
    if [[ ! -L "$dest" ]]; then
      echo "error: $dest is not a symlink — ln copied instead of linking (on Windows use scripts/install-skills.ps1)" >&2
      exit 1
    fi
  done
  echo "entries in $t without a matching skills/<name> were left untouched."
done
echo "done — $linked linked, $migrated migrated, $skipped skipped (already linked). skill merges are live on pull."
