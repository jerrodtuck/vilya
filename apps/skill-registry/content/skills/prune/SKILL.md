---
name: prune
description: >-
  Orchestrator cleanup for feature worktrees + leftover local branches — both Cursor
  (%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-*) and Claude chip
  (.claude/worktrees/<slug> on claude/* branches) trees. Dry-run by default; --apply
  removes eligible worktrees after squash-merge. Use when the user says "prune", "prune
  worktrees", "/prune", or after /merge-pr hands off cleanup. Run from the main clone —
  never from inside a worktree being removed.
---

# Prune (any stack)

> Companion: [/merge-pr](../merge-pr/SKILL.md) squash-merges and **hands off** here;
> [/start-feature](../start-feature/SKILL.md) creates the worktrees this skill removes.
> Repo name / default branch come from `docs/project-tracking/GITHUB-PROJECTS.md`
> (or `gh repo view`).

## Why this exists

Feature worktrees live under two roots:

```text
%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>   # Cursor daytime (/start-feature)
<main-clone>\.claude\worktrees\<slug>                    # Claude chips (spawn_task / agent-view), claude/* branch
```

**Prune owns both** — Cursor trees from `/start-feature`, and Claude **chip** trees
(`spawn_task` / agent-view background sessions, on `claude/*` branches). It does **not**
touch manual Claude Code `--worktree` pools (those are on `worktree-*` branches) or Cursor
Parallel / Best-of-N pools. **Cursor Archive** and **Claude "delete session"** do **not**
reliably remove chip folders — after squash-merge, the worktrees plus their local
`feat|fix|docs/<issue#>-*` or `claude/*` branches pile up until you prune.

**Cadence:** with **Auto-archive on PR close** enabled (Claude Code Desktop), a merged
chip's session archives itself — the process stops and the checkout detaches without you.
What remains is only folders + local branches, so the intended rhythm is a **periodic
`--apply` after a merge batch**, not per-merge ceremony. The session-liveness gate (gate 3)
keeps this safe regardless of timing.

## 0. Where to run

- **Always from the main clone** (or any checkout that is *not* the worktree you are
  about to remove).
- If your cwd is inside a candidate worktree: stop, switch to the main clone, re-run.
  Never `git worktree remove` the tree you are standing in.

## 1. Invocation

| Prompt | Effect |
|--------|--------|
| `/prune` · "prune worktrees" · "what can we prune?" | **Dry-run** — list eligible paths + branches, touch nothing |
| `/prune --apply` · "prune worktrees, apply" | Remove what the dry-run would list |

Always show the dry-run table first. With `--apply`, re-check eligibility immediately
before each delete (remote/PR state can change).

Optional scope (when the operator names it):

- One issue: `/prune 36` / `/prune --apply 36`
- One repo folder name when multiple products share the machine

## 2. Discover candidates

1. Resolve `<repo>` short name (`gh repo view --json name -q .name`, or the leaf of
   `nameWithOwner`).
2. **`git worktree list --porcelain` from the main clone is the source of truth** — it
   registers every worktree with its path and branch, across **both** worktree models:
   - **Cursor daytime** (`/start-feature`):
     `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>` on `feat|fix|docs/<issue#>-*`
     branches (bash: `$HOME/.cursor/worktrees/<repo>/`).
   - **Claude chips** (`spawn_task` / agent-view):
     `<main-clone>\.claude\worktrees\<slug>` on `claude/*` branches.
3. Also scan **both** roots on disk for **orphan folders** (on disk but absent from
   `worktree list` — leftover after a failed/locked remove): `$HOME/.cursor/worktrees/<repo>/`
   and `<main-clone>/.claude/worktrees/`. Orphans still count.

## 3. Eligibility (all must hold)

| # | Gate | Fail → |
|---|------|--------|
| 1 | Worktree is one of ours: a Cursor tree (`.cursor/worktrees/<repo>/` with a `<digits>-…` folder, `/start-feature` layout) **or** a Claude chip (`.claude/worktrees/` on a `claude/*` branch) | skip |
| 2 | Path is not cwd (nor a parent of cwd) | skip + warn |
| 3 | **Session liveness — required for every `.claude/worktrees/*` row**: query `mcp__ccd_session_mgmt__list_sessions` and confirm **no non-archived session** has this worktree's path or branch. A match means live, **regardless of `isRunning`** — sessions report `isRunning: false` between turns while still holding their worktree; only archived/deleted sessions release it | skip (live session) |
| 4 | No **open** PR for the worktree's branch head (`feat\|fix\|docs/<issue#>-*` **or** `claude/*`) | skip |
| 5 | Closed out: merged/closed PR for that head, **or** remote branch gone (`git ls-remote --heads origin <branch>` empty), **or** `git merge-base --is-ancestor <branch> origin/<default-branch>` | skip (unmerged) |
| 6 | Worktree clean (`git status --porcelain` empty) on `--apply` | skip (no default `--force`) |

Never delete locals outside that pairing. Never delete the default branch.

## 4. Dry-run output

For each candidate print one row:

```text
PATH | BRANCH | PR | REMOTE | VERDICT
...  | feat/36-… | MERGED #58 | gone | eligible
...  | (orphan) | — | — | eligible (orphan folder)
...  | feat/59-… | OPEN #59 | present | skip (open PR)
...  | claude/… | — | — | skip (live session)
```

End with counts: `N eligible · M skipped · apply with /prune --apply`.

## 5. Apply

For each **eligible** row, in the main clone:

```bash
# registered worktree
git worktree remove "<path>"          # add --force only if the operator explicitly asked

# orphan folder (not in worktree list)
# Windows: Remove-Item -LiteralPath "<path>" -Recurse -Force
# Unix:    rm -rf "<path>"

# matching local branch still present
git branch -D "<branch>"              # only the paired feat|fix|docs/<issue#>-* or claude/* name

git fetch --prune
```

- Prefer `git worktree remove` before deleting the directory.
- If remove fails because the path is locked: follow **§5a** — do not invent force
  deletes, and do not kill processes unless the operator explicitly asks.
- Re-run dry-run at the end and show what remains.

## 5a. Lock holder — Permission denied on a locked worktree

After `/merge-pr`, folder delete can return **Permission denied** even though the PR is
merged, because a live process still holds the worktree open. Two cases:

**Claude chip (`.claude/worktrees/<slug>`)** — the chip's own **session process** holds its
worktree while that session is still alive. **Close the chip session in the UI** (agent view /
background sessions) and the lock releases; then re-apply. This is the common case for
`spawn_task` chips and needs **no** process kill. Only if closing the session isn't possible,
fall back to the PID hunt below.

> **"Device or resource busy" on a chip tree** usually means a **not-yet-archived session**
> still holds it (even with `isRunning: false` — see gate 3). The fix is archiving/deleting
> that session, **not** force-deletes.

**Cursor (`.cursor/worktrees/<repo>/<issue#>-*`)** — a leftover `cursor-agent-worker`
`node.exe` keeps the worktree open even after the chip is closed / Archived.

1. **Merge first** — PR MERGED, remote branch gone (already true for eligible rows).
2. **Identify the holder** — find PIDs whose command line names the worktree path (for
   Cursor, also `cursor-agent-worker` / `--worker-dir`):

   ```powershell
   $wt = "<full worktree path>"   # .cursor\worktrees\<repo>\<issue#>-<slug>  OR  .claude\worktrees\<slug>
   Get-CimInstance Win32_Process |
     Where-Object { $_.CommandLine -like ("*{0}*" -f $wt) } |
     Select-Object ProcessId, Name, CommandLine
   ```

   Confirm the cmdline actually names **this** worktree before offering a kill.
3. **Operator-authorized kill only** — never auto-kill. Report the PID + a short
   cmdline excerpt, ask. When they say yes:

   ```powershell
   Stop-Process -Id <pid> -Force
   ```

4. **Re-apply** — `/prune --apply` (scoped or full). `git worktree remove` /
   `Remove-Item` should succeed once that lock is gone.

Closing the chip / Cursor Archive is **not** always enough (Cursor's worker outlives it).
Skip the row and continue others if the operator declines the kill.

## 6. Honesty bar

- Dry-run is the default; `--apply` is explicit.
- Say when you skipped dirty / open-PR / cwd-inside / live-session / still-locked rows.
- Do not claim Cursor Archive or Claude delete cleaned these paths.
- Never treat "no PR + no commits + clean" as death evidence for a chip tree — that is
  exactly what a freshly started chip looks like; only the session-liveness gate (gate 3)
  can clear a `.claude/worktrees/*` row.
- Do not kill `cursor-agent-worker` (or any process) without an explicit operator ask.
- After `/merge-pr`, one `/prune --apply` (or a dry-run the operator reviews) is the
  normal hygiene step — not an in-place delete from the feature worktree chat.
