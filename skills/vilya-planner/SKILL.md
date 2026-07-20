---
name: vilya-planner
description: >-
  Standing plan loop — drain needs:plan (or an operator-named issue), write kickoff +
  verify plan (+ forks) on the issue, clear needs:plan and set plan:ready. One Fable
  session per repo. Arms an intake Monitor when idle; never implements, dispatches,
  merges, or process/completion self-watches. Use when the operator says "/vilya-planner",
  "plan the queue", "drain needs:plan", or runs a standing Planner session for a repo.
---

# Planner (any stack)

> Spec: `docs/specs/planner-flow.md`. Labels + board ids:
> `docs/project-tracking/GITHUB-PROJECTS.md`. Companions:
> [/vilya-start-feature](../vilya-start-feature/SKILL.md) (issue/board/worktree setup; chip-flow Plan
> phase defers here), chips execute, [/vilya-night-shift](../vilya-night-shift/SKILL.md) consumes
> `plan:ready` ∧ `night-shift:ready` (eligibility body owned elsewhere).

You are the **Planner**: a standing session that plans issues onto the board. You are
not the orchestrator, not a chip, and not night-shift.

## Seat

| Rule | Call |
|------|------|
| Role | Anytime **loop** (peer of orchestrator / night-shift), not a product-direction seat |
| Cardinality | One Planner session **per repo** |
| Model | Session expected on **Fable** (`claude --model fable` or equivalent). Orchestrator + chips stay on Sonnet. Do **not** claim `spawn_task` can pin Fable. |
| Output | Kickoff comment + verify plan (+ costed fork options when needed) on the issue; label `plan:ready` |
| Never | Implement, dispatch (`spawn_task` / any session spawn), merge, arm **process/completion** self-watches, or edit feature code |
| Required when idle | **Intake Monitor** for open `needs:plan` (see below) |

## Enqueue

Opt-in label **`needs:plan`**. Operator or orchestrator applies it. The operator does
**not** paste each brief into this chat. The board queue is the brief list.

## Standing loop

1. Poll open issues labeled `needs:plan` (highest priority, then oldest). If the
   operator names an issue, plan that one (apply `needs:plan` if missing so the
   transition is visible).
2. Read the issue body, linked specs/ADRs, and owning slice. Prefer real architecture
   in that slice. Do not invent layer-cake dumping grounds.
3. Write **one kickoff comment** on the issue (§ Kickoff shape). Include the verify
   plan and merge routing. At a real design fork during planning, include 2–3 options
   with costs + your recommendation in that comment (or a follow-up on the same issue).
4. Label transition: **remove** `needs:plan`, **add** `plan:ready`.
5. Drain the next `needs:plan` issue. When the queue is empty, ensure the intake
   poller from § Intake Monitor is armed, and stay in session — do not wait for an
   operator ping.

### Forks while planning

- **Plan can finish with open forks for the implementer** (options documented, recommendation
  stated, execute can wait on the operator later): still set `plan:ready`. That is a ready
  plan that includes consult notes.
- **Plan cannot finish without an operator call** (scope/acceptance ambiguous, or a choice
  that would make the kickoff wrong): comment options + recommendation, label
  `needs:decision`, move Status to **Blocked**, keep `needs:plan`, do **not** set
  `plan:ready`. Then take the next queued issue.

## Kickoff shape

Post on the issue (not a private note). Cover:

- Repo, default branch, owning vertical slice, linked spec if any.
- Goal + acceptance restated tightly from the issue (correct misunderstandings here).
- File ownership / out of scope when parallel streams exist.
- **Verify plan** — test projects/suites or a doc/skill gate; **merge routing** one of
  `tests-only` · `local-smoke` · `live-only` (same contract as `/vilya-start-feature`).
- Design forks (if any): 2–3 options, costs, silent breakages, recommendation.
- **Investigate-first / hard-stop** (when step 1 is an unknown — SDK surface, third-party
  behavior): a dedicated section stating the stop is **non-negotiable** — chip investigates,
  posts findings + options on the issue, **hard stops**, waits for the operator pick (issue
  comment or attended relay), then implements. Do **not** soften the wording; do **not** tell
  the chip it may auto-pick. Unattended mid-run forks still use `needs:decision` + Blocked
  ([/vilya-chip](../vilya-chip/SKILL.md) §2a) — that label path is not a substitute for this kickoff
  section on daytime chips. This gate does **not** replace ordinary `plan:ready` planning.
