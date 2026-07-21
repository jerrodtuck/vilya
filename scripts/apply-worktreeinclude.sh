#!/usr/bin/env bash
# Apply repo-root .worktreeinclude into a worktree (Cursor shim / orch path).
# Claude Code reads .worktreeinclude natively; this script is for Cursor
# (.cursor/worktrees.json) and for /vl-start-feature after git worktree add.
#
# Usage (from worktree cwd, Cursor - ROOT_WORKTREE_PATH set by Cursor):
#   bash scripts/apply-worktreeinclude.sh
# Orch:
#   bash <main>/scripts/apply-worktreeinclude.sh --dest <worktree> [--source <main-clone>]
# Dry-run:
#   ... --dry-run

set -euo pipefail

SOURCE=""
DEST=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="$2"; shift 2 ;;
    --dest) DEST="$2"; shift 2 ;;
    --dry-run|-n) DRY_RUN=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

main_clone_from_git() {
  local start="$1"
  local common
  common="$(git -C "$start" rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"
  [[ -n "$common" ]] || return 1
  if [[ "$common" == */.git/worktrees/* ]]; then
    echo "${common%%/.git/worktrees/*}"
  elif [[ "$common" == */.git ]]; then
    echo "${common%%/.git}"
  else
    return 1
  fi
}

resolve_source() {
  if [[ -n "${ROOT_WORKTREE_PATH:-}" && -d "$ROOT_WORKTREE_PATH" ]]; then
    (cd "$ROOT_WORKTREE_PATH" && pwd -P)
    return
  fi
  if [[ -n "$SOURCE" ]]; then
    (cd "$SOURCE" && pwd -P)
    return
  fi
  local hint="${DEST:-$PWD}"
  main_clone_from_git "$hint"
}

resolve_dest() {
  if [[ -n "$DEST" ]]; then
    (cd "$DEST" && pwd -P)
    return
  fi
  git rev-parse --show-toplevel 2>/dev/null || pwd -P
}

SOURCE_ROOT="$(resolve_source)"
DEST_ROOT="$(resolve_dest)"
INCLUDE="$SOURCE_ROOT/.worktreeinclude"

if [[ ! -f "$INCLUDE" ]]; then
  echo "apply-worktreeinclude: no patterns (missing .worktreeinclude) - no-op"
  exit 0
fi

copied=0
skipped=0

copy_one() {
  local src="$1"
  local rel="${src#"$SOURCE_ROOT"/}"
  if ! git -C "$SOURCE_ROOT" check-ignore -q -- "$rel"; then
    echo "apply-worktreeinclude: skip (not gitignored): $rel"
    skipped=$((skipped + 1))
    return
  fi
  local dest="$DEST_ROOT/$rel"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "apply-worktreeinclude: would copy $rel"
    copied=$((copied + 1))
    return
  fi
  mkdir -p "$(dirname "$dest")"
  cp -a "$src" "$dest"
  echo "apply-worktreeinclude: copied $rel"
  copied=$((copied + 1))
}

while IFS= read -r line || [[ -n "$line" ]]; do
  pattern="$(printf '%s' "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$pattern" || "$pattern" == \#* ]] && continue

  recursive=0
  if [[ "$pattern" == *'/**' ]]; then
    pattern="${pattern%/\*\*}"
    recursive=1
  fi
  pattern="${pattern%/}"

  src="$SOURCE_ROOT/$pattern"
  if [[ ! -e "$src" ]]; then
    echo "apply-worktreeinclude: skip (missing): $pattern"
    skipped=$((skipped + 1))
    continue
  fi

  if [[ -d "$src" && "$recursive" -eq 1 ]]; then
    # Directory itself may not be gitignored (tracked README); copy ignored files.
    while IFS= read -r -d '' f; do
      copy_one "$f"
    done < <(find "$src" -type f -print0)
    continue
  fi

  copy_one "$src"
done < "$INCLUDE"

echo "apply-worktreeinclude: done (copied=$copied skipped=$skipped) source=$SOURCE_ROOT dest=$DEST_ROOT"
exit 0
