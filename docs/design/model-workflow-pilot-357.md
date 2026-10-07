# Model/workflow pilot harness — issue #357

Created: 2026-10-06
Last updated: 2026-10-06
Owning issue: https://github.com/jerrodtuck/vilya/issues/357
Implementation kickoff: https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6028353155

A dependency-free local Node harness now proves its reservation guards and bounded workflow with offline providers. No paid API request, coding model trial or native validation trial has run. Exact API model pricing is available; production transport remains blocked because exact input-token bounds and token-count preflight billing are not certified. The current development session has no environment API credential. Fake certificates are accepted only by injected offline transport and cannot unlock production.

The CLI defaults to dry-run. It never reads credential files, installs dependencies, starts the app, changes model defaults or creates provider accounts. `--api-preflight` reports credential presence, never its value. `--run-api --live` requires absolute workspace, ledger and existing dependency paths inside the dedicated checkout; current certification failure occurs before ledger initialization, archive or network. The CLI is not an unattended native-agent backend.

```powershell
# Workdir: C:\Users\jerro\.codex\worktrees\357-model-workflow-pilot\vilya
node scripts/evaluation/harness.mjs --dry-run
node scripts/evaluation/harness.mjs --api-preflight
node --test skills/tests/*.test.mjs scripts/tests/*.test.mjs
# Explicit fake example; use a new path once, then resume the same path:
node scripts/evaluation/harness.mjs --initialize-example --ledger C:\Users\jerro\AppData\Local\Temp\vilya-357-offline-example.json
node scripts/evaluation/harness.mjs --resume-example --ledger C:\Users\jerro\AppData\Local\Temp\vilya-357-offline-example.json
```

Fake example amounts are test-vector microdollars, not paid spend. Missing ledgers cannot silently initialize on resume. Reusing initialize refuses to overwrite a ledger. No API-key value, prompt, generated code, gate output, private reasoning or failed response body is persisted in budget receipts.

## Budget and failure behavior

| Scope | Hard design ceiling |
| --- | --- |
| All API work | 25,000,000 integer microdollars ($25) |
| One trial, including review/repair/failures | 2,000,000 ($2) |
| Setup plus final report/adjudication | 1,000,000 ($1), shared |
| Planning / implementation / shared review-repair | 400,000 / 1,000,000 / 600,000 |
| Trials / individual trial | At most 12 / seven minutes |
| Trial dispatch window / final reserve | 84 minutes / six minutes |
| Setup window | Ten minutes; final has a separate six-minute window |
| Request bounds | 32,000 input, 8,000 output including reasoning, eight requests per phase, 60 seconds, zero model tools, zero transport retries |

The setup ten-minute ceiling and phase allocations are initial implementation limits, not completion or affordability claims. Trial timing is a conservative wall-clock window from first begin, including later archive/gate time; backward clock changes fail closed. A hard request deadline aborts the provider and leaves unresolved spend held. Cancellation is best effort and does not prove no charge.

Reserve the worst-case input at the highest uncached/cache-write/cached rate and bounded output/known maximum fees before transport. Reconciliation treats uncached, cached and cache-write tokens as disjoint input categories. Output includes reasoning; reasoning is reported separately and not added again. Weighted category costs use BigInt arithmetic with upward microdollar rounding. Rates/config changes, unknown fees, malformed counts, output/input beyond reservation, overflow or unresolved requests fail closed. Exact verified rates are pinned in `scripts/evaluation/verified-api-rates-2026-10-06.json`; this only covers Standard/default processing region, short context and no tools.

Pairs allocate both full $2 trial ceilings before either arm. One persisted pending request excludes all other requests, including other processes. A checksummed ledger, exclusive lock, fsync and same-volume atomic rename persist the reservation before send. Completed usage releases only known unused capacity. Lost/unknown usage retains the full reservation and blocks dispatch across restart. A stale lock or `.next` file is never automatically deleted; retain evidence and reconcile outside the runner. This does not claim power-loss durability for Windows directory metadata, tamper resistance or protection against an operator manually deleting budget state.