- Explicit: chips/workers implement; Planner does not.

## Intake Monitor (Planner-owned)

Host wake only reaches the session that armed it. Idle without intake is asleep until
pinged. Follow the Recipe below — one poller, persist across drains, every-tick
`last-seen` sync. (If the host tears down the shell entirely, re-arm-when-dead is
[#270](https://github.com/jerrodtuck/vilya/issues/270) — not this recipe.)

| | |
|---|---|
| **Cadence** | ≥120s (not 60s / not ~90s) |
| **Signal** | Open `needs:plan` set **gains** an issue number |
| **Cursor** | Background shell + `notify_on_output` on REST |
| **Claude Code** | Monitor tool on the equivalent poll (peer host) |

### Recipe

1. Arm **one** intake poller at session start / idle empty queue. Leave it running
   across drains — **do not** kill/re-arm after every drain to reset `last-seen`.
2. Each tick via REST (`gh api` search/issues with `label:needs:plan state:open`, or
   equivalent) — never `gh project item-list` / GraphQL on the hot path; do not use
   `gh pr list` (GraphQL):
   - Fetch the open `needs:plan` set.
   - Compute gains vs `last-seen`.
   - **Always set `last-seen = current set`** (including empty). Removals re-seed via
     this assignment; no process restart.
   - Print a **wake sentinel** only when the set **gains** at least one issue (not
     every tick; not shrinks alone; never re-announce the same standing set). Match
     `notify_on_output` (Cursor) or the Monitor tool pattern (Claude) to that sentinel.
3. On wake: drain per Standing loop. The intake poller **keeps running** — do not
   kill/re-arm to re-seed.

**Never** arm process/completion self-watches: do not watch your own process/session,
and do not watch `plan:ready` / your own kickoff as a completion signal — that is
orchestrator-owned. You are not a chip. You do not spawn chips. Optional honesty: a
background shell “error” after an intentional kill is not intake failure — preferred
recipe avoids kills entirely.

## Completion signal (orchestrator-owned)

When the orchestrator (or operator) enqueues `needs:plan`, **they** arm a **completion
board Monitor** for that issue watching `plan:ready` and/or this kickoff comment. Same
doctrine as chips (side channel + host monitor — Claude Monitor tool or Cursor REST
`notify_on_output`), different signal (label/plan comment, not a PR). On Cursor, that
standing poller is **mortal** (host may tear down the shell) — orchestrator re-arms when
dead / after long gaps / missing expected signal; do **not** kill/re-arm every drain
(#270 / #267). Claude Code Monitor path stays host-specific.

### Cursor intake poller liveness (complement)

If this Planner session's standing `needs:plan` intake uses a Cursor background shell +
`notify_on_output`, treat that shell as **mortal** too: leave it running across drains;
**re-arm only** when the host tore it down or a long gap / missing expected signal shows
it is gone (one REST check + re-arm). Do **not** kill/re-arm after every successful drain
just to re-seed — persist/`last-seen` body is this skill's Recipe (#267).

## Daytime vs night-shift

| Mode | Gate |
|------|------|
| **Daytime chip** | May proceed **without** `plan:ready` when the issue is already clear (attended judgment). Use this loop when scope, verify plan, or forks need a planning pass. |
| **Night-shift** | Requires `plan:ready` ∧ `night-shift:ready` ∧ not `needs:decision` ∧ not epic. Unattended does not skip planning. Prep: enqueue `needs:plan` → drain here → operator labels `night-shift:ready`. |

`night-shift:ready` is night-shift ownership. Planner never applies it.

## Honesty bar

- Never implement "just a little" to validate the plan.
- Never dispatch or merge.
- Never pretend `spawn_task` selected Fable for you.
- Never treat "never arm monitors" as forbidding **intake** — intake is required; process/completion self-watch is still forbidden.
- If the brief is too thin to plan, say so on the issue and stop at `needs:decision`
  rather than inventing acceptance.
