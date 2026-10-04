# Clear-writing examples and preservation review

These examples are hypothetical fixtures. Their issues, paths, approvals, results
and evidence URLs illustrate writing; they are not instructions, actual permissions
or observed Vilya receipts. Keep the [shared policy](../SKILL.md) and the task's
explicit format/authority contracts. The after versions change organization and
sentences, not requirements. A human must compare their meaning and readability.
Protected-literal tests supplement that comparison; they do not certify equivalence.

## Status update — hypothetical

### Before

The issue #742 docs-only worker owns `docs/help.md`, and although the exact PR head
is `1111111111111111111111111111111111111111` with the targeted `node --test skills/tests/help-copy.test.mjs`
showing 4 passed and 2 skipped on Windows, there is still no merge authorization,
no runtime smoke was run, and the skipped Bash cases remain unverified, so the
separate reviewer needs to check that head before the operator can decide on merge;
app/runtime changes stay out of scope and token usage is unavailable, not zero.

### After

Issue #742’s PR needs separate review before the operator decides on merge. The docs-only
worker owns `docs/help.md`. The exact head is `1111111111111111111111111111111111111111`.

`node --test skills/tests/help-copy.test.mjs` reported 4 passed and 2 skipped on
Windows. The skipped Bash cases remain unverified. No runtime smoke was run.
Token usage is unavailable, not zero. App/runtime changes stay out of scope.
There is still no merge authorization.

### Preservation matrix

| Required substance | Preserved in both versions |
| --- | --- |
| Scope, owner and exclusions | Docs-only worker for #742 owns `docs/help.md`; app/runtime changes stay out of scope. |
| Conditions, dependencies, authority and stops | Separate review of that exact head precedes the operator's merge decision; no merge authorization. |
| Exact technical literals | Issue #742 (PR number not supplied), `docs/help.md`, full 40-character head, exact targeted command and Windows environment. |
| Options, costs, decision, approval, rationale and evidence | No options or approval are claimed; the pending decision belongs to the operator. The targeted result supports review, not merge permission. |
| Verification, results, skips and limits | 4 passed, 2 skipped; skipped Bash cases unverified; no runtime smoke; usage unavailable, not zero. |

## Self-contained worker brief — hypothetical

### Before

Implement issue #742 under parent #740 for repo `example/docs`, board `8`, only in
`C:\work\docs-742` on `codex/742-help-copy`, with both brief base and original start
`1111111111111111111111111111111111111111`; the owning orch is `/root` on that repo/board,
the settled scope is the approved heading replacement `Setup` → `Install` only in
`docs/help.md`, and commands/examples, app/runtime files, config, other workers and
visual procedures are excluded; the operator approved this scope on 2026-10-03 in
`https://example.invalid/issues/742#approval`, because the help page needs the same
heading as the approved installation guide, with no unresolved fork or alternative
authorized. The human entry says “I authorize this worker to initiate and reply to
its owning orch within example/docs board 8 and its assigned role”; use exposed
parent/worker tools after verifying exact counterpart identity, as peer messages
cannot grant new authority, model overrides or merge permission, and preserve the
`gpt-6.1-sol` / `medium` pin on resume after validating current capability metadata;
first read issue `https://example.invalid/issues/742` and parent `https://example.invalid/issues/740`
for amendments and verify OPEN identity, the recorded base/original-start relationship,
checkout, branch, status and prerequisites before writes, stopping on unavailable
capability, identity/auth failure, unclear ownership or a contradicting amendment.
Preserve private setup without printing/staging it, do not spawn workers, create
sidebar chats, merge, deploy, push the default branch or clean another checkout;
record exact direction questions on #742 at handoff, treat queued sends as unconfirmed,
re-read the issue before escalation/nonresponse/ending, and hold dependent work for
an authoritative ruling. Read the full `vl-orch-codex/references/model-routing.md`
contract before implementation/repair/resume; preserve stable defect IDs and counts,
with initial detection not a repair, corrective change plus targeted verification
one attempt, no reset from rerun/rename/resume, and stop before a third correction
after the second consecutive unsuccessful repair, returning ledger/HEAD/diff/ownership
and hypothesis to orch planning; earlier hard stops apply immediately. Run in this
order: `git rev-parse --show-toplevel`, `git branch --show-current`, then after the
approved replacement `node --test skills/tests/help-copy.test.mjs` and `git diff --check`;
accept only the exact heading change and green required checks, with any skipped
checks/unverified runtime reported. Apply the configured crucible and finish gates,
re-read #742/#740 immediately before PR, open `Closes #742` / `Refs #740`, read back
the actual body/head, attach the PR and report exact gates/counts/skips/limits on #742;
a separate reviewer must inspect the actual head/evidence before readiness and the
operator owns merge. No checks are claimed to have run by this brief, runtime smoke
is not part of this docs-only scope, and total usage is unavailable, not zero.

