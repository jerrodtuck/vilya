---
name: vl-prune
description: >-
  Orchestrator cleanup for feature worktrees + leftover local branches — Cursor daytime
  (%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-*), gated Cursor probes (probe/* /
  *-probe-*), Claude chips (.claude/worktrees on claude/*), and night-shift / Claude daytime
  (.claude/worktrees on feat|fix|docs/<issue#>-*). Dry-run by default; --apply removes
  eligible worktrees after squash-merge and authorizes scoped kills of lock holders whose
  cmdline names that worktree. Use when the user says "prune", "prune worktrees",
  "/vl-prune", or after /vl-merge-pr hands off cleanup. Run from the main clone —
  never from inside a worktree being removed.
---

# Prune (any stack)

> Companion: [/vl-merge-pr](../vl-merge-pr/SKILL.md) squash-merges and **hands off** here;
> [/vl-start-feature](../vl-start-feature/SKILL.md) creates the worktrees this skill removes;
> [/vl-night-shift](../vl-night-shift/SKILL.md) uses the same `feat|fix|docs/*` branch names under
> `.claude/worktrees/` (not `claude/*`). Repo name / default branch come from
> `docs/project-tracking/GITHUB-PROJECTS.md` (or `gh repo view`).

## Why this exists

Feature worktrees live under these roots:

```text
%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>   # Cursor daytime (/vl-start-feature)
%USERPROFILE%\.cursor\worktrees\<repo>\*-probe-*         # gated Cursor probes (see §3a)
<main-clone>\.claude\worktrees\<slug>                    # Claude — chips OR night-shift / daytime
…/_work/<repo>/<repo>\.claude\worktrees\<slug>           # Actions self-hosted checkout (night-shift)
```

**Branch naming is not the same as the folder root:**

| Who created it | Worktree root | Branch |
|----------------|---------------|--------|
| Cursor daytime | `.cursor/worktrees/<repo>/` | `feat\|fix\|docs/<issue#>-*` |
| Cursor **probe** (gated) | `.cursor/worktrees/<repo>/` | `probe/*` (and/or probe-shaped folder) |
| Claude **chip** (`spawn_task` / agent-view) | `.claude/worktrees/` | `claude/*` |
| **Night-shift** (and Claude daytime `/vl-start-feature`) | `.claude/worktrees/` (incl. Actions `_work`) | `feat\|fix\|docs/<issue#>-*` |

**Prune owns the four rows above.** It does **not** touch manual Claude Code `--worktree`
pools (those are on `worktree-*` branches) or **arbitrary** Cursor Parallel / Best-of-N pools —
only the gated probe patterns in §3a. **Cursor Archive** and **Claude "delete session"** do
**not** reliably remove chip folders — after squash-merge, the worktrees plus their local
`feat|fix|docs/<issue#>-*` or `claude/*` branches pile up until you prune. Night-shift should
detach its own worktree after each PR (§ night-shift skill); leftovers under Actions `_work`
still go through this skill when you prune on the runner box. Probe leftovers after dogfood
likewise pile under `.cursor/worktrees/<repo>/` until prune.

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
| `/vl-prune` · "prune worktrees" · "what can we prune?" | **Dry-run** — list eligible paths + branches, touch nothing; preview `would kill PID …` when a lock holder is detected |
| `/vl-prune --apply` · "prune worktrees, apply" | Remove what the dry-run would list; **`--apply` authorizes scoped lock-holder kills** on eligible rows (see §5a) |

Always show the dry-run table first. With `--apply`, re-check eligibility immediately
before each delete (remote/PR state can change).

Optional scope (when the operator names it):

- One issue: `/vl-prune 36` / `/vl-prune --apply 36`
- One repo folder name when multiple products share the machine
- `--probes-only` is nice-to-have (list/remove only §3a rows); not required — probe rows are
  simply additional eligible rows under the pattern

## 2. Discover candidates

1. Resolve `<repo>` short name (`gh repo view --json name -q .name`, or the leaf of
   `nameWithOwner`).
2. **`git worktree list --porcelain` from each relevant checkout is the source of truth** —
   register every worktree with its path and branch:
   - **Cursor daytime** (`/vl-start-feature`):
     `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>` on `feat|fix|docs/<issue#>-*`
     (bash: `$HOME/.cursor/worktrees/<repo>/`).
   - **Cursor probes** (§3a): same `.cursor/worktrees/<repo>/` root — folder and/or branch
     match the probe recipe (include orphans that match).
   - **Claude chips** (`spawn_task` / agent-view):
     `<main-clone>\.claude\worktrees\<slug>` on `claude/*`.
   - **Night-shift / Claude daytime** (`/vl-start-feature` under Claude):
     `<main-clone>\.claude\worktrees\<slug>` **or** Actions
     `…/_work/<repo>/<repo>/.claude/worktrees/<slug>` on `feat|fix|docs/<issue#>-*`.
3. When this machine hosts a self-hosted Actions runner, also run `git worktree list` from
   each product checkout under `**/_work/<repo>/<repo>/` (night-shift's cwd). Do not assume
   those trees appear in the daytime clone's list.
4. Also scan those roots on disk for **orphan folders** (on disk but absent from
   `worktree list` — leftover after a failed/locked remove): `$HOME/.cursor/worktrees/<repo>/`,
   `<main-clone>/.claude/worktrees/`, and `…/_work/<repo>/<repo>/.claude/worktrees/`. Orphans
   still count.

## 3. Eligibility (all must hold)

| # | Gate | Fail → |
|---|------|--------|
| 1 | Worktree is one of ours: (a) Cursor tree (`.cursor/worktrees/<repo>/` with a `<digits>-…` folder) on `feat\|fix\|docs/<issue#>-*`, **or** (b) Cursor **probe** (§3a), **or** (c) Claude chip (`.claude/worktrees/` on `claude/*`), **or** (d) night-shift / Claude daytime (`.claude/worktrees/` — including Actions `_work` — on `feat\|fix\|docs/<issue#>-*`) | skip |
| 2 | Path is not cwd (nor a parent of cwd) | skip + warn |
| 3 | **Session liveness — required for every `.claude/worktrees/*` row**: query `mcp__ccd_session_mgmt__list_sessions` and confirm **no non-archived session** has this worktree's path or branch. A match means live, **regardless of `isRunning`** — sessions report `isRunning: false` between turns while still holding their worktree; only archived/deleted sessions release it | skip (live session) |
| 4 | No **open** PR for the worktree's branch head (`feat\|fix\|docs/<issue#>-*` **or** `claude/*` **or** `probe/*`) | skip |
| 5 | Closed out: merged/closed PR for that head, **or** remote branch gone (`git ls-remote --heads origin <branch>` empty), **or** `git merge-base --is-ancestor <branch> origin/<default-branch>` | skip (unmerged) |
| 6 | Worktree clean (`git status --porcelain` empty) on `--apply` | skip (no default `--force`) |

**Do not require `claude/*` for `.claude/worktrees/`** — that would skip every night-shift tree.
Never delete locals outside that pairing. Never delete the default branch.

### 3a. Gated Cursor probes (#287)

**Do not** prune arbitrary Best-of-N / Parallel pools. **Do** treat a row as a probe candidate
when **all** of the following hold:

1. Path is under `.cursor/worktrees/<repo>/` (Windows or POSIX separators).
2. **Either** the leaf folder matches a probe shape **or** the branch is `probe/*`:
   - folder glob: `*-probe-*` (contains `-probe-`), **or** `bon-probe-*`, **or**
     `model-switch-probe-*`
   - branch: starts with `probe/` (e.g. `probe/bon-isolation`)

Probe candidates then face the **same** gates 2–6 as normal rows (not cwd, closed-out, clean
on `--apply`). Session-liveness (gate 3) does not apply — these are not `.claude/worktrees/*`.

**Dry-run verdict** for rows that pass: `eligible (probe)`. `--apply` removes them like any
other eligible row (including §5a scoped lock-holder kills).

**Recipe (testable):** `isCursorProbeCandidate` in
`apps/skill-registry/src/features/orchestrator/prune-probe-eligibility.ts` — folder/branch
matching only; closed-out / clean / not-cwd remain agent-side git checks.

**Still skip** (not probe candidates): Cursor BoN folders without those patterns (e.g. random
Task pool names under `.cursor/worktrees/`), `worktree-*` Claude pools, anything outside
`.cursor/worktrees/<repo>/`.

## 4. Dry-run output

For each candidate print one row:

```text
PATH | BRANCH | PR | REMOTE | VERDICT
...  | feat/36-… | MERGED #58 | gone | eligible
...  | (orphan) | — | — | eligible (orphan folder)
...  | probe/bon-… | — | gone | eligible (probe)
...  | feat/59-… | OPEN #59 | present | skip (open PR)
...  | feat/224-… (_work) | MERGED #239 | gone | eligible   # night-shift leftover
...  | claude/… | — | — | skip (live session)
```

End with counts: `N eligible · M skipped · apply with /vl-prune --apply`.

When a dry-run detects a lock holder on an **eligible** row, add a preview line (do **not**
kill):

```text
would kill PID <pid> (<name>) for <path>
```

## 5. Apply

For each **eligible** row (including `eligible (probe)`), in the main clone:

```bash
# registered worktree
git worktree remove "<path>"          # add --force only if the operator explicitly asked

# orphan folder (not in worktree list)
# Windows: Remove-Item -LiteralPath "<path>" -Recurse -Force
# Unix:    rm -rf "<path>"

# matching local branch still present
git branch -D "<branch>"              # paired feat|fix|docs/<issue#>-*, claude/*, or probe/*

git fetch --prune
```

- Prefer `git worktree remove` before deleting the directory.
- If remove fails because the path is locked: follow **§5a**. `--apply` already authorizes
  scoped kills for that eligible row — no second operator ask. Do not invent force deletes
  that skip eligibility.
- Re-run dry-run at the end and show what remains (including any kills performed).

## 5a. Lock holder — Permission denied on a locked worktree

After `/vl-merge-pr`, folder delete can return **Permission denied** even though the PR is
merged, because a live process still holds the worktree open. **`--apply` implies kill** of
lock-holder processes for **eligible** rows only — that flag is the authorization. No second
ask.

Two cases before/around the kill path:

**Claude chip (`.claude/worktrees/<slug>`)** — the chip's own **session process** holds its
worktree while that session is still alive. Gate 3 already skips live / non-archived sessions;
**close the chip session in the UI** (agent view / background sessions) so the row can become
eligible. Do **not** kill past a live-session skip. Only when the row is eligible and a
hold remains (UI close wasn't enough), use the PID hunt below.

> **"Device or resource busy" on a chip tree** usually means a **not-yet-archived session**
> still holds it (even with `isRunning: false` — see gate 3). Archive/delete that session so
> eligibility can pass; do not force-delete past the gate.

**Cursor (`.cursor/worktrees/<repo>/<issue#>-*` or probe folders)** — a leftover
`cursor-agent-worker` `node.exe` keeps the worktree open even after the chip is closed /
Archived. This is the common sticky case that motivated `--apply` ⇒ scoped kill. Eligible
probe rows get the same scoped-kill treatment.

On `--apply`, when remove hits Permission denied / a known worker lock on an **eligible**
row:

1. **Eligibility already passed** — do not skip gates to force-delete live work.
2. **Identify the holder** — find PIDs whose command line names **that** worktree path (for
   Cursor, also `cursor-agent-worker` / `--worker-dir`):

   ```powershell
   $wt = "<full worktree path>"   # .cursor\worktrees\<repo>\<issue#>-<slug>  OR  .claude\worktrees\<slug>
   Get-CimInstance Win32_Process |
     Where-Object { $_.CommandLine -like ("*{0}*" -f $wt) } |
     Select-Object ProcessId, Name, CommandLine
   ```

   Confirm the cmdline actually names **this** worktree. Never kill a process that does not.
3. **Kill those PIDs** — no second operator ask (`--apply` is the consent):

   ```powershell
   Stop-Process -Id <pid> -Force
   ```

   Report every kill in the prune output: `killed PID <pid> (<name>) for <path>`.
4. **Re-remove** the worktree / folder (and paired local branch as usual).

**Still forbidden**

- Auto-kill on dry-run (preview only: `would kill PID … for <path>`)
- Killing processes that do not name the target worktree
- Broad "kill anything blocking" on the machine
- Skipping eligibility gates to force-delete live work

Closing the chip / Cursor Archive is **not** always enough (Cursor's worker outlives it).
If no matching PID is found and the path stays locked, skip the row, report that, and
continue others.

## 6. Honesty bar

- Dry-run is the default; `--apply` is explicit — and on eligible rows it **authorizes
  scoped lock-holder kills** (report every kill: PID + path).
- Dry-run must preview `would kill PID … for <path>` when a lock holder is detected; never
  kill on dry-run.
- Say when you skipped dirty / open-PR / cwd-inside / live-session / still-locked (no
  matching PID) rows.
- Do not claim Cursor Archive or Claude delete cleaned these paths.
- Never treat "no PR + no commits + clean" as death evidence for a chip tree — that is
  exactly what a freshly started chip looks like; only the session-liveness gate (gate 3)
  can clear a `.claude/worktrees/*` row.
- Never kill processes that do not name the target worktree; never skip eligibility to
  force-delete.
- Never claim prune cleans **all** Cursor BoN / Parallel pools — only §3a gated probes
  (`eligible (probe)`); arbitrary pool folders stay skipped.
- After `/vl-merge-pr`, one `/vl-prune --apply` (or a dry-run the operator reviews) is the
  normal hygiene step — not an in-place delete from the feature worktree chat.
