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
A receiving seat reads/applies the full [seat reminder contract](../vl-orch-codex/references/seat-entry.md): an explicit reseating may give one brief host/seat/invocation/assigned-pin/setup reminder; a same-seat resume preserves the pin and does not repeat it per turn.
A new sidebar chat still requires explicit human authorization; invocation creates none.

## Archive safety of the old owning chat

Whenever recommending or transferring to a fresh chat, identify the **old owning chat**
by host and exact chat ID. Return `safe to archive`, `not safe to archive`, or
`unverified (treated as not safe)`, with a concrete reason, evidence and manual action.
This is part of the single checkpoint above, not an extra monitor or cleanup gate.
A complete written handoff alone does not establish archive safety.

Before recommending archival:

1. Reconcile the old owner's actual associated and attached worktrees, including background
   trees when its current directory is Local. Use current host attachment/ownership tools
   (Codex `list_artifacts` in the owning chat) and checkout evidence. Reconcile live workers,
   locks and dependent work; do not infer ownership from a path. Missing, stale or conflicting
   inventory is unverified. Record each tree's identity, owner, lifecycle type and whether
   remaining work still needs it. An unavailable attachment query is not an empty inventory.
2. Establish the current host's archival effect for each tree. The
   [official Codex worktree documentation](https://learn.chatgpt.com/docs/environments/git-worktrees)
   (checked 2026-10-09) says archiving an associated chat deletes its managed worktree;
   a permanent worktree is not automatically deleted by chat archival. Codex saves a recovery
   snapshot before managed deletion. Snapshot recovery does not establish preservation of
   every required ignored/untracked file or continued access to the existing environment.
   A pin is not proof against deletion on archival. For Claude Code or Cursor, verify their
   actual lifecycle and ownership contracts; do not import Codex deletion behavior. Unknown
   host behavior makes the result unverified.
3. For every needed environment, verify preservation through a supported, already authorized
   mechanism and confirm successor access to the exact required head, branch and checkout,
   plus necessary ignored/untracked local setup. Keep private file contents out of public
   records; record setup verification and evidence references without exposing secrets.
   A push, PR, written path, pin, snapshot or second chat attachment alone is insufficient.
   Do not assume a second attachment disables deletion triggered by the first owner.
   A permanent tree qualifies only after its actual type, successor access and complete
   needed state are verified. This skill grants no conversion, branch migration, private-file
   copy, settings change or new-chat creation to manufacture proof.
4. Save the inventory and preservation/access evidence with the complete handoff. Record
   the successor identity when established, or explicitly say it is pending. The receiving
   seat must recheck the actual attachments, ownership, head/branch/checkout and local setup
   before action. Contradictions stop dependent work; a saved claim is not current proof.

Use `safe to archive` only when the reconciled inventory has no unresolved ownership or
active-work dependency and every needed environment is verified to survive archival and
remain accessible to the successor. This assessment does not authorize or perform archival.
A known loss/dependency means `not safe to archive`; missing evidence means
`unverified (treated as not safe)`. In either case tell the operator: **keep the old owner
chat unarchived**, name what needs verification or preservation, and prefer continue here
or built-in Compact while work depends on it. Do not archive/delete a live tree as a test.

| Semantic case | Required result and action |
| --- | --- |
| Needed Codex-managed tree would be deleted with old owner | Not safe to archive; keep old owner unarchived until supported preservation and successor access are verified. |
| Needed permanent tree with verified lifecycle, exact state/setup and successor access; ownership reconciled | Safe to archive assessment; explain the evidence and that operator archival authority still applies. |
| Completed unit, reconciled inventory, no needed environment or live/dependent worker/lock remains | Safe to archive assessment; completion alone without the inventory would be unverified. |
| Attachment inventory unavailable/missing or required private setup preservation unknown | Unverified (treated as not safe); keep old owner unarchived and resolve the specific missing evidence. |
| Successor has a second attachment or a mismatched head/branch/setup | Not safe or unverified as evidence warrants; reconcile exact state and deletion ownership before dependent action. |
| Successor reconciles all needed preserved environments and ownership with current host evidence | Safe only when every condition above holds; retain all pins, ledgers, gates and authority. |

These examples and source tests are instruction checks, not an exercised archival transfer.

Return:

1. `recommend fresh chat` and the concrete reason;
2. saved complete handoff link;
3. old owning chat ID, archive-safety result, concrete reason/evidence and manual action;
4. unresolved work;
5. one filled ready-to-paste starter:

```text
Seat: <seat> for <owner/repo>, board <number>.
Read/apply full vl-orch-codex/references/seat-entry.md from the resolved skill folder; give one brief reminder only on first seating/explicit reseating, preserving overrides and exact resumed pins.
Read the complete handoff: <stable link> and current owning-issue amendments.
Old owning chat: <host + exact ID>. Archive safety: <result>; reason/action: <evidence + action>.
Recheck associated/attached trees, preservation, successor access and required local setup.
Keep the old owner unarchived if safety remains unsafe or unverified.
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
