# Complete workflow comparison for issue 357

Protocol 2 is offline-only. No live API or native model run is authorized by this
implementation. Historical protocol 1 records and held financial evidence remain
unchanged.

Decisions are per fixture. Each row reports A/B acceptance separately from total
workflow tokens, API cost and elapsed time. Confirmation requires complete routes,
the same protocol digest and fixture seed, accepted native work for the provisional
arm, matching acceptance outcomes and concordant resource evidence. Aggregate totals
are descriptive. Behavior is a Sol-only control and cannot select consultation
treatment. Instruction and migration must agree before a treatment conclusion.

Both arms receive the same first-plan limit and initial packet. The limit reserves
the exact fixed consultation envelope plus six JSON bytes for each input byte,
which covers worst-case control escaping. The consultation envelope remains 6000
UTF-8 bytes, its response 2000 bytes and the final synthesized plan 5000 bytes.
No output is truncated.

The campaign proof runs all six API trials, then all six native trials, with one
actual disposable budget ledger. Native admission checks the real API records.
Behavior demonstrates acceptance and rejected review followed by successful repair.
Instruction and migration demonstrate measured terminal failures at the unchanged
gates; synthetic comments do not implement those fixture contracts. Every repair
is bound to its preceding attempt. Failed gates can lead directly to another repair
without a review. Passed gates require the independent review. Two repairs remain
the maximum. Missing metadata and torn API calls stop the campaign.

Run from a disposable current-source clone with the existing verified readiness
metadata and pinned Docker images:

```powershell
node scripts/evaluation/offline-campaign.mjs --offline --workspace C:/Users/jerro/AppData/Local/Temp/vilya-proof-357 --readiness C:/path/to/disposable/source/scripts/evaluation/runtime/readiness.json
```

Repeat exactly that command to resume completed records. Completed API receipts
must match their ledger entries. A started API trial without a complete receipt is
held for inspection instead of dispatched again. Native state retains its original
deadline, private planning cursor and imported phase receipt identities.

Outputs are `offline-report.json` and `synthetic-snapshot.json` in the disposable
workspace. The snapshot carries `synthetic-contract-proof` and `live-not-run`.
Responses and native usage receipts are synthetic. They prove control flow and
sanitization, not model quality, billed cost or actual native confirmation. The
driver has no provider transport or credential input. V2 live entry points remain
denied pending a separately authorized window and final independent review.

Repair history is retained: integration correction 1 reported 35 pass/5 fail/1
skip; correction 2 failed before editing because Python was unavailable and reran
unchanged source with the same counts. Reassessed fixture setup and dependency
plans then passed. Review blockers formed a separate scope; its campaign proof
exposed the attempt-bound successive-repair rule now implemented.

A fully received and metered invalid implementation, repair or review is a
terminal failed workflow outcome. Its sanitized `terminalFailure` binds the
finite failure code to the final step and receipt. The record retains all usage,
cost, elapsed time and preceding attempts. An invalid review retains its completed
gate attempt with review status `unavailable`. These records can enter fixture
comparisons only as accepted=false with complete observed history.

Missing usage, unknown requests, missing gates, torn receipt bindings or later
steps remain incomplete or fail snapshot validation. Terminal failure evidence
cannot appear on an accepted run. Native records retain observed tokens and time
without dollar estimates; private outputs and provider/session identifiers stay
outside the public snapshot.
