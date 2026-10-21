# Cursor Planner adapter

Read and apply the full [shared Planner role contract](planner-contract.md) before planning.
A missing shared resource stops planning before readiness.
This preserves Cursor's /vl-plan route. It creates no new Cursor skill.

Use the existing configured Fable planning policy and the conversation model dropdown.
Preserve exact active pins. Do not import Codex model tiers.
Read the [seat reminder](../../vl-orch-codex/references/seat-entry.md) and
[naming contract](../../vl-handoff/references/seat-naming.md) at first seating/reseating.
Use verified Cursor title capabilities or the manual fallback.

## Intake and completion watches

Read and apply the full [board-intake contract](../../vl-orch-codex/references/board-intake.md).
Keep needs:plan intake Planner-owned and plan:ready completion orchestrator-owned.
Use verified Cursor background shell + notify_on_output with REST only.
Perform initial reconciliation; use idle delays 30, 120, 120, 300, 300, 600 seconds, capped at 600.
Keep relevant active/expected checks at 120 seconds. Honor provider restrictions and Retry-After.
Persist revisions and pending/emitted/consumed state; reconcile durable ACKs on restart.
Do not seed away pending work or wake repeatedly for unchanged gates. Paginate fully; cover edits and parked answers.
Keep healthy watches across drains. Treat the shell as mortal: arm -> assume mortal -> re-arm after observed loss.
Reconcile once before rearming. A dead watcher cannot wake itself.
If capability is missing, report the issue and exact manual resumption obligation. Do not invent cross-chat messaging.
Never monitor the Planner's own process, kickoff or completion. The orch owns completion and parked-worker watches.
Never use Projects/GraphQL on the hot path. Verify effective source, board, marker and pending ACK before blaming the monitor.

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
