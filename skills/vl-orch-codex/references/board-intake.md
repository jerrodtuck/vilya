# Board intake and adaptive watches (#384)

Read this contract with the applicable host adapter before intake or parked-watch changes.
This contract covers #379 requests 1 and 2 once. Standing merge authorization remains separate and unresolved.
The owning issue holds direction, questions, rulings, plans and evidence. Local state holds transport bookkeeping only.

## Publish and consume a handoff

Before handoff, verify the exact repository, OPEN issue, configured board membership and effective installed source.
Use the current fresh identity/board read. Do not add Projects polling to the hot path.
Put `<!-- vilya-handoff:v1 mode=dispatch -->` in the architect handoff comment.
Apply `handoff:pending` for discoverable intake. Create the label once if absent under authorized issue setup.
For record-only substance, use `<!-- vilya-handoff:v1 mode=record-only -->`.
Treat unmarked comments as record-only. Legacy `dispatch:` prose alone does not satisfy this board-intake marker.
`do-not-dispatch, filed-for-record` remains record-only. Never infer dispatch authority from a pending label alone.
For amendments, edit the source comment or add another marked comment. Reapply `handoff:pending` when consumption is needed.
`plan:ready` still means a finished plan. A pending handoff requests ranked triage, not implementation or a priority override.

Read relevant changed substance before action. Preserve priority, dependencies, exact issue gates and role boundaries.
Route to Planner enqueue, an existing accepted plan, record-only, or a named pending decision.
Post a substantive acknowledgment on the issue. Name the consumed source, understood change, route and remaining gate.
Include this exact marker shape, with the source comment's REST numeric ID, exact `updated_at` and SHA-256 of its UTF-8 body:

```text
<!-- vilya-handoff-ack:v1 source=123 updated_at=2026-10-21T12:00:00Z sha256=<64-lowercase-hex> -->
```

Validate the receiver's identity and authority. The marker alone is not substantive consumption or approval.
An acknowledgment consumes only its exact revision. Transport acceptance, label removal and local emission never consume it.
Before removing `handoff:pending`, reconcile all source revisions again. Retain the label if any revision remains unconsumed.
A concurrent amendment stays pending. A stable pending question or policy gate does not create repeated fresh wakes.

At a worker fork, post exact options, costs and recommendation on the issue before returning.
Apply `needs:decision` and the existing blocked-state procedure. Stop dependent work until the required ruling exists.
Register the issue as a parked watch. Keep its question and authoritative answers on the issue.
Do not repeat the request because time elapsed. Re-read answers before escalation or ending work.

## Completion reconciliation

After an accepted unit or batch, the orchestrator reconciles remaining authorized scope before finalizing the turn.
Reconcile relevant active workers, the current queue and substantive issue amendments once at this boundary.
Reuse sufficient current evidence and inspect relevant changes.
If eligible authorized work remains, continue during the active turn under existing ranking, settled plans, ownership and dependencies.
A locally chosen batch boundary does not complete an open-ended authorized queue request.
An open epic or Todo status does not authorize dispatch. Preserve operator holds and all existing authority gates.

If no eligible work remains, report actual issue-by-issue dispositions and each precise remaining gate.
Distinguish delivered/unmerged, held for approval, deferred/parked, unresolved decision/dependency and epics requiring reconciliation.
Identify genuinely ready next work when present; do not manufacture implementation from an unresolved obligation.
Use commentary for next actions during work. Final reports describe performed actions and outstanding obligations.
Never finalize with an unperformed promise to reconcile, continue or check the remaining queue.
Do not rescan full issue bodies or rerun tests merely to stay active.

Active-turn continuation is not a persistent wake. A final message does not arm a watcher.
When future intake is expected, name the actual supported authorized wake and its observed status.
If authorization or capability is absent, report intake unarmed and its exact resumption obligation.
This completion check creates no automation, daemon, service, role or authority to resume parked work.

## Schedule and silent checks

Perform one initial reconciliation. After successive unchanged reconciliations, delay `30, 120, 120, 300, 300, 600` seconds.
Continue at 600 seconds. Newly actionable revisions reset idle progression; unchanged gates do not.
Relevant active-worker or expected-handoff watches use 120 seconds. Keep unrelated idle streams separate.
Honor provider minimum cadence and Retry-After, even above 600 seconds. Failures and partial responses are not empty queues.
Document the supported fallback when the host cannot use the exact schedule.
Idle detection can take ten minutes, excluding outages and provider restrictions.

Run unchanged checks in the supported watcher/control layer. Emit no wake, model summary or user update for unchanged state.
Prefer narrow REST label/issue discovery and conditional requests. Never hot-poll Projects or GraphQL.
Paginate every response fully before advancing a watermark. Use updated timestamps with an overlapping boundary, not ID-only cursors.
`sinceBoundary` subtracts one second from the last complete watermark. Deduplicate by exact revision key.
For registered parked/active issues, check body, labels and comment updates, including edited old comments.
Use issue comment `since` by update time; preserve equal-time results and follow every pagination link.
Use complete issue listings rather than truncated search results where search limits could hide candidates.
Fetch full substance only for relevant changes and before action. Own ACKs and unrelated comments do not become actionable revisions.
Label removals, parked answers and relevant body changes need normalized revisions too; include stable source identity and hashed content.
If a changed pending gate needs no new action, reconcile it without emitting another actionable revision.