Every paid attempt, including failed responses and review/repairs, uses the same ledger. Request IDs and trials cannot be reused; no replacement runs, top-ups or fallback models exist. Same-defect repairs preserve their request history and stop after two unsuccessful corrective checks; a meaningful pass closes the consecutive failure count. A no-change correction stops without pretending it repaired the defect.

## Workflow and fixture validity

The fixture manifests lock seeds, task prompts, owned files, commands, semantic rubrics and paired order. [Fixture validation](model-workflow-fixtures-357.md) records existing focused baseline pass, expected unfixed oracle failure and reference pass for all three. Full seed app/build feasibility remains unverified and must pass before paid dispatch. The workflow preserves full Vitest, production build and spacing gates, rather than replacing them with focused checks.

The original manifest orders are behavior AB/BA, instruction BA/AB, migration AB/BA. The settled initial stage runs API behavior A,B; instruction B,A; migration A,B, then native behavior B,A; instruction A,B; migration B,A. Six API plus six native trials share the original twelve-trial/90-minute cap. Further API repetitions are not dispatched. Each trial gets a tracked-only fresh archive without Git history or private untracked settings. Native settings remain A Sol/medium planning versus B Astra/high planning, both Sol/medium implementation and separate Sol/high review. API exact IDs use `gpt-6.1-sol` and `gpt-6-astra`, with corresponding efforts. API phases use fresh stateless requests, fixed source context, validated full-file JSON replacements, controller-run tests and separate actual before/after review. They do not offer desktop agent shell/tool exploration and must be evaluated as a different workflow bundle.

Patch paths reject traversal, absolute paths, backslash ambiguity, duplicates, symlinks and changes outside fixture ownership. Gates are controller-selected Node commands, never model-supplied shell commands. Model-edited tests run with provider credentials removed from the child environment and bounded process deadlines. The process runner kills its child tree on Windows timeout. This is not an OS filesystem sandbox: generated tests or a filesystem-capable agent can access other local paths, dependencies and supposedly hidden checks. Historical public-source replay and installed later skills also contaminate tasks. No genuinely held-out claim is justified.

The operator additionally requires native Codex validation before recommendations. [The settled allocation](https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6028446097) is six API plus six native trials, one counterbalanced pair per task/environment within the combined twelve-trial/90-minute ceiling. It reduces repetitions; extensions require separate approval. The runner does not silently dispatch the original twelve API trials and then add native trials. Native collection and [validation protocol](model-workflow-codex-validation-357.md) remain separate from paid API spend. Native monitoring cannot enforce API-style dollar/token ceilings.

## Evidence and interpretation

Offline tests cover exact rounding/boundaries, budget denial before send, setup/review/repair inclusion, restart/locks/concurrent attempts, unknown usage, time/context/output/request bounds, pair capacity, stop conditions, patch isolation, CLI privacy and the complete fake planning/implementation/review pipeline. Injected Responses tests additionally prove certificate provenance, persisted reservation checks, exact model/tier/tool limits and sanitized errors. These establish code paths against fakes, not real provider billing or live readiness.

Receipts retain phase, exact model/effort, local request ID, provider request ID when exposed, baseline/reservation/terminal usage, cached/write/output/reasoning counters and phase/trial clock evidence. Cumulative native records require deduplication and proven fresh-session attribution; see the native importer. Missing attribution is unavailable, not zero. Controller/native development overhead is reported separately from paid API trial usage.

At present accepted coding trials = 0, observed paid API requests = 0, paid API spend = $0. Cost per accepted result is undefined. No completion-rate ranking, paired model difference, cache causality, subscription-dollar savings or production model recommendation is supported. After valid API plus native evidence, report raw counts, completion rate, paired differences, median/range, all failures/timeouts and total accepted-result usage/time; do not choose a universal winner from this screening sample.

