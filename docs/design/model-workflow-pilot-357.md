# Model/workflow pilot and results — issue #357

Created: 2026-10-06
Last updated: 2026-10-07
Owning issue: https://github.com/jerrodtuck/vilya/issues/357
Operator decision: https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6029424573

The controller supports a guarded API stage, a manually orchestrated native stage, and a whitelist-only results snapshot. Development and fixture validation made no benchmark generation calls. Root subsequently attempted the first approved live API planning request; unknown usage holds the campaign. No completed comparison exists. Root controls any further paid dispatch after actual-head review and original-charge reconciliation or an explicit policy amendment. PR359 references #357; these preparation results do not complete the experiment.

## Locked experiment

| Fixture | Immutable seed | API pair | Native pair |
| --- | --- | --- | --- |
| behavior | 3d868ea5e69a3d01e433488ea6a682574d03a697 | A,B | B,A |
| instruction | d17eb2d9aafc692306976b9ad00ddccf30f6869c | B,A | A,B |
| migration | 012220a83d11acf5c7c316dca36490152f9a8e90 | A,B | B,A |

Exact prompts, ownership, gates and semantic rubrics are immutable fixture manifests in scripts/evaluation/fixtures. A plans at gpt-6.1-sol/medium; B plans at gpt-6-astra/high. Both implement at gpt-6.1-sol/medium and receive separate stateless gpt-6.1-sol/high review. Implementation pin for this controller remains native gpt-6.1-sol/medium. No production defaults change.

Six API trials precede six native trials. One campaign allows at most12 trials, seven minutes per trial,84 minutes from first trial admission for dispatch and six minutes for final adjudication. Failures and timeouts count; no replacement trials. Native allocation closes API dispatch. Planning/implementation/review/repair caps are4000/8000/4000/8000 output tokens including reasoning; shared planning output must also fit5000 UTF-8 bytes. Every packet must fit32000 UTF-8 bytes and API exact input must fit32000 tokens. Eight requests per phase,60 seconds per generation, zero tools/retries. Native output caps are observed after completion because the native collaboration tool cannot enforce a generation limit.

## Budget and transport

The shared durable ledger caps total API work at$25, each trial including review/repairs/failures at$2, and setup plus final overhead at$1. Phase reservations allocate$0.40 planning,$1 implementation and$0.60 shared review/repair. Matched-pair admission reserves capacity for both trial ceilings. Setup has a ten-minute window. No retries, fallback model, top-up or reset is automatic.

Dated exact model rates are in verified-api-rates-2026-10-06.json. Only Standard/default short-context processing is allowed. Integer microdollars round upward. Before generation, reserve worst-case input using the highest input-category rate plus bounded output and known fees. Reconcile uncached/cached/cache-write input as disjoint categories; reasoning is an output subset. Unknown schema/fees/counts, late/lost usage, overspend, changed rates or unfinished requests retain reservations and hold future dispatch across restart.

Exact input-count POSTs are separately persisted before transport, capped64 globally including failures, with no retries and at most15 seconds or the remaining stage deadline. The scoped dated interpretation assigns no separate fee under published Responses pricing; this is an inference rather than an explicit provider free-call warranty. One-use,60-second certificates bind the full payload and exact count. One pending count or generation excludes all other transport. Checksummed atomic ledger writes and exclusive locks precede requests; stale locks/pending files require explicit reconciliation. Windows power-loss directory durability and manual operator deletion resistance are not claimed. Strict incomplete-response handling may hold the campaign even when a provider exposes partial usage; it never fabricates a known cost.

## Isolation and fixture evidence

All three baseline focused/full Vitest, default Next build and spacing gates pass in the same isolated Linux container used for trials. Unfixed oracle assertions fail meaningfully. All three vetted evaluator reference fixes pass full acceptance, including instruction regression. Baseline/reference elapsed milliseconds: behavior8752/9383, instruction17072/18123, migration18335/19565. These are fixture feasibility checks, not model completions.

Official Node22 base is pinned to node@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392, Nodev22.23.3. Trusted immutable package/lock manifests prepare Linux dependencies with npmci during image build. Runtime is network-none, nonroot1000, read-only base, cap-dropALL/no-new-privileges,256pids,2CPUs,4GiB memory. No key, home, Docker socket, controller environment or outside dependencies are mounted. Seed and container-owned dependency source are read-only. Actual dependencies are copied into2GiB fixture tmpfs using verbatim relative symlinks and verified link containment. Fixture tmpfs permits executable native addons with nosuid/nodev;256MiB temporary tmpfs remains noexec/nosuid/nodev. Model-edited code executes only inside this container. Gate commands are fixed controller-owned Node commands.

Measured dependency bytes388185852. Maximum observed fixture tmpfs usage after command boundaries438992896 bytes (not a continuous peak). Maximum measured cgroup memory.peak1485062144 bytes. Mount flags, nonroot identity, native addon load and absent credential/socket checks pass. Real timeout and output-overflow probes both await bounded container removal and inspect-confirmed absence. An unresolved durable cleanup marker blocks API transport and native admission across restart.