## Pure helper and persistence boundary

The complete `vl-orch-codex` folder includes [intake-state.mjs](../resources/intake-state.mjs).
Install complete sibling folders for shared references. Raw SKILL.md downloads alone are incomplete.
The helper starts no process. It owns no REST, filesystem, timer or host wake mechanism.
Import `revisionOf`, `initialState`, `restoreState`, `reconcile`, `markEmitted` and `sinceBoundary` from its absolute resolved path.
`revisionOf({issue, source, updatedAt, content})` hashes exact content and returns stable revision metadata plus `key`.
Use a canonical issue URL and stable source identity, such as `comment:123`, `body`, `labels` or a PR identity.
The adapter supplies normalized observations:

```js
const result = reconcile(state, {
  ok: true, complete: true, watermark: lastFullyFetchedUpdate,
  revisions: [{ ...revision, mode: 'dispatch' }],
  acknowledgments: [{ key: consumedRevision.key, substantive: true }],
  active: false, minimumSeconds: 0, retryAfterSeconds: 0,
});
```

Set `mode: 'dispatch'` only after verifying the exact dispatch marker and pending label.
Defer dispatch-marked sources without the pending label, as described under Publication ordering.
Unmarked and explicit record-only revisions default to record-only.
`dispatchCandidates` permits ranked consideration only; it never authorizes dispatch.
Set `substantive: true` only after reading the valid receiver's substantive prose and exact durable ACK marker.
On failed requests or incomplete pagination, pass `ok: false` or `complete: false`.
The helper preserves cursors, revisions and empty-check progression, then returns a safe retry delay.
Use a separate state per independently scheduled stream. Do not let active watches accelerate unrelated idle intake.

Persist `result.state` through atomic replacement before bounded host output. Then persist `markEmitted(state, result.wakes)`.
Do not call `markEmitted` unless output was accepted. Emitted remains unconsumed until the durable ACK exists.
A crash between persistence and output can repeat delivery; no exactly-once claim is supported.
On restart, load the versioned state and reconcile pending labels plus registered watches against durable ACKs.
Never seed away unconsumed work. Corrupt, missing or incompatible state requires bounded reconciliation before action.
`restoreState` reports `reconcileRequired`; it does not silently establish consumption.
The helper retains at most 2048 revision entries. Capacity errors stop advancement without silently evicting pending work.
Retire entries only after durable consumption and closure of watch obligations through explicit `retiredIssues`.
Keep pending, emitted and consumed distinct. Advance watermarks only after complete observations; pending work survives watermark changes.

## Host execution and liveness

Cursor: verify REST/background-shell/`notify_on_output` capabilities before arming.
Use arm -> assume mortal -> re-arm after observed death or a missing expected signal.
Reconcile once before rearming. Keep a healthy watcher across drains; do not restart it merely to seed state.
A dead watcher cannot wake itself. Report the owning issue and exact missing wake capability for manual resumption.
Do not invent Cursor cross-chat messaging. Preserve the existing branch-based PR matching rules.

Claude Code: use its exposed Monitor/wake contract and verified minimum cadence.
Do not import Cursor shell lifetime guarantees or substitute an exit-only watch loop.
Preserve title-based PR matching for random Claude branches and all host confirmation requirements.

Codex: retain native child completion, active-turn waits and authorized resolved cross-chat messages.
Active-turn waits end with the turn. Recurring intake requires separate human authorization and supported automation.
Do not arm an automation through installation of this policy.
If silent model-free variable cadence is unavailable, report that limit. Do not add a daemon, CLI backend or fixed model loop.

Before blaming a dead monitor, verify effective instruction source, exact issue, board membership, handoff marker and pending ACK.
Reconcile changed answers and revisions before resumption. Preserve required Planner/operator decisions and the same-defect repair ledger.
Keep API request counts, watcher wakes and model issue reads separate in evidence. Missing usage is unavailable, not zero.
A native handoff demonstrates only that path. Source checks and simulated watcher loss do not prove Cursor/Claude wake or model-free silence.

## Publication ordering

If a dispatch-marked source lacks handoff:pending, defer its handoff observation; do not normalize it as record-only.
Reconcile every pending-labeled issue's complete marked sources, independent of the stream watermark, including at startup.
A later pending label therefore exposes the original exact comment revision for ranked triage and its matching ACK.
Keep unmarked and explicit record-only substance conservative. Neither becomes a dispatch candidate through a label alone.
Parked-answer watches use their own source namespace; they never consume unpublished architect direction as a handoff.
Normalize label/body changes for parked answers as reconciliation events, not automatic dispatch instructions.
Record their substantive consumption on the issue; do not confuse them with a comment handoff ACK.
