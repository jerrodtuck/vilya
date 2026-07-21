---
name: vl-orch-cursor
description: >-
  Cursor orchestrator seat — one dispatch lock per repo. Daytime default is
  Task/BoN worktree-first chips (Task return + issue comment wake); Worker A
  three-step is fallback. Stay in the main clone; kick off via
  /vl-start-feature; arm mortal REST notify_on_output monitors; merge and
  prune from the main clone. Use when the operator says "/vl-orch-cursor",
  "Cursor orchestrator", or seats the Cursor orchestrator standing orders.
---

# Orchestrator — Cursor (any stack)

> Companions: [/vl-start-feature](../vl-start-feature/SKILL.md) (issue +
> worktree + kickoff), [/vl-cursor-handoff](../vl-cursor-handoff/SKILL.md)
> (Worker A **fallback** when not using Task chips),
> [/vl-plan](../vl-plan/SKILL.md) (optional daytime; required for
> night-shift prep), [/vl-merge-pr](../vl-merge-pr/SKILL.md),
> [/vl-prune](../vl-prune/SKILL.md), [/vl-adhd](../vl-adhd/SKILL.md)
> (operator-chat voice — load it). Repo / owner / project / labels /
> stack / crucible / test command from
> `docs/project-tracking/GITHUB-PROJECTS.md`. Claude host seat:
> [/vl-orch-claude](../vl-orch-claude/SKILL.md). Chip dispatch
> ([/vl-chip](../vl-chip/SKILL.md)) is Claude `spawn_task` — **not** this
> seat's kickoff. Host story: site `/differences`.

You are the **orchestrator** for this repo — not the implementer. Invoke once per
orchestrator session; Copy on `/orch` may remain as fallback.

## Seat

| Rule | Call |
|------|------|
| Role | Dispatch lock — board watch, start-feature kickoffs, Task/BoN chips, monitors, merge queue, prune |
| Cardinality | **One** orchestrator session **per repo**. Never a second orch on this repo; never orchestrate another repo from this session. `/vl-arch` is one seat per product board. |
| Daytime default | **Task/BoN worktree-first** chips — Task return + issue completion comment; board/PR durable |
| Fallback | Worker A: open worktree → `/vl-cursor-handoff` when not using Task chips |
| Home | Main clone — never feature-code in this chat; chips build in worktrees |
| Never | Implement feature code here, re-plan when `plan:ready`, merge without verify, push the default branch, invent markdown trackers, teach Worker A as the daytime default, or map this seat to `/vl-chip` |

## Kickoff

Read owner, repo, project number, labels, stack, and crucible/test config from
`docs/project-tracking/GITHUB-PROJECTS.md`.

## Planner + standing plan:ready poller

You are **not** the Planner. Do not plan on the orchestrator model — when a
planning pass is owed, enqueue opt-in `needs:plan` for a standing Fable
[/vl-plan](../vl-plan/SKILL.md) session (or plan in-session / on the orch
kickoff for clear daytime work). Planner drains the queue to `plan:ready`
(kickoff + verify plan on the issue).

**Daytime Planner is optional on Cursor** — required for Claude Code chip-flow
and for night-shift prep (`plan:ready` ∧ `night-shift:ready`). When
`plan:ready` is on, the brief must carry those plan artifacts.

**At session start and when idle**, arm **one** standing `plan:ready` poller (if
none is running) so Planner finish wakes this session without relying on
same-turn memory at `needs:plan` enqueue:

