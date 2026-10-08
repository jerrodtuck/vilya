# Fresh comparison controller: issue 357

This implementation is unexecuted. It creates no claim, authorization, campaign directory, paid request, native agent, or public results during import or offline testing. Existing pilot evidence stays immutable.

The fixed allocation is six API trials followed by six native trials, with behavior/instruction/migration fixtures and matched A/B arms. Protocol 2 supplies the real planning, consultation/synthesis where applicable, hash-bound implementation/repair, fixed Docker acceptance gates, and an independent review. The base six API workflows require 22 generations. Two permitted repairs and their reviews add 24, so the maximum is 46 new generations/counts and 53 cumulative count calls, below 64. This corrects the scaffold's insufficient 18-call bound without adding trials, retries, replacements, replay, or a diagnostic trial.

The configuration retains 180 minutes (174 dispatch plus 6 final), 14 minutes per trial, cumulative planning/implementation/review time budgets of 3/8/3 minutes, $25 total and $2 per trial. The carried ledger is known 10929, held 401897, exposure 412826 microdollars, seven count calls and six consumed slots. The final allocation has 18 cumulative slots. Initialization does not start the execution window; the first count attempt does.

## Review, publication, activation and entry

Review the exact final source commit using Sol/high and Astra/high. Save their complete READY receipts privately at `scripts/evaluation/runtime/comparison-357-1.sol-review.json` and `comparison-357-1.astra-review.json`. Each receipt must include exact `head`, `model`, `effort: "high"`, `status: "READY"`, and an empty `findings` array. Supply each complete file's SHA-256 in the corresponding review descriptor. Publication rechecks the actual receipt bytes, reviewed source, predecessor bytes and frozen sandbox readiness.

`publishComparisonClaim({initialize:true,reviewedHead,reviews})` in `comparison-live-campaign.mjs` publishes only an immutable claim. Separately, `activateComparisonClaim({reviewedHead,userAuthorized:true,windowMinutes:180,newTrialSlots:12})` publishes the fixed authorization. Neither starts a clock. A partial publication, old marker, changed review/source/predecessor, or retained guard denies dispatch.

The sole live entry is Windows PowerShell with `-NoProfile -NonInteractive -File scripts/evaluation/comparison-launcher.ps1`. Actions are `--initialize`, `--run`, and `--receive-native`. Every action requires `--live --workflow-protocol 2 --reviewed-head <exact commit>` and exact absolute `--workspace`, `--ledger`, `--claim`, and `--authorization` paths from `COMPARISON_PATHS`. The native receipt action additionally requires explicit `--manifest`, `--session`, and `--output` files inside the private comparison workspace, with `.json`, `.jsonl`, and `.txt` extensions respectively.

The reviewed launcher alone loads the key-only `C:\Users\repo\vilya\.env.local`. It pins executable/controller/bootstrap bytes, the complete ESM closure, fixture manifests and independent oracles before Node starts. Its private pipe binds the launcher process and file identities. The controller removes the credential from the process environment after private validation, so Git, Docker and acceptance child processes do not inherit it. Errors and diagnostics never print the key or response body.

## Resume and native handoff

State uses append-only numbered checkpoints with predecessor hashes. Counts have separate exclusive attempt markers. Completed trial receipts bind the exact controller evidence and are checked before continuation. Interrupted counts, generations, fixture preparation, edits or gates cannot be replayed. Unknown evidence consumes its trial slot, retains the complete $2 trial hold, and stops the campaign. A completion checkpoint can resume the next operation; an incomplete side effect cannot. There is no stale-guard removal, reset or replacement mechanism.

API transport explicitly opts into financial contract 4 and diagnostic schema 9; older transport defaults remain unchanged. The first API trial's reconciled response establishes contract 4 before transfer. Failed model/content outcomes preserve actual metered usage, cost and elapsed time. Fixed gates execute in the existing pinned, network-disabled Docker sandbox. Synthetic gates are rejected by live configuration.

A native phase emits one immutable `*.native-packet.json` with exact model, effort, payload hash, phase ID, bounds and deadline. Only the root/orchestrator dispatches it through a fresh native Codex agent with no inherited history. Re-running while it is pending reports `awaiting-native` and `dispatchAgain:false`. No automatic native dispatch or reissue exists.

For each native completion, the operator supplies the usage importer's fresh-session manifest plus `packetDigest`, `outputDigest`, and `phaseId`, an explicit session JSONL, and the exact final output. The controller verifies cumulative counters, zero baseline, terminal completion, exact source packet and final output, model/effort/head/fixture, timestamps, and disjoint sessions before applying output. Missing or conflicting evidence stops the campaign; usage is never fabricated. Native actual API spend and subscription dollars remain unavailable. The configured native token and price-equivalent bounds are admission/post-completion checks, not an enforceable subscription-dollar cap; receipts state `hardNativeSpendCap:false`.

## External screening boundary

Issue 360 owns the future Artificial Analysis adapter. Screening is required for new models and recalibration before matched Vilya workflow evidence and native transfer proof. This already authorized pilot is explicitly grandfathered and unchanged. No AA fetch, key requirement, subscription, promotion, or trial exclusion is added here.

The metadata boundary distinguishes private candidate metrics from public source/version/date/provider/endpoint/attribution and methodology references. Public Vilya recommendations, fixture outcomes, accepted-change cost/time, repair/review/native evidence, provenance and uncertainty remain intended product outputs. Actual external metrics/charts require applicable rights and attribution; private raw snapshots are not public exports. If external-detail rights are unresolved, public Vilya evidence and AA references remain visible with that limitation. An AA score cannot replace local acceptance or native proof.

This mirrors the [superseding architect ruling](https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6064069998) and subsequent operator clarification on public recommendations; [issue 360](https://github.com/jerrodtuck/vilya/issues/360) remains Todo. Future admission needs retrieval within seven days plus a methodology check; measurement age stays separate, and runtime/rates verification is required within 24 hours before a paid send. This commit provides metadata boundaries only, not an operational screening adapter.

## Verification

The focused tests cover policy arithmetic, contract4 transport, full synthetic twelve-trial ordering, actual protocol2 packet/edit handoffs, synthetic gate routes, fresh native session import, exact receipts, unknown holds, clock rollback, stale source/binding, malformed checkpoints, private/public screening separation, and a Windows launcher sink with poisoned environment and altered oracle denial. Synthetic acceptance is a controller test; no live model quality or Docker execution is claimed.

Legacy `evaluation-openai` and `evaluation-diagnostics` tests encounter seven pre-existing generic-live-ledger denials when run alongside this worktree's preserved continuation claims. In an isolated temporary copy containing the same source and no live claims, those tests pass (28 passed, one optional historical-fixture test skipped). The old safety gates and evidence were not altered.
