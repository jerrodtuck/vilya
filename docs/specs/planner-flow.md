# Planner flow

**Created:** 2026-07-19  
**Last updated:** 2026-07-19  
**Owning issues:** [#203](https://github.com/jerrodtuck/vilya/issues/203) (epic), [#204](https://github.com/jerrodtuck/vilya/issues/204) (docs), [#206](https://github.com/jerrodtuck/vilya/issues/206) (skill + start-feature), [#207](https://github.com/jerrodtuck/vilya/issues/207) (eligibility), [#208](https://github.com/jerrodtuck/vilya/issues/208) (`/planner` site)  
**Status:** Docs + labels + skills + eligibility landed (#204–#207); `/planner` teaching surface landing in #208; Setup/differences model-routing rewrite remains #209

## Intent

Make plan≠execute real on Claude Code with a dedicated **Planner** loop: a standing
Fable session that plans issues onto the board; Sonnet orchestrator + Sonnet chips
that execute. Night-shift stays a separate loop and only consumes work that already
has a plan.

This spec is the durable story for the seat. Canon label tables (`#205`), skills
(`#206`/`#207`), and site pages (`#208`/`#209`) implement it — they do not redefine it.

## Seat

| Rule | Call |
|------|------|
| Role | Anytime **loop** (peer of orchestrator / night-shift), not a product-direction seat |
| Cardinality | One Planner session **per repo** |
| Model | Session launched on **Fable** (`claude --model fable` or equivalent). Orchestrator + chips stay on **Sonnet** via `settings.local.json` + `.worktreeinclude` |
| Output | Kickoff comment + verify plan (+ fork options) on the issue; label transition to `plan:ready` |
| Never | Implement, dispatch, merge, or run as a `spawn_task` chip (`spawn_task` has no model param) |

## Labels

| Label | Meaning |
|-------|---------|
| `needs:plan` | Opt-in enqueue for planning. Operator or orchestrator applies it; the Planner drains the queue. |
| `plan:ready` | Plan is on the issue (kickoff + verify plan, forks if any). Safe for night-shift's planning gate. |
| `night-shift:ready` | Safe for unattended execute. Renames former `auto:ready` — night-shift ownership only. |

v1 enqueue is the `needs:plan` label. The operator does **not** manually brief each
issue into Planner chat.

## Loop behavior

1. Standing Planner session polls for `needs:plan` and drains the queue.
2. For each issue: write kickoff + verify plan (and costed fork options when needed)
   onto the issue; apply `plan:ready`; drop `needs:plan`.
3. Orchestrator, when enqueueing planning, arms a **board Monitor** for that issue —
   watch for `plan:ready` and/or the plan kickoff comment. Same doctrine as chips
   (side channel + Monitor), different signal (label/plan comment, not a PR).
4. Do **not** monitor the Planner process or session. Planner is not a chip.

## Daytime vs night-shift gates

| Mode | Gate |
|------|------|
| **Daytime chip** | May chip **without** `plan:ready` when the issue is already clear (attended judgment). Use Planner when scope, verify plan, or forks need a planning pass. |
| **Night-shift** | Requires `plan:ready` ∧ `night-shift:ready` ∧ not `needs:decision` ∧ not epic. Unattended does not skip planning. |

## Prep ritual (before an unattended window)

Operator + orchestrator:

1. Scope the issues that should run overnight.
2. Enqueue them with `needs:plan`; let the Planner drain to `plan:ready`.
3. Label `night-shift:ready` on issues that are safe to execute unattended.
4. Night-shift picks up only what clears both gates.

## What this supersedes

#89 / Setup teaching that “chip flow = Fable plans → Sonnet executes” / orchestrator
`/model` is the planner — wrong altitude. The orchestrator was not the real planner
in practice; model boundary ≠ dispatch boundary for planning quality. New story:
**Planner session = plan model; chip session = execute model.** Site rewrite is #209;
this spec + VISION + the #203 ADR are the durable claim.

## Non-goals (this landing)

- Planner inside Actions / the night-shift job (deferred).
- Per-`spawn_task` model pin (blocked on Claude Code).
- Canon label sync, skill text, or site pages (owned by #205–#209).

## Verify

- Merge routing: **tests-only** (docs)
- Facts match #203 ADR + clarification comments (board Monitor, standing drain, prep ritual)
- Links resolve to #203 / #204; no edits to `GITHUB-PROJECTS.md` Autonomy tables on this branch
