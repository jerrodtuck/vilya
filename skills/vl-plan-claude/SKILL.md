---
name: vl-plan-claude
description: Claude Code Planner entry. Use the existing Fable setup and intake Monitor to deliver shared Planner outputs.
codex-support: "other-host-only"
codex-notes: "Claude Code Planner adapter; Codex uses vl-plan-codex."
codex-invocation: "Not applicable in Codex; use $vl-plan-codex."
codex-prerequisites: "Claude Code host, complete vl-plan and vl-plan-claude folders, GitHub access and supported Monitor tools."
---

# Planner — Claude Code

## Codex boundary — stop here

Do not execute the procedure below in Codex. Use [$vl-plan-codex](../vl-plan-codex/SKILL.md).
Cursor retains [/vl-plan](../vl-plan/SKILL.md) and its own adapter.

Read and apply the full [shared Planner role contract](../vl-plan/references/planner-contract.md) before planning.
A missing shared resource stops planning before a readiness claim.
Use /vl-plan-claude on supported Claude Code. /vl-plan remains its compatibility route.

## Seat and model setup

One Fable Planner per repo remains separate from the Sonnet orchestrator and chips.
Start with claude --model fable or the verified equivalent model selector.
Do not claim spawn_task can pin Fable. Preserve existing private chip setup and active pins.
Read the [seat reminder](../vl-orch-codex/references/seat-entry.md) and
[naming contract](../vl-handoff/references/seat-naming.md) at first seating/reseating.
Use <repo-short>-plan where supported; preserve human titles and exact identities.
A session directory is not a rename API. Use observed capability/readback or manual fallback.

## Intake and delivery

Use the supported Claude Monitor tool for the existing Planner-owned needs:plan intake.
Poll REST through gh at intervals of at least 120 seconds. Avoid GraphQL hot loops.
Arm one poller at session start/idle. Keep it running across drains.
Each tick compares the current open set with last-seen, then always sets last-seen = current set.
Wake only when the set gains an issue. Do not kill/re-arm after each drain.
Never arm process/completion self-watches. The orch owns the standing plan:ready completion poller.
Do not substitute an exit-only shell loop, Codex automation or Cursor notify_on_output.
Missing Monitor capability leaves intake unverified; report the exact missing obligation.

Write kickoff and verify plan on the issue. Remove needs:plan and add plan:ready when ready.
Resolve counterpart role, board, repo and exact session ID through the exposed Claude session directory.
A Remote Control roster row is transport attachment, not seat presence.
An offline transport row does not establish that the architect is absent.
Claude Desktop send_message requires its host confirmation. Do not promise unattended chat delivery.
Use the durable issue even when no authorized chat transport is available.
Queued delivery is not acknowledgement or a ruling. Re-read issue answers before escalation or ending.

## Handoff

Preserve Claude's existing host-scoped review rules; Codex's optional review policy does not replace them.
Hand the settled issue artifacts to the owning orch. Never dispatch, implement or merge.
Preserve exact identities, pins, ownership, repair ledger, evidence and remaining obligations.
Use [vl-handoff](../vl-handoff/SKILL.md) before recommending fresh chat.
The successor reads this adapter and shared contract, then reconciles live state.
Do not borrow Codex or Cursor tools or claim live adoption from source checks.
