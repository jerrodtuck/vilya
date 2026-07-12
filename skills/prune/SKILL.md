---
name: prune
description: >-
  Orchestrator cleanup for Cursor feature worktrees and leftover local branches.
  Dry-run by default; --apply removes eligible %USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-*
  folders after squash-merge. Use when the user says "prune", "prune worktrees",
  "/prune", or after /merge-pr hands off cleanup. Run from the main clone — never
  from inside a worktree being removed.
---

# Prune (any stack)

> Companion: [/merge-pr](../merge-pr/SKILL.md) squash-merges and **hands off** here;
> [/start-feature](../start-feature/SKILL.md) creates the worktrees this skill removes.
> Repo name / default branch come from `docs/project-tracking/GITHUB-PROJECTS.md`
> (or `gh repo view`).

## Why this exists

Daytime feature worktrees live under:

```text
%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>
```

They are created by `/start-feature` — **not** Cursor Parallel / Best-of-N pools and
**not** Claude Code `--worktree` pools. **Cursor Archive** and **Claude delete** do
**not** own this path. After squash-merge + remote branch delete, those folders and
local `feat|fix|docs/<issue#>-*` branches pile up until you prune.

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
2. List directories matching `<issue#>-*` under
   `%USERPROFILE%\.cursor\worktrees\<repo>\`
   (bash: `$HOME/.cursor/worktrees/<repo>/`).
3. Cross-check `git worktree list --porcelain` from the main clone so registered paths
   and branch names are known. Orphan folders (on disk but not in `worktree list`)
   still count — they are leftover after a failed remove.

## 3. Eligibility (all must hold)

| # | Gate | Fail → |
|---|------|--------|
| 1 | Folder name is `<digits>-…` (`/start-feature` layout) | skip |
| 2 | Path is not cwd (nor a parent of cwd) | skip + warn |
| 3 | No **open** PR for the paired `feat\|fix\|docs/<issue#>-*` head | skip |
| 4 | Closed out: merged/closed PR for that head, **or** remote branch gone (`git ls-remote --heads origin <branch>` empty), **or** `git merge-base --is-ancestor <branch> origin/<default-branch>` | skip (unmerged) |
| 5 | Worktree clean (`git status --porcelain` empty) on `--apply` | skip (no default `--force`) |

Never delete locals outside that pairing. Never delete the default branch.

## 4. Dry-run output

For each candidate print one row:

```text
PATH | BRANCH | PR | REMOTE | VERDICT
...  | feat/36-… | MERGED #58 | gone | eligible
...  | (orphan) | — | — | eligible (orphan folder)
...  | feat/59-… | OPEN #59 | present | skip (open PR)
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
git branch -D "<branch>"              # only the paired feat|fix|docs/<issue#>-* name

git fetch --prune
```

- Prefer `git worktree remove` before deleting the directory.
- If remove fails because the path is locked: follow **§5a** — do not invent force
  deletes, and do not kill processes unless the operator explicitly asks.
- Re-run dry-run at the end and show what remains.

## 5a. Lock holder — `cursor-agent-worker` (Windows / Cursor)

Operator-proven sequence after `/merge-pr` when folder delete returns **Permission
denied** even though the chip is closed / Archived:

1. **Merge first** — PR MERGED, remote branch gone (already true for eligible rows).
2. **Identify the holder** — a leftover `cursor-agent-worker` `node.exe` often keeps
   the worktree open. On Windows, find PIDs whose command line includes the worktree
   path and/or `--worker-dir` (same path under
   `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-*`):

   ```powershell
   $wt = "$env:USERPROFILE\.cursor\worktrees\<repo>\<issue#>-<slug>"
   Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
     Where-Object {
       $_.CommandLine -match 'cursor-agent-worker|--worker-dir' -and
       $_.CommandLine -like ("*{0}*" -f $wt)
     } |
     Select-Object ProcessId, CommandLine
   ```

   Confirm the cmdline actually names **this** worktree before offering a kill.
3. **Operator-authorized kill only** — never auto-kill. Report the PID + a short
   cmdline excerpt, ask. When they say yes:

   ```powershell
   Stop-Process -Id <pid> -Force
   ```

4. **Re-apply** — `/prune --apply` (scoped or full). `git worktree remove` /
   `Remove-Item` should succeed once that lock is gone.

Closing the chip or Cursor Archive is **not** enough when this worker is still
alive. Skip the row and continue others if the operator declines the kill.

## 6. Honesty bar

- Dry-run is the default; `--apply` is explicit.
- Say when you skipped dirty / open-PR / cwd-inside / still-locked rows.
- Do not claim Cursor Archive or Claude delete cleaned these paths.
- Do not kill `cursor-agent-worker` (or any process) without an explicit operator ask.
- After `/merge-pr`, one `/prune --apply` (or a dry-run the operator reviews) is the
  normal hygiene step — not an in-place delete from the feature worktree chat.
