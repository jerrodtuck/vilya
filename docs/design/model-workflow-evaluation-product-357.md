# Evaluation evidence pages — issue 357
Created: 2026-10-07. Last updated: 2026-10-07.
Issue: https://github.com/jerrodtuck/vilya/issues/357

The controller produces a normalized public DTO. `exportSnapshot(candidate)` validates exact schema version 1 and atomically writes the fixed ignored `apps/skill-registry/.evaluation/results.json`. It has no ledger/session reader. The web server reads this file on each request for `/evaluation`, `/evaluation/[runId]` and `/evaluation/data.json`. The download includes all exported evidence even when the list is filtered. Missing snapshots show no results; invalid snapshots return a safe message and download HTTP 503. Unknown trials return 404.

Required fields remain null when unknown. API charges include failed requests, repairs and reviews; unresolved reservations stay visible. Native token evidence has no dollar conversion. Reasoning tokens are a subset of output tokens. Acceptance requires complete attempts, final required gates, independent review and terminal adjudication. API and native populations never pool. Shared overhead stays outside either arm.

The evidence summary describes a lower API cost arm only when all twelve trials have complete accepted evidence, API costs are resolved, and native usage attribution is verified. Even then it describes only these fixtures and requires replication before production routing changes. A partial screen retains the current baseline. Historical fixtures are not held out; oracle access is not enforced, and cache behavior is uncontrolled.

Host app validation uses Node 26.4.0 with unchanged locked dependencies. Benchmark model-edited fixture gates require Docker and their pinned Node runtime. This difference does not authorize host execution of benchmark fixtures. Actual browser checks and live pilot execution remain root-owned.

Acceptance evidence repair: fixed gate sets are pinned to each immutable fixture, including regeneration, full test/build and spacing gates. Accepted results require complete phase counters and timestamps for planning, implementation, every repair and actual independent review. Review IDs resolve to the matching API request or verified native phase and provenance. An oracle-only gate subset or disconnected review cannot approve a result. Matched comparisons additionally require the same known controller, dependency image, lock, skills, Node, context and tool metadata across A/B. Dataset sourceHead records the export revision; environment controllerHead records the actual immutable trial pipeline.