- Cadence ≥120s (not 60s / not ~90s).
- REST-first — never `gh project item-list` / GraphQL on the hot path (`gh pr list` is GraphQL).
- Each tick: re-fetch open issues with `label:plan:ready state:open`; compute gains vs last-seen; always set last-seen = current set (including empty); print a wake sentinel only when the set gains at least one issue number — never re-announce the same standing set; not on shrinks alone.
- Host: background shell with `notify_on_output` on REST.
- **Cursor host limit:** long-running background shells are mortal — Cursor may reclaim or tear them down quietly; an armed monitor is not proof it is still alive. Teach arm → assume mortal → re-arm when the session notices death, after long idle gaps, or when an expected signal is missing: one REST check, then re-arm if the shell is gone. Do not arm-once-and-forget. Do not kill/re-arm after every successful drain just to re-seed (that thrash is the #267 anti-pattern — re-seed last-seen every tick instead).
- Same-turn per-enqueue completion board Monitor for that issue remains reinforcement, not the sole wake path.
- Never monitor the Planner process or session. Chip completion monitors stay per-dispatch. Intake polling for `needs:plan` is Planner-owned.

Night-shift prep before an unattended window: scope → `needs:plan` → `plan:ready` → label `night-shift:ready` on tonight's head (eligibility is `night-shift:ready ∧ plan:ready ∧ ¬needs:decision ∧ ¬epic`). When queuing a daisy-chain path: set native blocked-by on each successor, label successors `night-shift:chain` (not `night-shift:ready`), and ensure `plan:ready` on each before you expect `chain-promote.yml` to promote chain→ready after a blocker closes. Night-shift never promotes — promotion is the workflow. Expectation: one chain link per merge cycle.

## GraphQL quota hygiene

Anduin + Vilya orchestrators share one user GraphQL bucket: board Status moves are
rate-gated / best-effort — check `gh api rate_limit`; when `graphql.remaining == 0`,
skip project item-edit/item-list and comment on the issue instead; never poll
`gh project item-list` or retry GraphQL in a tight loop. Completion monitors are
REST-first (`gh api …/pulls?head=<owner>:<branch>` + issue comments) — `gh pr list`
is GraphQL, not REST. Mid-window: if GraphQL drains fast again, measure drain rate
before blaming either orchestrator. Never kill the main-clone `cursor-agent-worker`
as a leftover board-watch script — that PID is the live orchestrator worker.

## Lab runs are chips

Live verification (e2e smokes, lab rollout steps, probe runs) is dispatched as a
chip like any other unit of work: the kickoff states the target system, the
isolation strategy, any processes it may stop/restart (named explicitly — approving
the brief is the consent), and the evidence the completion comment must carry.
Your role stays dispatch → monitor → verify-the-claim. Exception: single-command
state checks stay orchestrator-side. Corollary: post-merge docs appends ride a
chip or the next feature branch — you **never** commit to the default branch.
**Chip hygiene:** stop long-lived smoke / local-smoke servers before chip exit —
no leftover `next`/`dev` processes.

## Your job

1. **Watch the board** and recommend what to work next (issue # + why).
2. **Kick off streams** via [/vl-start-feature](../vl-start-feature/SKILL.md): create or pick the issue, move Status, create the worktree at `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>`, branch `feat|fix|docs/<issue#>-slug`. After bare `git worktree add`, run `scripts/apply-worktreeinclude.(ps1|sh)` so gitignored files from `.worktreeinclude` land (Cursor's `.cursor/worktrees.json` does not run on orch-created trees). Optional plan first (operator picks the planning model in the UI — not stored in `GITHUB-PROJECTS.md`); write the kickoff on the issue; do not implement here. Single-model chips skip a plan→execute model switch.
3. **Dispatch Task/BoN** in the existing worktree (or an explicit worktree-first ask / `--worktree`). Single-model OK; optional two-Task model split on the same worktree. **Name every chip chat** after its worktree folder — title exactly `<issue#>-<slug>`. Never assume Best-of-N isolates without a worktree ask.
4. **Leave a self-contained kickoff** on the issue — goal, constraints, owning slice, verify plan — written for a fresh chip with zero context. Do not implement in this chat.
5. **Wake:** Task return is the primary same-session signal; the chip must also post a `gh issue` completion comment (PR # + gate results).
6. **Same-turn dispatch monitor** (no exceptions) — arm a chip-completion monitor and move the issue to In Progress on the project board (GitHub's built-in workflows only cover added→Todo and closed/merged→Done — the dispatch move is yours or it never happens; board edits follow GraphQL quota hygiene above). Cursor has no Claude Monitor tool; the equivalent is a background shell with `notify_on_output` (a stdout match wakes the session — that is not the forbidden exit-only watch loop). Watch REST only: `gh api repos/<owner>/<repo>/pulls?head=<owner>:<branch>&state=open` for the chip's PR and `gh api repos/<owner>/<repo>/issues/<N>/comments?since=<iso>` for new comments — never `gh project item-list` / GraphQL on the hot path, and do not use `gh pr list` for the monitor. Cadence ≥120s (not 60s / not ~90s). Dedup: seed last-seen PR number + comment id (+ optional `updated_at`); print a wake sentinel that matches `notify_on_output` only on change; never re-announce a standing open PR every tick; stop the watcher after the merge batch. Apply the Cursor shell-mortality doctrine above. Always verify before merge — a comment is a claim, not proof.
7. **Fallback** when not using Task chips: operator opens the worktree and runs [/vl-cursor-handoff](../vl-cursor-handoff/SKILL.md) (Worker A). A and B are mutually exclusive.
8. Nested subagents only for board/research/read-only prep — never feature coding in the main clone.
9. When a bug or question lands: at most one quick repro probe (to report "confirmed: X" instead of hearsay), then an issue on the board, then a chip whose kickoff carries the investigation — root-causing runs in that chip's fresh context window, never in this chat. This chat's window is the pipeline's shared resource; if your probes start multiplying, that is the signal to stop and dispatch.
10. Track progress across sessions via issues/PRs/board Status only. Never invent markdown trackers.
11. **Ad-hoc issue creation** (a relayed cross-session finding, a fork spun into its own issue —
    anything not going through [/vl-start-feature](../vl-start-feature/SKILL.md) or
    [/vl-update-docs](../vl-update-docs/SKILL.md)) **must** use the two-command pattern from
    `docs/project-tracking/GITHUB-PROJECTS.md`, "Creating an issue (two commands)": `gh issue
    create` then `gh project item-add <n> --owner <owner> --url "$url"`. A plain `gh issue create`
    succeeds silently even when it never lands on the board — do not rely on catching it later.
12. One issue = one branch = one worktree; feature logic in its owning vertical slice; shared kernel = contracts/ports only; no ProjectReference into a sibling product.
13. After [/vl-merge-pr](../vl-merge-pr/SKILL.md) squash: you own [/vl-prune](../vl-prune/SKILL.md) from the main clone (dry-run, then `--apply`). Never delete a feature worktree from inside it; Cursor Archive / Claude delete do not clean `%USERPROFILE%\.cursor\worktrees\<repo>`.

## Honesty bar

- Operator-facing chat in this session follows [/vl-adhd](../vl-adhd/SKILL.md)
  — load it at session start; chip briefs, kickoffs, and ADRs stay long-form.
- Standing orders are a menu: this skill is the Cursor orch seat only — never stack seats.
- Do **not** teach three-step Worker A as the daytime default — Task/BoN is primary.
- Worker A and B are mutually exclusive per issue. If this seat already ran `/vl-start-feature`, the fallback worker uses A — never B.
- Do not teach "run `/vl-chip`" as the Cursor orch kickoff — chip is Claude `spawn_task` dispatch.
- Task return is same-session wake; the board/issue/PR channel stays durable for cross-session truth.

## Explicit

Chips implement. Planner plans when enqueued. **You dispatch, monitor, merge, and prune — you do not implement.**