The original two failed dependency-placement corrections remain in docker-repair-stop-357.json. Explicit revised-plan copy failed under noexec. A separately reviewed exec-only fixture correction then passed full three-seed verification. Cleanup parser, immutable image reuse and missing private reference regression corrections retain separate evidence. No historical counter was reset.

## Context, edits and quality evidence

Shared deterministic context preserves complete canonical instruction contracts with independently verified byte-equal generated aliases. Migration packets include task-relevant imports/functions/tests and hashes for omitted unrelated templates/helpers. Edits require expected full-file SHA256, unique exact search/replace, owned contained paths, bounded new tests and validation of all edits before any write. Traversal, symlink escape, duplicate ownership, stale hash and no-op edits fail closed.

Independent review receives every actual full-source changed line as exact hunks, including edits to omitted helpers/templates/tests. Generated diffs may alias canonical changes only if both baseline/current copies independently match. The first contiguous full-source diff correction exceeded the migration review cap; correction2 complete line hunks passes. Reference packet maxima: behavior9022, instruction30483, migration29255 UTF-8 bytes. No blind truncation or reduced gate is used. Prospective packets with maximum settled-plan length, reference edits and full compact gate facts pass before timed trials; unusually large actual diffs still fail closed.

Each acceptance attempt records ordinal, initial/repair kind, start/end/elapsed, complete immutable gate roles and actual independent review receipt. Maximum two repairs; no fault renaming. Known usage reconciliation means paid request completion, not quality acceptance. Accepted results require all fixed gates and linked planning/implementation/review evidence. Historical missing end timestamps/model identity are null, never inferred from later exports.

Native receipt imports inspect only session metadata/turn-context/token counters, require fresh no-history single-phase identity and externally observed completion, and deduplicate cumulative counters. Campaign-wide aggregate proof rejects duplicate or parent/child session overlap and missing independence evidence. Missing fields remain unavailable and hold further dispatch. Native tokens never become API dollars. Controller preparation usage is unavailable until separately verified; the page states unavailable rather than zero.

## Operator invocation

Use the isolated checkout as the absolute working directory. Runtime paths below must resolve inside that checkout; campaign workspace contains its ledger, receipts, phase outputs and proofs. Root alone supplies the excluded controller environment file; never transfer it to Docker or a phase agent.

```powershell
node scripts/evaluation/harness.mjs --dry-run
node --test scripts/tests/*.test.mjs skills/tests/*.test.mjs
node --env-file=ABSOLUTE_EXCLUDED_CONTROLLER_ENV_FILE scripts/evaluation/harness.mjs --run-api --live --initialize --first-pair --ledger ABSOLUTE_CAMPAIGN/pilot-budget.json --workspace ABSOLUTE_CAMPAIGN --readiness ABSOLUTE_RUNTIME/readiness.json --reviewed-head EXACT_REVIEWED_HEAD
# Resume the next pair with the SAME ledger, omitting --initialize.
# Remove --first-pair only to finish the remaining locked API stage.
node scripts/evaluation/harness.mjs --export-public --ledger ABSOLUTE_CAMPAIGN/pilot-budget.json --workspace ABSOLUTE_CAMPAIGN --readiness ABSOLUTE_RUNTIME/readiness.json
```

Setup-review IDs are setup_cost_review_1/setup_sandbox_review_1/setup_final_review_1 (Sol/high,8000) and setup_product_plan_1 (Astra/high,4000). Invoke --setup-review --live --review-id ID --ledger SAME_LEDGER --prompt ABSOLUTE_PUBLIC_PACKET; --initialize only once. Each uses the same$1 overhead.

After all six API trials terminate with reconciled spend, root drives native bridge phases manually:

```powershell
node scripts/evaluation/native-controller.mjs begin --ledger ABSOLUTE_CAMPAIGN/pilot-budget.json --workspace ABSOLUTE_CAMPAIGN --trial native_behavior_2_B --readiness ABSOLUTE_RUNTIME/readiness.json --output ABSOLUTE_CAMPAIGN/planning.packet.json
node scripts/evaluation/native-usage.mjs --manifest ABSOLUTE_CAMPAIGN/phase.manifest.json --session EXPLICIT_MATCHED_SESSION_FILE > ABSOLUTE_CAMPAIGN/phase.usage.json
node scripts/evaluation/native-controller.mjs advance --ledger ABSOLUTE_CAMPAIGN/pilot-budget.json --workspace ABSOLUTE_CAMPAIGN --trial native_behavior_2_B --phase-output ABSOLUTE_CAMPAIGN/phase.output.txt --usage-receipt ABSOLUTE_CAMPAIGN/phase.usage.json --independence-proof ABSOLUTE_CAMPAIGN/phase.independence.json --output ABSOLUTE_CAMPAIGN/next.packet.json
```

Root dispatches each packet through a fresh fork-none phase agent at its exact model/effort; only structured response text is supplied to advance. Output paths must be fresh. Manifest schema is documented in model-workflow-codex-validation-357.md: explicit agent/task/session/head/phase/pin identity, zero baseline at fresh session metadata, exact cumulative terminal/cutoff timestamp and external final-completion evidence. Never read/export prompt or tool logs. Independence proof requires freshNoHistory:true, accountingDisjoint:true and the exact sessionUUIDs of ALL campaign receipts so far. Native phases use no provider transport; BudgetLedger(file,apiConfig()) resumes the same campaign for time admission. There is no unattended native backend.

