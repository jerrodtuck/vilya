# Fixed protocol 2 continuation for issue 357

This segment continues campaign `357-screening-2`. It does not replace or reopen its historical behavior trials. The reviewed protocol ancestor is `2556e61953225567842d10e6a68b5ef756859ccb`. Live execution is denied until a separate durable activation artifact binds the final, independently reviewed continuation commit. Implementation and verification use no provider or native model calls.

## Historical binding and accounting

`continuation.mjs` verifies the original ledger (`5b0da91c…`), fresh ledger (`066f7a5c…`), B diagnostic journal (`e61d5960…`), three historical failed receipts, A financial reconciliation, and pinned readiness by their full SHA-256 values. The full fresh state checksum is `b1d9d8b41d86f9c386a455bb075d041a7ba9166e8aaff673a520053f501a6d5a`. No historical bytes are rewritten. Financial admission failures 2, diagnostic-only history 3, and prospective correction 4 remain separate historical facts.

The new v4 ledger carries $0.010929 known cost and $0.256380 unresolved reservations once, for $0.267309 combined exposure. Two trial slots and three count calls are already consumed. Historical B's hold is excluded from the new in-flight count, but remains reserved against the same $25 cap. New calls retain the $2 trial, $1 shared overhead, phase, token, and 64 combined count-call caps. Native dollars remain unavailable.

The only ledger is `scripts/evaluation/runtime/campaign-v2-continuation-1/pilot-budget.json`. Its exclusive claim is `scripts/evaluation/runtime/continuation-357-v2-1.json`. A successful claim with a missing destination is an inspection hold; initialization cannot recreate it. A recomputed checksum cannot remove carry, downgrade v4, change segment/path/protocol, or bypass the immutable claim.

## Activation and execution

After independent Sol/high and consequential Astra/high READY reviews, the operator may create `scripts/evaluation/runtime/continuation-357-v2-1.activation.json`. The exact schema is:

```json
{
  "schemaVersion": 1,
  "campaignId": "357-screening-2",
  "segmentId": "v2-continuation-1",
  "protocolBase": "2556e61953225567842d10e6a68b5ef756859ccb",
  "protocolDigest": "4db4905c711660c645cab57f7ade9aff8e302997cc642c3320b1e5a87d594b5b",
  "reviewedHead": "FULL_FINAL_REVIEWED_COMMIT_SHA",
  "readinessDigest": "81825c69d01733339ca07bb742c5eccc8cb79eb8b5c5bd9d18abab6fbb6d1298",
  "reviews": [
    {"model":"gpt-6.1-sol","effort":"high","status":"READY","head":"FULL_FINAL_REVIEWED_COMMIT_SHA","receiptDigest":"FULL_REVIEW_RECEIPT_SHA256"},
    {"model":"gpt-6-astra","effort":"high","status":"READY","head":"FULL_FINAL_REVIEWED_COMMIT_SHA","receiptDigest":"FULL_REVIEW_RECEIPT_SHA256"}
  ]
}
```

The artifact is operator review evidence, not a self-issued model approval. It must be created only after those reviews and the separate execution authorization. The implementation does not create it. Execution checks exact HEAD, ancestry, clean issue source, all historical hashes, readiness, activation digest, fixed ledger/workspace, protocol 2, and explicit `--live`. Environment variables or constructor flags do not activate the segment.

Read-only check: `node scripts/evaluation/harness.mjs --check-continuation` reports artifact presence, not reviewed readiness. Initialization uses `--initialize-continuation --live --workflow-protocol 2 --reviewed-head HEAD` and makes no count/provider call. The complete API entry is `--run-api --live --workflow-protocol 2 --reviewed-head HEAD --ledger FIXED_LEDGER --workspace FIXED_WORKSPACE --readiness FIXED_READINESS`. Existing parser requirements apply. It resumes completed, receipt-bound trials and refuses torn/incomplete trials. It never reruns behavior API.

Fixed order is API instruction B/A, API migration A/B, native behavior B/A, native instruction A/B, native migration B/A. The native controller `begin` and `advance` require `--live --workflow-protocol 2 --reviewed-head HEAD` with the same fixed ledger/workspace/readiness and fresh output files. Four designated API terminal receipts must have complete workflow history and financially reconciled request bindings before native begins. Historical behavior exclusions are separately hash-bound; no six-v2-API state is fabricated. Native private state binds the reviewed head, fixture, route, copied root and pinned sandbox. Each phase uses a distinct fresh imported completion/usage receipt.

The durable execution-window receipt starts immediately before the first admitted count preflight. Initialization, source preparation, and denied preflight metadata do not start it. Dispatch ends at 84 minutes; one final Sol/high review may use the remaining six minutes through `--final-review-continuation`, with a bounded private prompt inside the fixed workspace. Each trial retains its seven-minute limit. Restart cannot extend the window. Durable expiry markers prevent dispatch after an observed expiry even if wall-clock time later moves backwards. New unknown request/count usage, missing provenance, source/resource failure, or sandbox cleanup holds block both environments.

## Public evidence and proof

Receipt consumption is separate from phase admission. A previously issued native phase may import its authentic, distinct completion and usage receipt after the dispatch cutoff. The controller first verifies the fixed activation, pending phase identity and receipt timestamps. It records usage and elapsed time once, then closes the trial as partial with `deadline-exceeded`, persists the dispatch hold, and returns no next packet. Completion before the cutoff permits another packet only while its admission remains before the cutoff. Restart cannot consume the receipt again. The final reserve permits adjudication and export, never another native model phase.

Sanitized snapshot version 3 preserves campaign identity, segment, immutable reviewed/protocol/readiness/activation digests, carried exposure, consumed counts/slots, and window times. Historical behavior failures and the original hold remain visible. Native behavior is a standalone no-consultation control; its API confirmation is unavailable. Only compatible complete instruction/migration API and native records can establish fixture concordance. Private plans, answers, review findings, provider IDs, and session UUIDs are absent.

The dedicated continuation tests create disposable Git candidates and explicitly synthetic review artifacts. Their provider object exercises the real live-mode accounting/entry contract but sends only scripted in-process responses. Component gates are labeled injected. `EVALUATION_DOCKER_CONTINUATION=1` runs the remaining four API controller trials followed by six native bridge trials against one v4 ledger with real pinned, network-disabled Docker acceptance. It includes native reviewer rejection, meaningful repair, acceptance, and fully observed gate failures. Synthetic exports retain `synthetic-contract-proof`; they are neither live model results nor native quality confirmation. Runtime artifacts and review activation are excluded from commits.
