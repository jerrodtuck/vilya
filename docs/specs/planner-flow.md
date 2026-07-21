# Planner flow

**Created:** 2026-07-19  
**Last updated:** 2026-07-19  
**Owning issues:** [#203](https://github.com/jerrodtuck/vilya/issues/203) (epic), [#204](https://github.com/jerrodtuck/vilya/issues/204) (docs), [#206](https://github.com/jerrodtuck/vilya/issues/206) (skill + start-feature), [#207](https://github.com/jerrodtuck/vilya/issues/207) (eligibility), [#208](https://github.com/jerrodtuck/vilya/issues/208) (`/planner` site), [#255](https://github.com/jerrodtuck/vilya/issues/255) (Planner intake Monitor), [#261](https://github.com/jerrodtuck/vilya/issues/261) (orchestrator standing `plan:ready` poller), [#267](https://github.com/jerrodtuck/vilya/issues/267) (persist intake across drains), [#270](https://github.com/jerrodtuck/vilya/issues/270) (Cursor shell teardown)
**Status:** Docs + labels + skills + eligibility landed (#204–#207); `/planner` teaching surface (skill invoke `/vl-plan`) landed in #208; Setup/differences model-routing rewrite remains #209; skill rename canonized in #257/#260; intake Monitor (#255) amends idle/monitor clause from #203; #261 makes orchestrator standing `plan:ready` poller the required completion wake (per-enqueue reinforcement); #267 amends lifecycle to persist one poller across drains; Cursor monitor-shell teardown/re-arm taught in #270

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
| Never | Implement, dispatch, merge, arm **process/completion** self-watches, or run as a `spawn_task` chip (`spawn_task` has no model param) |
| Required when idle | **Intake Monitor** for the open `needs:plan` set (Planner-owned; see below) |

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
3. When the queue is empty, the Planner **arms one intake Monitor** (if none is
   running) so a new `needs:plan` wakes the same session — do not wait for an
   operator ping. That poller **persists across drains**; do not kill/re-arm after
   every issue just to re-seed `last-seen`.
4. Orchestrator owns a **standing `plan:ready` poller** (session start / idle) so
   Planner finish wakes the orchestrator without relying on same-turn enqueue memory.
   Same-turn per-enqueue completion board Monitor for that issue remains best-practice
   reinforcement, not the sole wake path. Same doctrine as chips (side channel + Monitor),
   different signal (label/plan comment, not a PR).
5. Do **not** monitor the Planner process or session. Planner is not a chip. Completion
   watches stay orchestrator-owned; intake is Planner-owned.

## Intake Monitor (Planner-owned)

Sessions do not message each other. Host wake only reaches the session that armed it.
Without an intake alarm, an idle Planner is asleep until pinged — that contradicts
“skills carry mechanics.”

| Owner | Signal | When |
|-------|--------|------|
| **Planner** | Open `needs:plan` set **gains** an issue | Standing / idle |
| **Orchestrator** | Open `plan:ready` set **gains** an issue (and/or plan kickoff) | Standing / idle (required); same-turn per-enqueue reinforcement optional |

**Forbidden for Planner:** process/session self-watch; completion watches on your own
`plan:ready` / kickoff (orchestrator owns those); sibling-chat pings as the default wake.

## Standing plan:ready poller (orchestrator-owned)

Twin of Planner intake (#255 / #261). Host wake only reaches the session that armed it;
per-enqueue arming is easy to skip under load, so the seat that needs Planner finish owns
a structural wake.

**Forbidden for Orchestrator:** process/session watch on Planner; treating per-enqueue as
the only wake; GraphQL / `gh project item-list` / `gh pr list` on the hot path; auto-chip
on `plan:ready` without orchestrator judgment.

### Host recipe (both hosts — soft fork A)

Cadence **≥120s** (not 60s / not ~90s). REST-first — never `gh project item-list` /
GraphQL on the hot path (`gh pr list` is GraphQL; do not use it for this poller).

1. Arm **one** standing `plan:ready` poller at orchestrator session start / idle. Leave it
   running — **do not** kill/re-arm after every wake to reset `last-seen`.
   (Host shell teardown / re-arm-when-dead is [#270](https://github.com/jerrodtuck/vilya/issues/270).)
2. Each tick: re-fetch the open `plan:ready` set
   (`gh api` issues/search with `label:plan:ready state:open`, or equivalent REST).
   Compute gains vs `last-seen`, then **always set `last-seen = current set`**
   (including empty). Removals re-seed via that assignment — no process restart.
   Print a **wake sentinel** only when the set **gains** at least one issue number
   (not on every tick; not on shrinks alone; never re-announce the same standing set).
3. **Cursor:** background shell + `notify_on_output` matched to that sentinel
   (stdout match wakes the session — not an exit-only watch loop).
4. **Claude Code:** arm the **Monitor tool** on the equivalent background poll
   (peer host mechanism; same gain-only wake).
5. On wake: read the issue kickoff / verify plan and proceed (chip or operator call).
   The poller **keeps running** — do not kill/re-arm to re-seed.
6. Same-turn per-enqueue board Monitor for a specific issue remains best-practice
   reinforcement when you apply `needs:plan` — not a substitute for the standing poller.

### Host recipe (both hosts — soft fork A)

Cadence **≥120s** (not 60s / not ~90s). REST-first — never `gh project item-list` /
GraphQL on the hot path (`gh pr list` is GraphQL; do not use it for this poller).

1. Arm **one** intake poller at session start / idle empty queue. Leave it running
   across drains — **do not** kill/re-arm after every drain to reset `last-seen`.
   (Host shell teardown / re-arm-when-dead is [#270](https://github.com/jerrodtuck/vilya/issues/270).)
2. Each tick: re-fetch the open `needs:plan` set
   (`gh api` issues/search with `label:needs:plan state:open`, or equivalent REST).
   Compute gains vs `last-seen`, then **always set `last-seen = current set`**
   (including empty). Removals re-seed via that assignment — no process restart.
   Print a **wake sentinel** only when the set **gains** at least one issue number
   (not on every tick; not on shrinks alone; never re-announce the same standing set).
3. **Cursor:** background shell + `notify_on_output` matched to that sentinel
   (stdout match wakes the session — not an exit-only watch loop).
4. **Claude Code:** arm the **Monitor tool** on the equivalent background poll
   (peer host mechanism; same gain-only wake).
5. On wake: drain per loop behavior. The intake poller **keeps running** — do not
   kill/re-arm to re-seed.

## Cursor shell teardown (standing monitors)

On **Cursor**, long-running background shells used for `notify_on_output` watchers
(chip-completion, standing orch `plan:ready` pollers, Planner intake) are **mortal** —
the host may reclaim them quietly. Teach **arm → assume mortal → re-arm** on noticed
death, long idle gaps, or a missing expected signal (one REST check, then re-arm if
the shell is gone). Do **not** arm-once-and-forget. Complement #267: re-seed
`last-seen` every tick; do **not** kill/re-arm after every successful drain.
**Claude Code** Monitor tool path stays host-specific — no process-lifetime parity.
Canon + ADR: `GITHUB-PROJECTS.md` chip-chain section; `DECISIONS.md` (#270).

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

#255 amends the #203 idle/monitor clause only: Planner **does** arm an intake Monitor
for `needs:plan`; it still never arms process/completion self-watches. Standing Fable
Planner and labels are unchanged.

#261 amends the #203 completion-monitor clause only: orchestrator **must** arm a standing
`plan:ready` poller; same-turn per-enqueue board Monitor softens from sole mechanism to
optional reinforcement. Still never watches the Planner process; chip monitors stay
per-dispatch; Planner intake stays Planner-owned.

#267 amends #255 lifecycle only: one poller persists across drains; every tick
re-seeds `last-seen = current set`. “Re-arm when idle again” must not mean kill the
process to reset seed — that churn caused missed wakes. The same every-tick re-seed
shape applies to the orchestrator standing `plan:ready` poller (#261).

## Non-goals (this landing)

- Planner inside Actions / the night-shift job (deferred).
- Per-`spawn_task` model pin (blocked on Claude Code).
- Planner as orchestrator subagent; cross-session notify between Cursor chats.
- Auto-dispatching a chip on `plan:ready` without orchestrator judgment.
- Canon label sync or Setup/Differences pages (owned by #205–#209).

## Verify

- Merge routing: **tests-only** (docs)
- Facts match #203 ADR + #255 intake amend + #261 standing orch poller + #267 persist amend (intake Planner-owned; completion orchestrator-owned standing; one poller across drains)
- Links resolve to #203 / #204 / #255 / #261 / #267; Autonomy label tables unchanged except Planner chip-chain prose
