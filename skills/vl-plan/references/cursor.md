# Cursor Planner adapter

Read and apply the full [shared Planner role contract](planner-contract.md) before planning.
A missing shared resource stops planning before readiness.
This preserves Cursor's /vl-plan route. It creates no new Cursor skill.

Use the existing configured Fable planning policy and the conversation model dropdown.
Preserve exact active pins. Do not import Codex model tiers.
Read the [seat reminder](../../vl-orch-codex/references/seat-entry.md) and
[naming contract](../../vl-handoff/references/seat-naming.md) at first seating/reseating.
Use verified Cursor title capabilities or the manual fallback.

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
   `gh pr list` or `gh issue list --json` (both GraphQL). Copy-paste bash recipe: site
   `/planner` card "Standing needs:plan intake—copy-paste REST bash":
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

## Completion signal (Cursor orchestrator-owned)

The orchestrator owns a **standing `plan:ready` poller** (session start / idle; REST +
host wake; ≥120s; wake when the open set **gains** an issue) so this finish wakes them
without relying on same-turn enqueue memory (#261). Same doctrine as chips (side channel
+ host monitor — Claude Monitor tool or Cursor REST `notify_on_output`), different signal
(label/plan comment, not a PR). Same-turn per-enqueue board Monitor for that issue remains
best-practice reinforcement, not the sole wake path. On Cursor, that standing poller is
**mortal** (host may tear down the shell) — orchestrator re-arms when dead / after long
gaps / missing expected signal; do **not** kill/re-arm every drain (#270 / #267). Claude
Code Monitor path stays host-specific.

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


## Handoff

Use currently exposed Cursor directory and messaging capabilities when authorized.
Do not borrow Claude or Codex tool names. Use durable issue evidence if transport is unavailable.
Hand the settled kickoff and verification plan to the owning orch.
Preserve exact identities, pins, ownership, repair ledger and remaining obligations.
Use [vl-handoff](../../vl-handoff/SKILL.md) before recommending fresh chat.
Retain Cursor's existing daytime and unattended eligibility and review rules.
