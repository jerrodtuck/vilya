# Impact and verification (#383)

This shared contract supplements the existing Planner, worker and finish procedure.
Host adapters keep their own tools, model choices and authority gates.

## Map the affected behavior

For each behavior change, record these items in the existing issue plan:

- Upstream callers and their input assumptions.
- Changed functions or processes and their contracts.
- Downstream calls and observable effects, including relevant events, queues, storage, external calls and process boundaries.
- Source evidence and uncertain edges.
- Selected checks for changed behavior and affected consumers.
- Excluded checks, their reasons and remaining obligations.

Use a few lines for a local change. Add detail for shared contracts or cross-process effects.
Add a compact call/effect tree when it clarifies the path.
Do not require a repository-wide graph, separate tracker or every caller/callee suite.
Changed lines alone do not establish safe selection.
Workers confirm the map against actual implementation.
If new dependencies or failures appear, expand the affected checks.

## Integrate through the actual entry

Run the earliest feasible thin integration through the actual user entry before further dependent layers.
Record blockers at that point under the existing verification routing.
This requirement adds no universal live call or paid smoke.
If authority or credentials are absent, keep the affected acceptance pending.

Record the actual URL, build/head, mode, conversation, provider and service identities where applicable.
A different fixture, host or provider does not close the reported defect.
Distinguish exercised, skipped/not enabled, failed and blocked outcomes from observed execution.
A green total does not prove that guarded live assertions ran.
Keep the existing Refs/Verifying and authorization gates.

The following Narya path is a bounded planning example from the
[source audit](https://github.com/jerrodtuck/vilya/issues/380#issuecomment-6316074699), not a reproduction or execution instruction:

```text
Normal browser Send
 -> Actual bound URL/build/head, mode, conversation/provider pin
 -> Selected DI/context service -> Required Westmarch context
 -> Host-owned admission policy -> Exact typed-history projection
 -> Provider dispatch -> Visible answer and persisted result
Conditional edges: optional retrieval; lab proof/evaluation
```

DI means dependency injection. Select checks for the changed contract and affected effects along this path.
Keep required context when optional retrieval is off.
Keep optional retrieval and lab proof/evaluation conditional.
Keep genuine authentication, ledger and tool/write protections.

For a local Vilya example, `DiffView -> getVersionDiff -> computeLineDiff/diffStats` has no storage or external calls.
The caller converts missing file text to an empty string.
An unchanged row contract permits existing `src/features/version-diff/diff.test.ts` checks for an algorithm change.
A changed row contract also needs affected consumer checks.
This example does not authorize an algorithm edit.

## Select bounded checks

Run applicable formatting/lint, type/build and behavior checks for the affected surface.
Keep the full context that graph, lint, type and build tools require.
Select integration or workflow checks when the affected contracts or effects need them.
Do not require a UI/live smoke for every PR or a full suite for every local documentation change.
Broaden for shared contracts, authentication, infrastructure, dependencies, configuration or uncertain impact.
Until selection is trustworthy, prefer full suites when reasonably fast.
Keep full regression on default-branch or scheduled runs when ordinary PR costs are excessive.
Run broader regression before merge for relevant shared changes or unresolved impact.

Target ordinary PR checks at about ten minutes.
This target does not permit omission of required checks.
Use finite job timeouts. Record a necessary longer gate's reason and measured duration.
Parallelize independent checks. Cache dependencies by the committed lockfile, with cache misses allowed.
Cancel superseded PR runs. Keep results tied to the tested head.
Reuse artifacts only with matching source, configuration and environment.
Keep useful failure logs. Do not add artifact storage merely to duplicate logs.

Run each applicable gate once at stable source.
Repeat only for affected changes, failures or a named unresolved risk.
Find the cause of assertion failures before correction.
Permit at most one bounded retry for a confirmed infrastructure/transient failure.
Do not blind-rerun assertions or add a general retry controller.
Keep the existing same-defect two-unsuccessful-repair stop and ledger.
Disclose unrelated legacy failures without hiding new regressions or adding unrelated cleanup.

ExplainReel's reported fast gate is broad non-golden coverage, not function-impact selection.
Its product paths and prelaunch waiver are not shared Vilya policy.
Test volume is not causal diagnosis or proof of useful behavior coverage.
Measure the critical path, including setup, queue time, worker limits and affected service latency.

## Finish with observed evidence

Record selected/skipped checks and reasons, actual commands, tested head/base and environment.
Record outcomes, elapsed time where observed and remaining unverified obligations.
Keep exercised, skipped/not enabled, failed and blocked results distinct.
A timeout is failed or inconclusive.
Source configuration does not prove hosted cancellation or timeout enforcement.
Keep unobserved hosted behavior explicitly unverified.
This contract adds no review stage or replacement for product evidence.
