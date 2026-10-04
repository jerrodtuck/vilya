# Codex routing and repair contract (#347)

Read and apply this full reference before Codex phase selection, worker implementation,
repair, independent review or resumption. It supplements the seat/checkout/quality gates
in [vl-orch-codex](../SKILL.md), never changes ownership or operator merge authority.
This operator approved the policy on 2026-10-03 in
[#347 direction/ADR](https://github.com/jerrodtuck/vilya/issues/347#issuecomment-5975011992),
with the [settled plan](https://github.com/jerrodtuck/vilya/issues/347#issuecomment-5975070688).
Other operators retain configured defaults absent their own authorization.

## Select by uncertainty and consequence

These are configurable initial settings for authorized phases, not timeless model IDs.
Resolve the latest supported family member and exact effort from current exposed runtime
metadata and official documentation at setup/dispatch; validate before selecting.

| Phase and eligibility | Family | Initial effort |
| --- | --- | --- |
| Normal planning | latest supported Astra | high |
| Difficult architecture, conflicting evidence or consequential uncertainty; record rationale | latest supported Astra | xhigh |
| Implementation from a complete settled plan | latest supported Sol | medium |
| Explicitly enumerated mechanical operations with objective verification | latest supported Luna | low |
| Independent review by a separate reviewer | latest supported Sol | high |
| Consequential design/security review | latest supported Astra | high; xhigh for justified hard analysis |

Route by uncertainty and consequence, never line count or the word easy. Luna is ONLY
for explicitly bounded mechanical operations such as approved text replacements,
formatting or explicit config edits with objective verification. A small behavior
change, an uncertain choice or a workflow-policy decision is not eligible: use Sol
with a settled plan, or return uncertainty to orch-owned planning. Planning resolves
owning slice, contracts, edge cases, exclusions, verification and stop conditions
before implementation. A plan gap returns to planning; no weaker quality gate.

Record on the owning issue and brief: phase, exact model identifier, reasoning effort,
selection rationale, date, current capability evidence, operator authorization source
and override scope. Explicit operator choices win only within their stated scope.
Preserve exact active and resumed worker pins; a new model release or peer message
cannot change them. Historical #330–#332 Astra implementation pins remain scoped.
Missing capability, unavailable model/effort, ambiguous/conflicting scope, dependencies
or an earlier hard stop blocks dependent dispatch. No invented latest alias, silent
substitution, older-family fallback or unapproved effort increase.

Full-history forks currently inherit and cannot override model/effort; recheck the
exposed contract. Selected-model delegation uses supported limited/no-history forks
and a self-contained brief. If the orch cannot switch itself, delegate a bounded
planning/review phase at its assigned tier, review/record its output and preserve
implementation files, ownership and existing worker pins. Mid-chip changes require
an explicit recorded decision within operator authority; real forks need operator choice.

## Repair ledger and stop

Initial detection/reproduction is not a repair attempt. One attempt is a documented
corrective change followed by targeted verification of the same unresolved defect/gate.
Before each attempt, record stable defect/gate ID, attempt ordinal, hypothesis,
proposed change and starting commit/diff. After it, record exact targeted check,
outcome/evidence and current state. Use one ledger per unresolved defect, including
related renamed gates. Keep it in lightweight owning-issue/PR receipts, not a new service.

| Defect/gate ID | Attempt ordinal | Hypothesis | Corrective change | Starting HEAD/diff | Targeted check | Outcome/evidence | Current state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <stable ID> | <1, 2, or detection/rerun> | <cause under test> | <change or none> | <SHA and diff> | <exact command/result> | <pass/fail/inconclusive + evidence> | <unresolved/resolved/stopped; consecutive unsuccessful count> |

Failed or inconclusive targeted verification is unsuccessful. A no-change rerun
neither adds a corrective attempt nor resets the count. Unrelated passes, renamed
errors/tests, a replacement worker, resumed session or new branch cannot reset the
same unresolved failure's count. At the second consecutive unsuccessful repair
attempt, STOP before a third correction. Persist the ledger, changes tried, exact
failed gate, current HEAD/diff, worktree/worker ownership and unresolved hypothesis
on the owning issue; return to orch-owned planning, preserving files and exact pins.
All earlier hard stops apply immediately; this does not grant two attempts to
unapproved destructive operations or work beyond authority.

A meaningful targeted pass resolving the defect closes its entry; a later regression
retains linked history. A planning handoff never silently resets the count. Any revised
plan/repair allowance requires an explicit recorded orch planning decision within
operator authority, preserving history; a real design fork stops for operator choice.

## Verification and receipts

Complete briefs and all existing tests/build, mandatory stack crucible, required
smoke, independent review and operator merge gates remain intact at every tier.
Independent review is separate from implementer self-report: orch assigns a separate
reviewer at Sol/high (Astra/high or justified xhigh for consequential design/security).
The reviewer inspects actual PR head/diff and meaningful test evidence, current
issue/parent amendments and these scenarios. The implementer cannot be sole approval.

Optimize cost per accepted change including retries, review and rework. Record actual
phase settings, attempt counts, review findings and elapsed/usage evidence only where
available. Missing usage is unavailable, not zero. Token reduction is a goal, not a
savings guarantee; do not infer subscription savings from API prices. Source/packaging
and render tests validate instruction delivery, not runtime routing or full #329 acceptance.

## Acceptance examples — review semantically

| Scenario | Required disposition |
| --- | --- |
| Normal plan resolves contracts/edge cases and gates | Astra/high planning, then latest supported Sol/medium with the complete settled brief |
| Conflicting architecture evidence risks data loss | Astra/xhigh planning with explicit uncertainty/consequence rationale; stop unresolved forks |
| Approved replacement of three named headings, expected text diff specified | Luna/low only for those enumerated edits; verify exact diff and applicable gates |
| One-line retry condition changes behavior | Reject Luna; Sol/medium from a settled plan or planning for unresolved choices |
| Implementer reports green gates | Assign a separate Sol/high reviewer to the actual head/diff and meaningful evidence; self-report is not approval |
| Security boundary/design has consequential risk | Separate Astra/high review; xhigh only with justified hard-analysis rationale |
| Initial targeted gate fails | Detection only, zero repairs; record failure before corrective work |
| Corrective change 1 has failing targeted check | Attempt 1, unsuccessful count 1; preserve hypothesis/change/check evidence |
| Corrective change 2 has inconclusive targeted check | Attempt 2, unsuccessful count 2; STOP before third correction, issue ledger + planning handoff |
| No-change rerun or unrelated suite passes after attempt 1 | No new corrective attempt and count remains 1 |
| Gate renamed; worker replaced/resumed on another branch | Same stable defect and count carry forward; no retry budget reset |
| Credential/identity/ownership fails, or proposed action exceeds authority | Earlier hard stop immediately; two-repair rule grants no extra action |
| Latest family or requested effort is unavailable | Stop dependent dispatch; record limitation, no alias/substitution/fallback |
| Explicit Sol/high override only for issue A | Honor only A's scope; default Sol/medium for new issue B; preserve all active/resumed pins |
| Usage cannot be observed | Record unavailable, not zero or inferred savings |
| Meaningful targeted pass resolves defect; later regression occurs | Close entry on pass and link prior history for later regression |

## Installed update route

Existing verified whole-folder junctions update when their canonical Vilya checkout
receives the reviewed merge/pull. Reload the session and read the resolved current
SKILL.md plus this reference; a stale loaded manifest is not an update. Preserve and
reconcile divergent copies before reinstalling. Install/link the complete skill folders,
including references; registry raw SKILL.md alone is not a complete instruction bundle.
Generated registry folders copy this resource with the manifest. This change adds no
installer rewrite, telemetry, product config model catalog or runtime router.
