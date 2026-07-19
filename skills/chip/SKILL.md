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
- **Planner labels (daytime):** when the issue carries `plan:ready`, treat the kickoff comment +
  verify plan on the issue as the brief's authoritative plan artifacts — copy them into the
  self-contained `prompt`, do not re-plan. Daytime may still chip **without** `plan:ready` when
  the operator skipped Planner and the issue is already clear (attended judgment). Prefer
  enqueueing Planner (`needs:plan`) when scope, verify routing, or forks still need a planning
  pass — that path is orchestrator-owned; chips do not run `/planner`.

## 1. Dispatch — the `spawn_task` call

| field | value |
|-------|-------|
| `title` | leads with the issue id: **`#<N> <concise-name>`** — shows in the UI and maps the chip to its issue |
| `tldr` | one plain-English line |
| `cwd` | the repo root (main clone) |
| `prompt` | a **fully self-contained brief** (see §2) |

**In the same turn as every dispatch — no exceptions — the orchestrator arms a monitor** watching
`gh pr list` for the chip's PR and the issue for new comments/state (§3). **Claude Code:** the
**Monitor tool**. **Cursor:** a background shell with `notify_on_output` on **REST** (not
`gh project item-list` / GraphQL) — Cursor has no Monitor tool; that watcher *is* the equivalent.
The monitor *is* the completion signal; a dispatch without one is a chip nobody is listening for.

## 2. The self-contained brief (the `prompt`)

The chip has **zero** shared context, so the brief must stand alone. Include:

- **Repo + path** and the default branch.
- **Issue #<N>** with its full goal + acceptance — do not make the chip re-derive it.
- **Plan artifacts** — if the issue is `plan:ready`, paste the kickoff + verify plan (and any
  locked fork decisions) from the issue into the brief so the chip does not invent a second plan.
  If the operator skipped Planner, the issue body + acceptance still stand; say so explicitly.
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
- **Completion report**: right after `/finish-feature` opens the PR, post a concise
  **`gh issue comment` on the chip's issue** — PR #, gate results. Stopping at a fork/blocker
  instead? The **options comment on the issue is the report**. `gh` is already allowed in chips,
  so the comment lands with no prompt, attended or not.
- **No chip-spawned sessions**: chips **never call `spawn_task`** (or any other session-spawning
  tool). A deferred idea, follow-up, or out-of-scope finding goes **on the issue as a comment** or
  as a **new labeled GitHub issue** — only the orchestrator decides whether and how to chip it.
- **Hard rules for the chip**: **never merge**; **never push to the default branch**; **never call
  `spawn_task`** or any session-spawning tool — deferred work goes on the issue, not into a new
  session; at a real design fork, **stop, comment 2–3 options on the issue, and wait** — do not
  guess.

## 3. After dispatch — the monitor is the signal

The orchestrator's **monitor — armed in the same turn as the dispatch, no exceptions** — is the
completion signal: watch `gh pr list` for the chip's PR and the issue for new comments/state. The
chip's `gh issue comment` (§2) is what the monitor picks up; no push channel is relied on.

**Mechanism by host**

| Host | How to arm | Do not |
|------|------------|--------|
| **Claude Code** | **Monitor tool** (each stdout line streams as a live event) | An **exit-only** background shell watch loop — it detects in the output file but never notifies while the loop is still running |
| **Cursor** | Background shell + **`notify_on_output`** (stdout match wakes the session) on **REST**: `gh pr list` + `gh api repos/<owner>/<repo>/issues/<N>/comments` ~every 90s; seed last-seen state; print a wake sentinel on change; stop after the merge batch | `gh project item-list` / GraphQL on the hot path (Projects GraphQL can exhaust the hourly budget in minutes). Cursor has **no** Monitor tool |

Why not `send_message`: **`mcp__ccd_session_mgmt__send_message` always prompts the user for
confirmation by product contract** — no permission rule silences it (twice-tested) — so it can
never carry an unattended report. It remains fine for *attended* handoffs, one approval click
each. Harness end-pings don't fire either — a finished chip *idles* (`isRunning: false`), the
session never ends, so no end-notification is emitted.

Backup checks when the monitor is quiet, and always before merge:

- Claude Code: `mcp__ccd_session_mgmt__list_sessions` (`prState` / `isRunning`), or `gh pr list`
- Cursor: `gh pr list` / REST issue comments (same side channel the watcher uses)

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
- Report which chips are dispatched, which PRs are up, and what's still owed. A chip's completion
  comment is a claim, not proof — **verify it against the board and `gh` (PR state, gates) before
  any merge**.
