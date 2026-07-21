---
name: vl-cursor-handoff
description: >-
  Cursor Worker A seat — invoke only after the worker window is already rooted at
  the issue worktree. Reads the issue kickoff, builds in the owning slice, runs
  crucible → /vl-finish-feature. Does not seat the orchestrator, open folders, or
  teach a three-step paste ritual. Name is /vl-cursor-handoff — not /chip-cursor.
  Pairs with /vl-start-feature, /vl-finish-feature, /vl-prune; Claude Code chips use /vl-chip
  instead.
---

# Cursor handoff (Worker A)

> **Invoke only after** this window is already rooted at
> `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>`.
> If you are still in the main clone, **stop** and open the worktree first
> (File → Open Folder / `cursor <path>`). Opening the folder is a human step —
> not this skill.

> Companion: [/vl-start-feature](../vl-start-feature/SKILL.md) already ran in the
> orchestrator session (issue, board Status, worktree, branch, kickoff). This
> skill is the **worker seat** that executes that brief. Close with
> [/vl-finish-feature](../vl-finish-feature/SKILL.md). [/vl-prune](../vl-prune/SKILL.md) is
> orchestrator-owned from the main clone. Claude Code chips use
> [/vl-chip](../vl-chip/SKILL.md) + `spawn_task`. Repo / owner / project / labels /
> stack / crucible / test command come from
> `docs/project-tracking/GITHUB-PROJECTS.md`.

## Why this exists

Cursor agent sessions **cannot talk to each other** — the Projects board, issues,
and PRs are the only coordination channel. The orchestrator leaves a self-contained
kickoff on the issue; you run this skill **in the worktree** to execute it. There
is **no auto-handoff**. Seating the orchestrator and arming monitors belong on the
**orchestrator** skill/card — not here.

## 0. Preconditions

- **Already in the worktree** (see the first line). Wrong root → stop; do not
  invent a second setup.
- There **must be a tracking issue** with an orchestrator kickoff.
  [/vl-start-feature](../vl-start-feature/SKILL.md) **already ran** — **do not re-run
  it**. Re-running doubles the worktree/branch.
- This skill **is** Worker A (orchestrator did setup). **Worker B** is a different
  standing-order card for solo / no-orchestrator days — **A and B are mutually
  exclusive** per issue. Never follow the B path from this skill.
- Chat title is exactly `<issue#>-<slug>` — 1:1 with the worktree folder name.
- Read owner / repo / default branch / stack / crucible / test command from
  `docs/project-tracking/GITHUB-PROJECTS.md` (or `gh repo view`).

## 1. Read the brief

Derive `#<N>` from the worktree branch (`feat|fix|docs/<issue#>-slug`) if needed.
Then:

1. `gh issue view <N>` — body, labels, comments.
2. Treat the **orchestrator / Planner kickoff comment** as the full brief. No
   other session shares context with you.
3. If the issue carries `plan:ready`, that kickoff + verify plan are authoritative
   — **do not re-plan**.

## 2. Build (Worker A contract)

You're the implementer for issue `#<N>`, working **only** in this worktree.

- Build in the owning vertical slice named in the kickoff. Report progress on the
  issue/PR — the orchestrator only sees the board.
- At a real design fork: stop, comment 2–3 options with costs + your recommendation
  on the issue, and wait for the operator.
- If the kickoff marks **Investigate-first / hard-stop**: investigate, post
  findings + options on the issue, **hard stop** — do not implement and do not
  auto-pick because findings look obvious — until the operator records the pick
  on the issue or relays it here.

## 3. Gates → close

1. Run the repo's `vl-crucible-<stack>` (from `GITHUB-PROJECTS.md`) on the branch;
   apply top refactors; re-review until the signal reads **Ready**. This gate is
   not optional.
2. Close with [/vl-finish-feature](../vl-finish-feature/SKILL.md) — PR titled
   `#<N> …` with the merge routing from the verify plan (`Closes #<N>` or
   `Refs #<N>`).
3. Right after the PR opens (or when stopping at a fork/blocker), post a concise
   completion comment on the issue leading with PR # and gate results.
4. **Never merge. Never push the default branch. Never spawn sessions.**

## Honesty bar

- Do **not** claim auto-handoff, native chained slash commands, or a working
  Cursor employee command until a separate spike lands.
- Never soften A/B exclusivity.
- Never re-teach orchestrator seating, folder-open, or "paste Worker A" from this
  skill — those live on the orchestrator path / prompt cards. The Worker A card
  may remain as a paste fallback until epic retirement; **this skill is the
  invoke source of truth**.
- Never invent a second ritual name (`/chip-cursor`).
