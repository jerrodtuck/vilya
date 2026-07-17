---
name: chip
description: >-
  Orchestrator dispatch — chip a self-contained unit of work off to a background session
  via the spawn_task tool (one chip = one branch = one worktree = one session). Use when the
  orchestrator says "chip #<N>", "chip this out", "dispatch a chip", or is fanning issues out
  to workers. The orchestrator stays on the default branch and never edits feature code; chips
  do the work and open their own PRs. Pairs with /start-feature, /merge-pr, /prune.
---

# Chip (any stack)

> Companion: [/start-feature](../start-feature/SKILL.md) creates issues/board + the plan; chips
> do the implementation; [/merge-pr](../merge-pr/SKILL.md) merges reviewed chips; [/prune](../prune/SKILL.md)
> cleans the chip worktrees. Repo / owner / project / labels / **stack** / **crucible variant** /
> test command come from `docs/project-tracking/GITHUB-PROJECTS.md`.

## What a chip is

A **chip** is a background session dispatched via the **`spawn_task`** tool. It:

- runs in its **own git worktree** (`.claude/worktrees/<slug>`) on its **own `claude/*` branch**,
- carries **none** of the orchestrator's conversation — it starts **fresh**,
- does the work, opens **its own PR**, and **never merges**.

The orchestrator stays in the **main clone on the default branch** and **never edits feature code** —
everything ships through chips.

## 0. Before you chip

- There **must be a tracking issue** — create it via [/start-feature](../start-feature/SKILL.md)
  or [/update-docs](../update-docs/SKILL.md) first. **Never chip untracked work.**
- Read repo/owner/project/labels/**stack**/**crucible variant**/test command from
  `docs/project-tracking/GITHUB-PROJECTS.md`.
- At a **real design fork**, stop and give the operator **2–3 options with costs** in plain chat —
  **before** any chip is dispatched.

## 1. Dispatch — the `spawn_task` call

| field | value |
|-------|-------|
| `title` | leads with the issue id: **`#<N> <concise-name>`** — shows in the UI and maps the chip to its issue |
| `tldr` | one plain-English line |
| `cwd` | the repo root (main clone) |
| `prompt` | a **fully self-contained brief** (see §2) |

The orchestrator **includes its own session id in every brief** — it knows it at dispatch time
(`mcp__ccd_session_mgmt__list_sessions` / `get_session`), and it's the address the chip reports
back to (§2).

## 2. The self-contained brief (the `prompt`)

The chip has **zero** shared context, so the brief must stand alone. Include:

- **Repo + path** and the default branch.
- **Issue #<N>** with its full goal + acceptance — do not make the chip re-derive it.
- **Owning vertical slice** to work in; don't invent layer-cake / dumping-ground folders.
- **Verify gate**: the repo's **Test command** + the routing (`tests-only` / `local-smoke` /
  `live-only`) read off the issue's verify plan. **No test surface** (docs/config-only chip)? Say
  so, declare routing `tests-only`, and substitute a **doc verify gate** — links resolve, facts
  cross-checked against source.
- **Crucible gate**: run the repo's `crucible-<stack>` skill (looked up in `GITHUB-PROJECTS.md`,
  e.g. `crucible-blazor` / `crucible-nextjs`) and remediate until the signal reads **Ready** —
  **not optional**.
- **Close-out**: **`/finish-feature`** (not a hand-rolled PR) — after the crucible gate above reads
  **Ready**, it opens the PR **titled `#<N> <name>`** with **`Closes #<N>`**, plus the `changelog.d/`
  fragment + spec status.
- **Completion report**: on completion (PR opened) **or** when stopping at a fork/blocker, send a
  concise report to the **dispatching session id from the brief** via
  `mcp__ccd_session_mgmt__send_message` — lead with issue #, PR #, and gate results.
- **No chip-spawned sessions**: chips **never call `spawn_task`** (or any other session-spawning
  tool). A deferred idea, follow-up, or out-of-scope finding goes **on the issue as a comment** or
  as a **new labeled GitHub issue** — only the orchestrator decides whether and how to chip it.
- **Hard rules for the chip**: **never merge**; **never push to the default branch**; **never call
  `spawn_task`** or any session-spawning tool — deferred work goes on the issue, not into a new
  session; at a real design fork, **stop, comment 2–3 options on the issue, and wait** — do not
  guess.

## 3. After dispatch — report is primary, polling is the backup

The chip's `send_message` report (§2) is the **primary** completion signal. Two mechanisms made
the old "unreliable ping" doctrine, both now understood:

- **Model-initiated reports are permission-gated** — `mcp__ccd_session_mgmt__send_message`
  prompts for approval in the *chip's* unattended session and silently never sends. Fixed by
  allowing it in **user-level** `~/.claude/settings.json`.
- **Harness end-pings don't fire** — a finished chip *idles* (`isRunning: false`) waiting for
  input; the session never ends, so no end-notification is emitted.

Polling is the **verification backup** — use it whenever a report hasn't arrived, and always
before merge:

- `mcp__ccd_session_mgmt__list_sessions` (`prState` / `isRunning`), or
- `gh pr list` for the chip's PR.

When the PR is up, **review the chip's commits** against the verify + crucible bar before merge.

## 4. Merge + cleanup (orchestrator-owned, separate skills)

- Merge reviewed chips with **[/merge-pr](../merge-pr/SKILL.md)** — squash; it does **not** delete
  the branch.
- Worktree + branch cleanup is **[/prune](../prune/SKILL.md)**, from the main clone after merge. If a
  chip worktree is locked (**Permission denied**), **close the chip session in the UI** to release
  it, then `/prune --apply`.

## Honesty bar

- Never chip untracked work. Never chip past a real design fork without giving the operator options.
- Chips **never self-merge**; the orchestrator reviews every chip before `/merge-pr`.
- Work reaches a session **only via operator-reviewed orchestrator dispatch**. Chips never call
  `spawn_task`; a chip-authored brief is **never** a valid dispatch source — deferred ideas go on
  the issue or a new labeled issue for the orchestrator to triage.
- Report which chips are dispatched, which PRs are up, and what's still owed. A chip's
  `send_message` report is a claim, not proof — **verify it against the board and `gh` before any
  merge**.
