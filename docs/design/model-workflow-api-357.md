# API workflow adapter for the model comparison pilot

Created: 2026-10-06
Last updated: 2026-10-06
Issue: [#357](https://github.com/jerrodtuck/vilya/issues/357)
Kickoff: [settled offline-first harness](https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6028353155)

The operator selected an API comparison first to separate experimental API spend
from weekly Codex subscription allowance, then asked the controller to finish the
safeguards and first comparison. Development calls use native Codex separately.
This document describes transport readiness, not a completed comparison or measured
performance result. API screening still needs native Codex validation before adoption.

The dependency-free transport fixes text-only Responses requests to `gpt-6.1-sol`
or `gpt-6-astra`, medium/high reasoning and the explicit Standard `default` tier.
It enforces bounded output including reasoning, no tools, retries, previous response,
background execution or streaming. Root controls actual requests after independent
review. The adapter has no automatic CLI entry and reads the key only from its
provided environment. Root may supply the locally excluded environment file to its
controller; keys never enter prompts, committed files, receipts or diagnostics.

## Exact preparation and reservation sequence

1. The core calls `prepare(request, {requestId, trial, phase})`. Production preparation
   requires explicit live opt-in, credentials, the selected billing interpretation and
   all durable preflight callbacks. Before count dispatch, `preflightGuard.begin`
   persists the scope, complete generation payload hash, exact model/effort, tier,
   pricing date and pending status. The core owns the global 64-count request limit,
   sequential dispatch, scope deadlines and restart blocking.
2. The adapter calls the documented count endpoint once with the same model and input,
   identical reasoning, plain-text format, parallel-tool setting, empty tools and disabled
   truncation. The count schema supports each of these input-affecting options. Generation
   output controls are not count-endpoint parameters;
   every generation option is nevertheless bound by the certificate hash. The count
   deadline is the lesser of 15 seconds and the durable remaining stage/aggregate time. Only the documented two-field count response is
   accepted; unexpected usage, fees or fields stop dispatch. A lost, malformed or
   cancelled count is held in durable state and cannot be silently retried.
3. A successful count is durably completed, then mints an immutable, provenance-checked
   certificate for the exact payload and input count. Admission rejects counts over
   32,000. Certificates expire after 60 seconds, reject clock regression and cannot
   be copied, forged, transferred between transports or reused after dispatch.
4. The core reserves generation cost using the exact count at the maximum disjoint
   input rate and bounded output, before generation POST. Transport checks the pending
   persisted reservation and certificate before sending. Lost responses, cancellation,
   malformed usage or exceeded bounds retain the generation reservation and stop calls.

The core ledger owns $25 aggregate, $2 per trial and $1 shared setup/final overhead;
there is no second budget ledger in the transport. Count attempts, including failed
ones, are recorded separately from billable inference under the interpretation below.
The local 32,000-byte prompt restriction is an admission rule, not a token estimate
or an API-enforced input cap. Exact provider counting includes message framing.

## Billing evidence and selected interpretation

Reviewed official [pricing](https://developers.openai.com/api/docs/pricing) states
that Responses and the other listed APIs are not priced separately; model input and
output tokens carry model rates. The [count reference](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count)
returns a count object without model output or a generation usage record. No separate
count endpoint fee is published in the reviewed pricing table.

Root selected the narrow interpretation that this non-generating count operation
has zero inference cost for this bounded pilot. This is an inference from published
pricing and the endpoint contract, **not an explicit provider guarantee that counting
is free**. The configured value is
`published-pricing-count-zero-2026-10-06`. An arbitrary free-count assumption does not
unlock the adapter. Missing interpretation or durable callbacks fail closed.

The hard budget accounting uses reviewed published prices and the fixed request scope.
It is not a warranty against an undisclosed provider fee, provider price change or
incorrect provider usage. Unexpected count schemas/fees/usage fail closed; any changed
billing contract must be reviewed before another request. No hypothetical fee number,
byte-padding tokenizer proof or unpriced alias is used.

The dated rates live in `scripts/evaluation/verified-api-rates-2026-10-06.json`.
Uncached input, cached input and cache writes are disjoint parts of total input;
reasoning is part of output. Missing counters are not zero. Unsupported returned
tiers, tools, redirects and usage overflow stop reconciliation. Generated text is
returned only for ephemeral isolated trial processing. Only safe request IDs and
exact counters are audit metadata; prompts, tool text, raw error bodies and provider
reasoning summaries do not belong in the durable audit.

## Verification and limits

Run `node --test scripts/tests/evaluation-openai.test.mjs`. Tests use injected fake
fetches and fake credentials, exercising actual production preparation logic without
network calls. Explicit offline fixture mode additionally rejects native fetch and
accepts only a fixed nonsecret sentinel key. The production fake-network tests prove
ordering, strict count contracts, reservation checks, bound enforcement, one-use/expiry,
no retries, deadlines and private-error suppression. They do not establish real model
availability, account charges or model quality. This worker made no real API request.

The comparison uses stateless bounded planning, an owned-file JSON patch, preapproved
local Node gates and a fresh independent Sol/high review. API tools, agents, cache,
context and runtime differ from native Codex. Failures count toward accepted-result
cost, and a single matched pair offers limited screening evidence. API results alone
cannot establish native workflow recommendations or subscription-dollar savings.

## Official references reviewed on 2026-10-06

- [Responses create reference](https://developers.openai.com/api/reference/python/resources/responses/methods/create): output, tier and usage contract.
- [Counting tokens](https://developers.openai.com/api/docs/guides/token-counting): exact count includes message framing.
- [Count input tokens reference](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count): `POST /v1/responses/input_tokens` and the two-field result.
- [API pricing](https://developers.openai.com/api/docs/pricing): published billing basis used for the disclosed interpretation.
- [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching): disjoint input billing categories.
- [Sol model](https://developers.openai.com/api/docs/models/gpt-6.1-sol) and [Astra model](https://developers.openai.com/api/docs/models/gpt-6-astra): exact model and rate catalog sources.
