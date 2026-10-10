---
name: vl-handoff
description: >-
  Help a Vilya seat save a complete handoff and starter when its end-of-work-unit
  checkpoint recommends moving to a fresh chat.
codex-support: "shared-compatible"
codex-notes: "Small helper behind the shared continue/compact/fresh-chat checkpoint; creates no chat or authority."
codex-invocation: "$vl-handoff"
codex-prerequisites: "A verified repo, board and owning issue or PR at a safe work boundary."
---

# Vilya handoff helper

## Shared communication

Read and apply the full [vl-adhd writing policy](../vl-adhd/SKILL.md) and
[vl-present presentation contract](../vl-present/SKILL.md) at entry. On Codex use
`$vl-adhd` / `$vl-present` when discovered; on Claude Code or Cursor use their supported
invocation or explicitly read/apply these resolved sources. Identify an unknown host
before choosing syntax. Apply them to all authored prose while preserving facts,
uncertainty, permissions and stop/verification gates.

## Shared checkpoint

At the end of a work unit, decide whether to **continue here**, **compact this chat**, or
**recommend a fresh chat**. Explain briefly. If recommending a fresh chat, save the
handoff and provide the starter prompt first.

Use normal boundaries: issue completion, PR reaching review, a settled architecture
decision or topic change. A plan adds another checkpoint only for an unusual safe stopping
point. Continue useful active repairs. An exposed context-fullness signal can inform the
choice, but there is no universal timer, turn count or token threshold and no invented
usage reading.

Use the host's built-in Compact command to shorten the current chat where supported; do
not build or promise a replacement compactor. This skill is the small fresh-chat handoff
helper behind the checkpoint, not a monitor, measurement system or runtime engine.

## Fresh-chat handoff

Before recommending a fresh chat, save one complete record on the owning issue or PR and
return its stable link. Include the exact issue, PR, head, worktree and branch; decisions
and unresolved work; ownership, live workers and locks; active pins; repair ledger and
verification; pending decisions and dependencies; authorization, financial limits/holds
and stop gates.

Compacting or replacing a chat resets none of that state, authority or independent-review
requirements. The receiving seat reconciles live ownership, workers, locks and ledger
before action. Never abandon active work or create duplicate workers to shorten context.
A new sidebar chat still requires explicit human authorization; invocation creates none.

Return:

1. `recommend fresh chat` and the concrete reason;
2. saved complete handoff link;
3. unresolved work;
4. one filled ready-to-paste starter:

```text
Seat: <seat> for <owner/repo>, board <number>.
Read the complete handoff: <stable link> and current owning-issue amendments.
Verify issue/PR/head/worktree/branch, then reconcile ownership, live workers, locks, active pins,
repair ledger, verification, pending decisions, dependencies, authorization, financial limits/holds
and stops. Resume without resetting or duplicating anything; report contradictions before dependent work.
```

The handoff is evidence, not proof that live state stayed unchanged. Distinguish an actually
exercised transfer from source/tests and claim no savings without measurement.

## New-model recalibration

Apply this section only when the operator asks about a newly released model or routing
recalibration. Return execution to the owning orchestrator. Screen current independent benchmark
evidence first, challenge the lowest applicable proven seat, and use only the
smallest matched fixture needed for local confirmation. Paid execution remains
operator-only. Publish sanitized evidence on `/evaluation`; this skill starts no paid call
and preserves current routing, financial holds/caps and evidence gates.