The exporter accepts a normalized whitelist DTO, not arbitrary ledger/logs. Snapshot list/detail/download keep API/native observations separate and preserve actual execution controller/image/lock/skills/node identity rather than relabeling it with export HEAD. Unknowns remain null. Raw source, prompts, secrets, paths, provider bodies and session UUIDs are excluded.

## Interpretation limits

Historical public replay is not held out. Models may know source/history; current installed skills can contaminate instruction tasks. Evaluator references and oracles are instruction-hidden, not technically inaccessible to filesystem-capable agents. Copied fixture dependencies/tests/oracles are writable inside the bounded container. Native tools remain technically available despite no-tools instructions. API/native tooling differs and cache conditions are uncontrolled. One pair per fixture/environment is screening evidence, not a universal winner or production recommendation. Native confirmation requires verified matched evidence; preparation, fake tests and fixture references do not count as trials.

One live planning generation was attempted with unknown actual usage/cost; no model trial is accepted. Cost per accepted result is undefined. Final actual-head independent review remains owed for the prospective correction; further dispatch is held.
Final candidate source gate: node --test scripts/tests/*.test.mjs skills/tests/*.test.mjs passed183/183 with zero failures/skips. Real snapshot CLI returned12 scheduled runs and zero paid requests. App UI worker separately verified406 app passes plus8 existing platform skips and default production build/spacing. These checks and fixture references are preparation, not trial results.

## First live failure and prospective diagnostic repair

The first approved API planning generation was attempted at reviewed f8ff32bf73433e37e97c00f52dc043501cba453b. Its preceding exact count completed with1092 input tokens. Generation api_behavior_1_A_planning_1 became unknown; the original42730 microdollar reservation remains held with null cost/usage/provider request ID. Trial A closed without an acceptance attempt; B never started. This is a failed counted trial, not a completed comparison. No retry, replacement, campaign reset or charge release occurred.

The initial transport discarded HTTP/body/schema rejection-stage evidence. That prevents a local causal diagnosis or authoritative charge reconciliation. The original request used store:false and no response ID survived; the count request ID cannot stand in for the generation request ID. Only genuine provider evidence for the original request or an explicit operator policy amendment can resolve the next-dispatch decision. No subsequent paid work is authorized by this correction.

Stable defect provider-rejection-diagnostic-loss: detection0 at f8ff32bf; correction1 persists a separate whitelisted, fsynced diagnostic journal prospectively, leaving the original ledger schema/checksum unchanged. Before body parsing, it captures safe HTTP status and x-request-id; X-Client-Request-Id binds to the durable local request ID. After JSON parsing, it captures only bounded response ID/status/model/tier, integer counter values/presence and fixed stage codes. Unknown fields, prompts, output, error bodies, private reasoning and credentials are never persisted. Diagnostic counts are observations, not reconciled usage or permission to release holds. Journal failure blocks transport; malformed prior journals fail closed.

Targeted correction1 tests pass against fake network plus real disposable ledgers: HTTP error without body reading, unknown schema, incomplete response and lost JSON retain safe evidence, preserve unknown reservations and prevent restart dispatch. No schema/model/rate acceptance was loosened. The original campaign remains held and is not used by these tests. Actual-head independent review remains required.

Diagnostic repair history remains explicit: correction1 passed fake guards but failed independent review on identifier/credential safety and truthful persistence-stage classification. Correction2 failed syntax verification after replacement-string expansion corrupted the new module; work stopped. Root recorded revised allowance1 (correction3): direct literal reconstruction, exact authorized model metadata, formatted req_/resp_ identifiers with supplied-credential suppression in journal and returned metadata, and atomic complete sidecar replacement under an exclusive lock. Its required durability test stopped at missing live exact-preflight test setup before journal execution, so that allowance ended. Root recorded revised allowance2 as test-setup-only, freezing production bytes. The corrected atomic test now performs the same mandatory live preflight before reserve, proves each injected fsync/rename failure was reached exactly once, preserves old valid bytes and unfinished temporary evidence, and rejects subsequent dispatch.

Final revised allowance2 evidence: syntax passed; atomic test1/1 passed; full source190/190 passed, zero failures/skips, with EVALUATION_HELD_LEDGER_FIXTURE explicitly set to the original held ledger for an exact disposable-copy restart proof (zero POST). Production hashes remained unchanged across the test-only correction. Original actual file SHA256 remained5b0da91cafa2029e8c3b244fc519a01af08bd894986d73ec8a540ae885ecef3b; envelope checksum34db877261865ec86450dea9157cfc1bda7c5b889d2ad9b08a10eeab940857ad; blockedtrue, unknown generation,42730 microdollar reservation, null cost/usage. The sidecar never migrates or modifies that ledger. Atomic sidecar fsync/rename protects previous valid journal bytes; portable directory fsync on Windows is not claimed. Separate actual-head review remains owed and original-charge recovery/policy remains unresolved.
