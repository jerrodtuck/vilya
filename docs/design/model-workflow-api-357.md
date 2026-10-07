# API workflow adapter for the model comparison pilot

Created: 2026-10-06  
Last updated: 2026-10-06  
Issue: [#357](https://github.com/jerrodtuck/vilya/issues/357)  
Kickoff: [settled offline-first harness](https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6028353155)

The operator selected an API comparison first to keep experimental calls separate
from the weekly Codex subscription allowance. Harness development itself uses
native Codex calls. No API comparison trial has run and no performance result is
claimed. API evidence must later be checked against native Codex workflow behavior
before recommending production routing changes.

The dependency-free transport builds a fixed text-only Responses request for
`gpt-6.1-sol` or `gpt-6-astra`, with medium/high reasoning, an explicit Standard
`default` service tier, bounded output including reasoning, no tools, no retries,
no previous response, and no background/streaming execution. The core ledger owns
all spending limits: $25 aggregate, $2 per trial, and $1 shared setup/final overhead.
It must persist the reservation before dispatch and retain it on an unresolved call.
The adapter does not implement a second budget ledger or a live command-line entry.

The dated rate catalog is
`scripts/evaluation/verified-api-rates-2026-10-06.json`. Cache reads, cache writes
and uncached input are disjoint parts of total input; reasoning is part of output.
Unknown or missing counters cannot be reconciled as zero. Unsupported returned
service tiers, hosted tool output, redirects, malformed usage and usage exceeding
the held bounds fail without exposing response bodies or provider exception text.
Generated text is returned only for ephemeral isolated trial processing. Safe
request IDs and exact usage counters are separate metadata; prompts and provider
reasoning summaries do not belong in the durable audit.

## Input certification and present live blocker

`createOpenAITransport().prepare(request)` must certify the exact model and full
immutable payload before the core reserves money. `inputBound(request, certificate)`
checks certificate provenance and its payload hash, model, Standard tier and pricing
date. `send(request, certificate)` also requires a callback which checks the actual
persisted pending reservation. A caller-supplied count, changed prompt, different
model or copied certificate is rejected.

Currently certificates exist only in explicit offline fixture mode, requiring an
injected fake fetch and fixture token counter. These certify a fake-provider contract,
not OpenAI tokenization. Fixture mode rejects native fetch and accepts only the
fixed nonsecret sentinel credential. Production preparation and input validation fail closed,
even with explicit live opt-in and an environment key. No injected counter is proof
of a production tokenizer or fee bound.

The official token-count endpoint includes model message framing. Its pricing was
not established from the reviewed documentation. A byte estimate plus invented
padding does not certify framing or authorize an unreserved preflight request.
Live execution therefore requires verified count/preflight billing evidence and a
reviewed integration that accounts for every potentially billable call before send.
The existing 32,000-byte prompt admission limit is a local size restriction, not an
API token-count guarantee or an API-enforced input-token cap.

## Preparation and verification

Supply an API key outside chat and outside committed files only when live readiness
has been established. The intended source is the process `OPENAI_API_KEY` environment
variable. Never paste it into an issue, ledger, prompt or diagnostic. Only optional
credential availability belongs in status. Key presence alone cannot unlock this
adapter. This build did not set up an account or read a credential file.

Offline tests use fake credentials and fake fetch implementations. Run
`node --test scripts/tests/evaluation-openai.test.mjs`. They exercise pre-send
rejection, certificate binding, payload bounds, cancellation/deadline behavior,
no retries, redirects, missing/overlapping counters, budget-bound overflow and
private-error suppression. They establish protocol guard behavior, not provider
availability, actual charges, native Codex tool parity or model quality.

An API comparison would use stateless bounded planning, an owned-file JSON patch,
preapproved local Node gates and a fresh independent Sol/high review. It cannot
reproduce all native Codex tools, agent delegation, cache/session context or runtime
behavior. A completed API screening remains evidence for its own fixtures and
configurations, with failures included and no universal winner or subscription-dollar
savings claim.

## Official references reviewed on 2026-10-06

- [Responses create reference](https://developers.openai.com/api/reference/python/resources/responses/methods/create): output, tier, usage and no-tools request contract.
- [Counting tokens](https://developers.openai.com/api/docs/guides/token-counting): exact count includes message framing; local estimates have limitations.
- [Count input tokens reference](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count): `POST /v1/responses/input_tokens`.
- [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching): disjoint input billing categories.
- [Sol model](https://developers.openai.com/api/docs/models/gpt-6.1-sol) and [Astra model](https://developers.openai.com/api/docs/models/gpt-6-astra): exact model identifiers and dated pricing catalog sources.
