---
name: cursor-handoff
description: >-
  Cursor three-step worker handoff — paste orchestrator kickoff → open the worktree
  folder → paste Worker A. Use when the Cursor orchestrator (or you) needs to dispatch
  a worker without session-to-session comms, or when someone says "/cursor-handoff",
  "hand off to Cursor worker", "open the worktree and paste Worker A". Cursor has no
  spawn_task; this skill packages the operator ritual. Name is /cursor-handoff — not
  /chip-cursor. Pairs with /start-feature, /finish-feature, /prune; Claude Code chips
  use /chip instead.
---

# Cursor handoff (three-step ritual)

> Companion: [/start-feature](../start-feature/SKILL.md) creates the issue, board
> Status, worktree, and kickoff; this skill is the **invoke target** for handing
> implementation to a Cursor worker session; the worker closes with
> [/finish-feature](../finish-feature/SKILL.md); [/prune](../prune/SKILL.md) cleans
> up from the main clone. Claude Code chips use [/chip](../chip/SKILL.md) +
> `spawn_task` — do **not** invent a second Cursor ritual or rename this
> `/chip-cursor`. Repo / owner / project / labels / stack / crucible / test command
> come from `docs/project-tracking/GITHUB-PROJECTS.md`.

## Why this exists

Claude Code chips self-start via `spawn_task`. Cursor agent sessions **cannot talk
to each other** — the Projects board, issues, and PRs are the only coordination
channel. Dispatch is a **manual three-step operator ritual**. Standing-order prompt
cards still seat the orchestrator and worker roles; invoke **`/cursor-handoff`**
when it is time to run the path. There is **no auto-handoff**.

## 0. Preconditions

- There **must be a tracking issue** — create or pick it via
  [/start-feature](../start-feature/SKILL.md) first. Never hand off untracked work.
- Prefer the **orchestrator-already-ran-setup** path (**Worker A**). **Worker B** is
  solo / no-orchestrator only — **A and B are mutually exclusive** per issue.
  Pasting B after the orchestrator ran `/start-feature` double-creates the worktree
  and branch.
- Chat title for the worker session is exactly `<issue#>-<slug>` — 1:1 with the
  worktree folder name.
- Read owner / repo / default branch from
  `docs/project-tracking/GITHUB-PROJECTS.md` (or `gh repo view`).

## 1. Paste orchestrator kickoff (main-clone session)

If the Cursor orchestrator is **not** already seated: paste the standing-order card
**Cursor — orchestrator kickoff (no comms layer)** in the **main-clone** session.

That session:

- runs `/start-feature` (issue, board Status, worktree, branch, kickoff comment),
- **does not implement**,
- leaves a self-contained kickoff on the issue for a fresh worker.

If the orchestrator is already seated and has kicked off the stream, skip to §2.

## 2. Open the worktree folder

Open the worktree in a **new** Cursor window / agent rooted there:

```text
%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>
```

This is the Cursor asymmetry vs Claude `spawn_task`: the human (or you, directing
the human) opens the folder. Sessions still share no chat context — the issue
kickoff is the brief.

## 3. Paste Worker A (worker session)

In that worker session, paste the standing-order card
**Cursor — worker kickoff A · orchestrator did setup**.

- **Use A** when the orchestrator already ran `/start-feature`.
- **Use B** (`Cursor — worker kickoff B · worker does its own setup`) only when
  nothing has set the issue up yet (solo days). Never paste B on an
  orchestrator-prepared worktree.
- The worker reads the issue + kickoff, builds in the owning slice, runs the
  repo's `crucible-<stack>` until Ready, then `/finish-feature` — it never
  merges and never re-runs `/start-feature` on the A path.

## 4. Same-turn monitor (orchestrator session)

In the **same turn** as every worker dispatch — no exceptions — the orchestrator
session arms a chip-completion monitor and moves the issue to **In Progress**
(when GraphQL budget allows). The Cursor orchestrator standing-order card owns the
REST + `notify_on_output` recipe and GraphQL quota hygiene — follow that card; do
not freehand a tighter loop here. The monitor is the completion signal; the
worker's issue comment is a claim, not proof. Always verify before merge.

## Honesty bar

- Do **not** claim auto-handoff, native chained slash commands, or a working
  Cursor employee command until a separate spike lands (see related board work).
- Never soften A/B exclusivity.
- Never implement feature code in the main-clone orchestrator session.
- Never invent a second ritual name (`/chip-cursor`) or a parallel step list that
  drifts from the three steps above.
