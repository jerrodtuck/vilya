# Codex routing and repair contract (#357)

Read and apply this full reference before Codex phase selection, worker implementation,
repair, independent review or resumption. It supplements the seat/checkout/quality gates
in [vl-orch-codex](../SKILL.md), never changes ownership or operator merge authority.
This operator approved the original policy on 2026-10-03 in
[#347 direction/ADR](https://github.com/jerrodtuck/vilya/issues/347#issuecomment-5975011992),
with the [settled plan](https://github.com/jerrodtuck/vilya/issues/347#issuecomment-5975070688).
Issue #357 revised the planning route on 2026-10-08 using current independent
benchmark screening and a matched Vilya probe. Other operators retain configured
defaults absent their own authorization.

## Select by uncertainty and consequence

These are configurable initial settings for authorized phases, not timeless model IDs.
Resolve the latest supported family member and exact effort from current exposed runtime
metadata and official documentation at setup/dispatch; validate before selecting.

| Phase and eligibility | Family | Initial effort |
| --- | --- | --- |
| Normal planning | latest supported Sol | medium |
| Difficult architecture, conflicting evidence or consequential uncertainty | latest supported Sol | high first |
| Implementation from a complete settled plan | latest supported Sol | medium |
| Explicitly enumerated mechanical operations with objective verification | latest supported Luna | low |
| Independent review by a separate reviewer | latest supported Sol | high |
| Consequential design/security escalation after recorded Sol impasse or capability failure | latest supported Astra | high; xhigh for justified hard analysis |

Route by uncertainty and consequence, never line count or the word easy. Do not add
an unconditional Astra consultation to ordinary work. Sol must first record the
specific unresolved question or failed capability; that receipt authorizes the
bounded Astra escalation. Luna is ONLY
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

## Efficient coordination (#356)

Do not pass full conversation history by default. Use a compact self-contained brief with
goal and acceptance, scope and exclusions, ownership, dependencies, exact issue/comment references,
immutable base and original-start SHAs, absolute checkout and branch, trusted authorization,
exact model pin, gates, stops, and required contract paths. Resolve missing,
stale, or inaccessible sources before action. Reuse a viable worker for repair when it
preserves the correct checkout, pin, and repair ledger. Before replacing one, persist a
handoff with the current head/diff, unresolved findings, attempts, evidence, ownership,
and next targeted check. Replacement never resets repair counts or required gates.

Initial independent review covers the full change and affected boundaries at an exact
head. After repair, review the delta from the previously reviewed head plus affected
boundaries and current amendments. Retain initial evidence and record both heads, the
delta, findings, boundary coverage, and gate provenance. If initial coverage was
insufficient, obtain it before relying on delta review. Self-report is never approval.

Run each required gate once at the applicable head. Repeat or broaden only when changed
source affects it, it failed, or unresolved risk warrants it; record the reason, command,
head, and outcome. Batch independent reads, search before broad reads, bound excerpts and
logs, and avoid unchanged reads. Use quiet bounded waits with backoff while preserving
active-task persistence. These practices never waive identity/base validation, smoke,
crucible, independent review, repair stops, or operator merge authority.

Evaluate context strategy separately from model routing. Hold the fixture, phase models,
efforts, gates, and rubric constant while comparing supported strategies such as full
history, compact brief, and reused-worker repair. Record cached input, uncached input,
cache-write input, output and reasoning counters where exposed; also record handoff rounds,
repair attempts, elapsed time, acceptance, and cost per accepted change. Missing usage is
unavailable, not zero. Separate subscription usage from dated API-equivalent estimates.
Provider screenshots are historical evidence only unless their exact build, settings,
date, and metering basis are verified. No paid run starts without current authorization.

## Fresh-chat checkpoint (#356)

At issue or PR completion, a settled architecture decision, or before unrelated work,
assess whether this chat's history still helps the next task. Continue related work and
repairs when continuity is useful. Recommend a fresh chat when the next task mainly needs
a concise durable handoff and the remaining history is stale or unrelated. Concrete signals
include redundant investigations, repeated correction of old decisions, bulky obsolete
logs, or pressure reported by an exposed host indicator. Compaction alone is not failure.
Do not infer a token percentage or impose a universal timer, turn count, or context limit.

Before replacement, persist the exact goal and decisions; issue, PR, head, worktree and
branch; ownership, active pins and live workers; repair ledger and verification; pending
decisions, authorization and stops. Check the handoff for completeness. Replacement or
compaction never resets gates, locks, authority, review independence or repair counts.
An orchestrator replacement reconciles repo and board ownership, live workers and the
dispatch lock before acting. Never abandon active work or create duplicate workers merely
to shorten context. New sidebar chats still require explicit human authorization.

Report the checkpoint briefly: `continue` or `recommend fresh chat`, concrete reason,
handoff link and unresolved work. A skill cannot measure inaccessible context, force
compaction or change the active chat model. Preserve useful autonomous progress while an
optional reseat is pending.

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

For a new model or a broad recalibration, screen current independent benchmark
intelligence, coding/agentic performance, latency and price first. Challenge the
lowest applicable proven seat with the smallest matched Vilya fixture needed to test
skill adherence, repair rate or native transfer. Do not rerun a full matrix when the
screen eliminates a candidate or the route-specific probe settles the decision.

Optimize cost per accepted change including retries, review and rework. Record actual
phase settings, attempt counts, review findings and elapsed/usage evidence only where
available. Missing usage is unavailable, not zero. Token reduction is a goal, not a
savings guarantee; do not infer subscription savings from API prices. Source/packaging
and render tests validate instruction delivery, not runtime routing or full #329 acceptance.

## Acceptance examples — review semantically

| Scenario | Required disposition |
| --- | --- |
| Normal plan resolves contracts/edge cases and gates | Sol/medium planning, then Sol/medium implementation with the complete settled brief |
| Conflicting architecture evidence risks data loss | Sol/high first; if it records a specific unresolved consequential question, dispatch one bounded Astra/high consultation; xhigh requires separate hard-analysis rationale |
| Approved replacement of three named headings, expected text diff specified | Luna/low only for those enumerated edits; verify exact diff and applicable gates |
| One-line retry condition changes behavior | Reject Luna; Sol/medium from a settled plan or planning for unresolved choices |
| Implementer reports green gates | Assign a separate Sol/high reviewer to the actual head/diff and meaningful evidence; self-report is not approval |
| Security boundary/design has consequential risk | Separate Sol/high review first; Astra/high only after a recorded impasse or capability failure; xhigh only with justified hard-analysis rationale |
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
| Same model and fixture, different context strategy | Compare acceptance, counters, handoffs, repairs, elapsed time and accepted-change cost; do not attribute the result to model routing |
| Repair needs the same checkout and pin | Reuse the viable worker and ledger; replace only after a durable handoff, without resetting attempts |
| Required gate passed and source is unchanged | Reuse the exact-head evidence; rerun only for failure, affected changes or unresolved risk |
| Clean issue/PR completion and the next task is unrelated | Recommend a fresh chat with a complete durable handoff and unresolved work |
| Long active repair still benefits from current evidence | Continue; length alone does not justify replacement |
| Topic changes after a complete handoff | Recommend a fresh chat; do not create it without explicit authorization |
| Context usage is not exposed | Record unknown; do not invent a percentage, timer or threshold |
| Replacement resumes an unresolved defect | Reconcile ownership, live workers, dispatch lock and ledger before action; reset nothing |

## Installed update route

Existing verified whole-folder junctions update when their canonical Vilya checkout
receives the reviewed merge/pull. Reload the session and read the resolved current
SKILL.md plus this reference; a stale loaded manifest is not an update. Preserve and
reconcile divergent copies before reinstalling. Install/link the complete skill folders,
including references; registry raw SKILL.md alone is not a complete instruction bundle.
Generated registry folders copy this resource with the manifest. This change adds no
installer rewrite, telemetry, product config model catalog or runtime router.