Implementation pin: gpt-6.1-sol / medium, retained native session under issue-scoped operator authorization. Mandatory crucible applied to actual harness source: no app UI or database-affecting change, component/database review not applicable; local scripts own budget/transport/workflow concerns. Separate actual-head review remains owed. PR references #357 because live comparisons, certified API preflight and native confirmation remain open.

## Repair receipt

Stable gate: gate357-initial-stage-allocation. Initial detection was zero repairs: runnable schedule still included twelve API repetitions after the six-API/six-native amendment. Attempt 1 started from HEAD 012220a83d11acf5c7c316dca36490152f9a8e90 plus the uncommitted harness diff. Hypothesis: selecting the environment-specific first/second manifest pair in one shared schedule and rejecting mismatched resumed trial IDs prevents silent extra API trials. Change: API selects only pair 1 (six trials); native exports pair 2 (six metadata/protocol entries, no spawn). Targeted check: evaluation-harness initial allocation test verifies six/six, counterbalanced order, unique IDs and unsupported replication rejection. Outcome: pass; resolved, zero unsuccessful corrective attempts. Native scheduling remains orchestration-owned; no native backend is added.

The fake historical-archive integration check contains a small behavior reference patch in evaluator test code. Trial archives and API source context exclude that evaluator area; access is not technically hidden from filesystem-capable native agents. This adds another disclosed contamination route.


Observed final gates: node --test skills/tests/*.test.mjs scripts/tests/*.test.mjs passed 139/139, zero failures/skips (46 evaluation checks plus 93 existing skill checks). The real historical archive/focused oracle integration uses fake responses and is not a model trial or a full seed app/build proof. Dry-run and API preflight made zero paid requests. Explicit offline example initialization/resume retained the same ledger and increased fake usage from 43 to 86 microdollars. Fresh origin/master remained 012220a83d11acf5c7c316dca36490152f9a8e90; no rebase was needed. App source was unchanged; app build was not run under the kickoff's scoped source-gate rule.

### Docker safeguard follow-up — stopped at dependency build gate

The pinned official Node 22 image (node@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392) and trusted lockfile dependency image were built locally. The behavior baseline passed all 53 existing app tests in the network-disabled, nonroot container. Default Next build failed because Turbopack rejects the dependency link outside its inferred project root. Two placement corrections failed; the durable stop receipt is scripts/evaluation/docker-repair-stop-357.json. Its same-fault count is 2. No third correction, benchmark generation, or other fixture full-build validation ran.

The revised hypothesis is to copy actual Linux dependencies into bounded fixture tmpfs, without a node_modules link. It requires separate high review and explicit revised-plan approval. Restart and review do not reset the failure counter. Runtime image/dependency receipt and gate logs remain in ignored scripts/evaluation/runtime; they contain no controller credentials. Host model-code execution is now forbidden. Current trial CLI fails closed at this stop; setup review alone has a bounded explicit invocation.

The real remote input-count preflight uses the dated scoped zero-separate-fee interpretation of published pricing, not an explicit provider free-call warranty. Durable preflight completion must meet count, phase and aggregate deadlines. All generation costs remain reserved before transport. No paid call occurred during this follow-up.

Root-controlled setup review command (public bounded prompt only; generation ledger is reused for trials): node --env-file=C:/Users/repo/vilya/.env.local scripts/evaluation/harness.mjs --setup-review --live --initialize --ledger ABSOLUTE_PILOT_RUNTIME_LEDGER --prompt ABSOLUTE_PUBLIC_REVIEW_PROMPT. Omit --initialize when resuming. Use --review-id setup_cost_review_1, setup_sandbox_review_1 or setup_final_review_1; allowlisted IDs prevent replay. Model gpt-6.1-sol, effort high, output cap 8000, prompt cap 32000 UTF-8 bytes. This does not execute model code or clear the Docker repair stop.