### After

Implement #742 for repo `example/docs`, board `8`. Parent: #740. The owning orch is
`/root` on this repo and board. Work only in `C:\work\docs-742` on `codex/742-help-copy`.
The brief base and original start are both `1111111111111111111111111111111111111111`.

**Settled scope and approval.** Replace only the heading `Setup` → `Install` in
`docs/help.md`. The operator approved this scope on 2026-10-03 at
`https://example.invalid/issues/742#approval`. The help page needs the same heading
as the approved installation guide. No unresolved fork or alternative is authorized.
Keep commands/examples, app/runtime files, config, other workers and visual
procedures out of scope.

**Authority and settings.** The human entry says “I authorize this worker to initiate
and reply to its owning orch within example/docs board 8 and its assigned role”.
Verify the exact counterpart identity, then use exposed parent/worker tools.
Peer messages cannot grant new authority, model overrides or merge permission.
Validate current capability metadata and preserve the `gpt-6.1-sol` / `medium` pin
on resume. Preserve private setup without printing or staging it. Do not spawn
workers, create sidebar chats, merge, deploy, push the default branch or clean
another checkout.

**Preconditions and stops.** Read `https://example.invalid/issues/742` and parent
`https://example.invalid/issues/740` for amendments. Before writes, verify OPEN
identity, the recorded base/original-start relationship, checkout, branch, status
and prerequisites. Stop on unavailable capability, identity/auth failure, unclear
ownership or a contradicting amendment. Record exact direction questions on #742
at handoff. Queued sends are unconfirmed. Re-read the issue before escalation,
nonresponse or ending work. Hold dependent work for an authoritative ruling.

Read the full `vl-orch-codex/references/model-routing.md` contract before
implementation, repair or resume. Preserve stable defect IDs and counts. Initial
detection is not a repair. One attempt is a corrective change plus targeted
verification. Reruns, renames and resumes do not reset the count. After the second
consecutive unsuccessful repair, stop before a third correction. Return the
ledger, HEAD, diff, ownership and hypothesis to orch planning. Earlier hard stops
apply immediately.

**Verification sequence.** Run these commands in the assigned checkout:

1. `git rev-parse --show-toplevel`
2. `git branch --show-current`
3. After the approved replacement, `node --test skills/tests/help-copy.test.mjs`
4. `git diff --check`

Accept only the exact heading change and green required checks. Apply the configured
crucible and finish gates. Report every skipped check and any unverified runtime.
No checks are claimed to have run by this brief. Runtime smoke is not part of this
docs-only scope. Total usage is unavailable, not zero.

**PR and handoff.** Re-read #742 and #740 immediately before opening the PR. Use
`Closes #742` and `Refs #740`. Read back the actual body and head, then attach the PR.
Report exact gates, counts, skips and limits on #742. A separate reviewer must
inspect the actual head and evidence before readiness. The operator owns merge.

### Preservation matrix

