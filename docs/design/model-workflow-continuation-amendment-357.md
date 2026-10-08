# One-time pre-window continuation activation amendment

The initialized `v2-continuation-1` segment remains the same campaign. Its origin activation, claim, empty ledger and state checksum are fixed to the observed bytes from reviewed head `5fdc4879a1ee3142f2a2d111bdc9107392c3bbbb`. The amendment never rewrites those files, releases historical holds, creates another trial allocation, or starts the execution window.

Publication requires the exact final implementation head after independent Sol/high and Astra/high READY reviews. The checkout must be clean and descend from `2556e61953225567842d10e6a68b5ef756859ccb`. Both review receipts bind that final head. An explicit operator publication is required; implementation and review do not publish an amendment.

The fixed publisher takes an exclusive ledger lock and amendment lock. It verifies all origin hashes, immutable history, pricing/configuration and carry, the pristine empty state, and the clock floor. Any pair, trial, request, preflight, start time, blocked state, window, expiry/cleanup marker, unfinished write, or earlier publication denies admission. Missing origin files are never recreated.

The publisher fsyncs a new temporary sidecar, writes a durable publication marker containing its digest, and atomically renames the sidecar. Interrupted publication stays held. The marker detects sidecar removal without allowing fallback to the origin head. Concurrent publication has one winner; repeat publication fails. All normal operations validate the immutable sidecar and unchanged origin activation/claim, while allowing ordinary ledger writes after publication.

The central resolver returns the effective reviewed head and amendment digest. API/native phase provenance, trusted native usage identity, authorization, window receipts and sanitized version 3 exports use that identity. Exports also preserve origin head and activation digest. Historical exposure is counted once. The first admitted count still starts the existing 84-minute dispatch and six-minute final reserve; no time is reset.

## Operator publication after both reviews

Create `scripts/evaluation/runtime/campaign-v2-continuation-1/amendment-reviews.json` only after the final candidate receives both READY reviews. Its value is a two-element array, in Sol then Astra order. Each element has exactly `model`, `effort`, `status`, `head`, and `receiptDigest`; models are `gpt-6.1-sol` and `gpt-6-astra`, effort is `high`, status is `READY`, both heads equal the final reviewed commit, and receipt digests are the actual 64-character SHA-256 review receipt hashes.

From that exact clean reviewed checkout, run:

```powershell
node scripts/evaluation/continuation-amendment-controller.mjs --live --workflow-protocol 2 --reviewed-head FINAL_REVIEWED_HEAD --reviews ABSOLUTE_FIXED_REVIEWS_PATH
```

`ABSOLUTE_FIXED_REVIEWS_PATH` must name the fixed metadata file above. Publication returns the effective head and sidecar digest with `executionWindowStarted: false`. Existing API/native live commands then use that exact effective head. Never delete locks, temporary files, publication markers, or the sidecar to retry. Inspect interrupted evidence instead.

Tests use explicitly synthetic review metadata and private copied modules with synthetic origin constants. Production has no origin override flag. The actual initialized origin is read-only fixture material, and synthetic API/native exports remain contract proofs rather than live model results.
