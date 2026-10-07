# Prospective financial contract 2 — correction 4 for #357

This correction admits the exact Standard access program shape and rejects malformed background and parallel-tool flags. New financial diagnostics identify this prospective interpretation as contract 2. Historical ledgers and diagnostics keep their original bytes and interpretation.

## Authority and ownership

Issue https://github.com/jerrodtuck/vilya/issues/357 was freshly read as OPEN before edits on 2026-10-07. The full revised allowance is https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6045486085. It authorizes bounded correction 4 under `gpt-6.1-sol` / `medium`, following the operator's #347 routing policy. Any failed required check stops the allowance before another correction. Separate Sol/high independent review and Astra/high consequential review of the actual candidate are required before live use. This receipt grants no paid-call or live-activation permission.

Worktree: `C:/Users/jerro/.codex/worktrees/357-model-workflow-pilot/vilya`, branch `codex/357-model-workflow-pilot`. The brief/current implementation base was `44444b92287f840974112a8b12e4f289b904cf44`. The recorded original start remains `012220a83d11acf5c7c316dca36490152f9a8e90`; the current base descends from the original start. Actual HEAD after the separate documentation correction was `fd28b9b794dab0ba274e839f0c26b2e2dfaeec30`. This worker did not edit or stage that other worker's paths.

Owned production paths: `scripts/evaluation/financial-inspector.mjs`, `scripts/evaluation/openai-transport.mjs`, `scripts/evaluation/diagnostics.mjs`, `scripts/evaluation/diagnostic-observations.mjs`. Added test: `scripts/tests/evaluation-financial-contract2.test.mjs`. Necessary synthetic response fixture updates: `scripts/tests/evaluation-financial-inspector.test.mjs`, `scripts/tests/evaluation-openai.test.mjs`, `scripts/tests/evaluation-diagnostics.test.mjs`, `scripts/tests/evaluation-financial-recovery.test.mjs`, `scripts/tests/evaluation-harness.test.mjs`. This note is the eleventh owned path.

## Verified primary evidence and limits

The [official Responses creation schema](https://developers.openai.com/api/reference/python/resources/responses/methods/create.md), read through HTTPS on 2026-10-07, describes an optional access program object and an effective Cyber program on the response. Its enum includes Standard and two Daybreak variants. It describes optional boolean background and required boolean parallel tool calls on responses. The approved local contract admits only the exact Standard object, optional inactive background and disabled parallel tools. These are narrower scope requirements than the general API schema.

The [official pricing page](https://developers.openai.com/api/docs/pricing) and exact [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol) and [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) catalog pages were also read. Standard/default/text/no-tools uses a bounded published-rate inference. This does not certify an invoice or prove the cause of an earlier B failure. Existing dated rate constants and cost arithmetic remain unchanged.

## Exact admission differences

Only three predicates differ from the frozen 94bc validator:

| Response field | Contract 2 |
| --- | --- |
| `access_programs` | Absent, null or exactly `{"cyber":"standard"}`. Other programs, extra keys, missing keys and malformed values reject. |
| `background` | Absent, null or literal `false`. Other values reject. |
| `parallel_tool_calls` | Requires literal `false`. Missing, null, true, numeric, string, array or object values reject. |

All other envelope and nested whitelists, exact model/default tier, text/no-tools scope, status, output/content inspection, usage counter/subset/bound checks, fees and cost arithmetic are unchanged. Synthetic accepted response fixtures now explicitly set `parallel_tool_calls:false`; the frozen validator file is untouched. Existing inspector tests compare the frozen decisions with only the three explicit differences applied. Dedicated tests independently enumerate those differences and prove identical usage/cost for admitted fixtures.

## Diagnostics and privacy

Prospective transport `body-observed` and `schema-rejected` financial observations use diagnostic schema v4 with literal `financialContractVersion:2`. Validation requires exact keys, generation kind, an eligible stage, the fixed version, a finite controlled inspection and equality between billing validation and inspection validation. The projection requires matching inspection and financial contract version across the body/rejection chain before publishing observed counters. Unknown versions, missing version, mismatched inspection and cross-version chains reject.

Unflagged `diagnosticEvent` calls keep their existing v1/v2/v3 behavior. Validators still read v1-v3 records without adding fields or rewriting bytes. No raw prompt, output, response body, program string or unknown field name enters the diagnostic or observation export. A financially valid refusal or max-output incomplete response remains a quality failure with known financial usage. Unknown scope retains its full reservation, and restart dispatch sends nothing.

## Repair ledger and observed verification

Stable financial admission defect history remains: two unsuccessful admission repairs, then diagnostic-only correction 3. The published revised allowance adds correction ordinal 4; it does not reset prior counts or claim correction 3 fixed admission. Correction 4's hypothesis is that three explicit schema/scope predicates need a bounded prospective interpretation, with a versioned diagnostic receipt. Starting production HEAD was `44444b92287f840974112a8b12e4f289b904cf44`. No required check failed during this allowance, and no additional correction was attempted.

Verification used a disposable current-source Git clone at `C:/Users/jerro/AppData/Local/Temp/vilya-contract2-verify-ejdzJZ/vilya`. It contains the exact owned source/test bytes and pre-A runtime fixtures from `C:/Users/jerro/AppData/Local/Temp/vilya-inspector-source-1791382856298/scripts/evaluation/runtime`, without the actual recovery claim. Read-only original/B held fixture paths were supplied through the two documented test variables. Tests use injected fake transport only.

- Targeted command: `node --test scripts/tests/evaluation-financial-contract2.test.mjs scripts/tests/evaluation-financial-inspector.test.mjs scripts/tests/evaluation-openai.test.mjs scripts/tests/evaluation-diagnostics.test.mjs scripts/tests/evaluation-financial-recovery.test.mjs scripts/tests/evaluation-diagnostic-observations.test.mjs`. Result: 59 passed, 0 failed, 0 skipped; 1155.5617 ms. Log: `C:/Users/jerro/AppData/Local/Temp/vilya-contract2-verify-ejdzJZ/targeted.txt`.
- Full source command: `node --test scripts/tests/*.test.mjs`. Result: 158 tests, 157 passed, 0 failed, 1 skipped; 3535.6638 ms. The skip is the explicitly gated actual Docker controller proof. Log: `C:/Users/jerro/AppData/Local/Temp/vilya-contract2-verify-ejdzJZ/full-source.txt`.
- `git diff --check` passed. No new Docker or native-agent runtime proof is claimed. Existing Docker proof evidence remains separate from this prospective financial compatibility check.

Frozen SHA256 values were checked before and after targeted/full verification:

| Input | Unchanged SHA256 |
| --- | --- |
| Original held ledger | `5b0da91cafa2029e8c3b244fc519a01af08bd894986d73ec8a540ae885ecef3b` |
| B held ledger | `066f7a5ccd711842e2d7adf64043e5d234eb5277d43490668488d94dce52140f` |
| B diagnostic journal | `e61d5960f66d0d3d0367eb677b7727cbe5671aa8c5a8310a9ee460a053c1588d` |
| Frozen 94bc validator | `70db99fde13f4435b27c829b431cc51bc02e84b2054a0975e3a378565841305d` |

No provider POST, paid API call, native trial agent, key or `.env` read, raw-body recovery, payload/rate change, live ledger/journal write, authorization claim, reconciliation, reservation release or live activation occurred. Synthetic disposable test ledgers and journals are the only test mutations. Usage is unavailable, not zero. Independent reviews and any subsequent authorized live work remain parent-owned gates.
