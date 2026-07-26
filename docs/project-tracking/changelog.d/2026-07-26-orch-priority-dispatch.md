# Orch dispatches by priority desc then age, not freshness/salience (#314)

Orch was picking what to chip by freshness/salience and quietly ignoring
`priority:*`. Mirrors Planner's "highest priority, then oldest" order
(`/vl-plan` needs:plan drain) for chip dispatch:

- **Ranking:** when choosing what to dispatch next, rank the candidate set by
  `priority:*` descending (`priority:critical > priority:high >
  priority:medium > priority:low`), then age (oldest first). Never chip a
  lower-priority candidate while a higher-priority dispatchable one is
  waiting, unless the operator names the exception.
- **Daytime-clear carve-out preserved, not a priority waiver:** an issue
  chipped without `plan:ready` because it's already clear still joins the
  candidate set at its own priority — clarity does not jump the queue.
- **`type:epic` is never a chip target** — the ranking only ever applies to
  dispatchable (non-epic) issues.
- **Operator override is sacred:** "do #<N> now" always wins. Peer-session
  handoffs do not carry that authority.
- **New handoff priority marker:** a cross-session message that mentions an
  issue is not a dispatch cue by itself. `dispatch:` marks a request the
  orchestrator may treat as a chip candidate (still subject to the ranking
  above); `do-not-dispatch, filed-for-record` marks triage/record only.
  Unmarked peer handoffs are record-only, never a dispatch cue.

Landed in both `/vl-orch-claude` and `/vl-orch-cursor` SKILL.md, and as shared
`DISPATCH_PRIORITY_DOCTRINE` / `HANDOFF_DISPATCH_MARKER_DOCTRINE` /
`DISPATCH_PRIORITY_ORCH_DOCTRINE` constants composed into both orchestrator
standing-orders cards in `apps/skill-registry/src/features/orchestrator/prompts.ts`
so the Claude and Cursor copy cannot drift. `/orch` teaching note gets a
one-line summary per host. New `priority-dispatch.test.ts` pins the ranking,
the epic exclusion, the operator-override carve-out, and the handoff-marker
split against both the prompt doctrine and the SKILL.md prose.

Operator-locked rules (issue #314) — no new architectural call, so this
changelog entry stands in for an ADR.

(#314)