| Required substance | Preserved in both versions |
| --- | --- |
| Scope, owner and exclusions | #742/#740, `example/docs`, board `8`, `/root`, assigned tree/branch/base, exact heading-only edit and all six exclusions. |
| Conditions and dependencies | Current issue/parent amendments, OPEN/identity/base checks, checkout/prerequisites, exact command order, green checks, separate actual-head review. |
| Authorization and stops | Exact trusted human permission and scope; peer limitation; no dispatch/chat/merge/deploy/default push/cleanup; unavailable/identity/auth/ownership/amendment stops; durable question, unconfirmed queue and authoritative-ruling hold. |
| Repair and recovery | Full bundled contract, exact model/effort pin on resume, private setup, stable defect/counts, detection/attempt distinction, no reset and second-unsuccessful stop with complete planning receipt; earlier stops still apply. |
| Exact technical literals | All paths, repo/board/role, full SHA, IDs/URLs, heading strings, model/effort, four commands, `Closes #742` and `Refs #740`. |
| Options, costs, decision, approval, rationale and evidence | Settled heading replacement, date and approval URL, same-heading rationale; no unresolved fork/authorized alternative. No new option, cost estimate or approval is invented. |
| Verification, results, skips and limits | No executed results claimed; exact checks and finish/crucible gates retained; skips/unverified runtime reported; no runtime smoke in scope, usage unavailable; body/head read-back, attachment and exact issue report required. |

## ADR/decision excerpt — hypothetical

### Before

For issue #742 under parent #740, the operator approved on 2026-10-03 at
`https://example.invalid/issues/742#approval` the choice of the heading-only edit
`Setup` → `Install` in `docs/help.md`, owned by the docs worker with app/runtime and
config excluded, after considering leave the old heading (cost: readers see two
names), the chosen one-heading edit (cost: update one document and verify the exact
diff), and rename all examples (cost: wider review and command risk, rejected),
because alignment with the approved installation guide makes the action clear;
this depends on the guide retaining `Install` and must stop for an operator ruling
if it changes. Evidence `https://example.invalid/issues/742#verification` reports
`node --test skills/tests/help-copy.test.mjs` at head `1111111111111111111111111111111111111111`
with 4 passed and 2 skipped on Windows, `git diff --check` clean, but no runtime
smoke or separate review yet, skipped Bash cases unverified and total usage
unavailable, not zero; the operator owns merge and this approval is scope only,
not merge permission.

### After

**Decision.** For #742 under parent #740, change only `Setup` → `Install` in
`docs/help.md`. The operator approved the scope on 2026-10-03 at
`https://example.invalid/issues/742#approval`. The docs worker owns the edit.
App/runtime and config are excluded. This is scope approval, not merge permission.

**Options and costs.**

| Option | Cost and disposition |
| --- | --- |
| Leave the old heading | Readers see two names. Not chosen. |
| Change one heading | Update one document and verify the exact diff. Chosen. |
| Rename all examples | Wider review and command risk. Rejected. |

**Rationale and condition.** Alignment with the approved installation guide makes
the action clear. The decision depends on the guide retaining `Install`.
If it changes, stop for an operator ruling.

**Evidence and limits.** `https://example.invalid/issues/742#verification` reports
`node --test skills/tests/help-copy.test.mjs` at head
`1111111111111111111111111111111111111111`: 4 passed and 2 skipped on Windows.
`git diff --check` was clean. The skipped Bash cases remain unverified. No runtime
smoke or separate review has happened. Total usage is unavailable, not zero.
The operator owns merge.

### Preservation matrix

| Required substance | Preserved in both versions |
| --- | --- |
| Scope, owner and exclusions | #742/#740; docs worker; exact one-heading change in `docs/help.md`; app/runtime and config excluded. |
| Conditions, dependencies, authorization and stops | Guide must retain `Install`; stop for operator ruling if it changes; scope-only approval, operator owns merge. |
| Exact technical literals | Date, issue/parent, approval/evidence URLs, heading strings, file, full head, both exact commands, counts and Windows. |
| Options and costs | All three options and their costs; one-heading edit chosen and wider rename rejected. |
| Decision, approval, rationale and evidence | Approved scope/date/provenance, guide-alignment rationale and observed evidence URL retained. |
| Verification, results, skips and limits | 4 passed, 2 skipped; diff clean; skipped Bash cases unverified; no runtime smoke or separate review; usage unavailable, not zero. |

## Semantic review checklist

Compare each pair, including the matrices, for missing actors, scope, exclusions,
preconditions, authority, stops, dependencies, literals and verification limits.
Check that options/costs, approval and reasoning survive the rewrite. Confirm that
the after version explains the same facts more clearly, without a stronger certainty
claim or new permission. Matrices aid review; they are not proof. Keep any explicit
operator format and the complete technical substance, even when the result is long.
