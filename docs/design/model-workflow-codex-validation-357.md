# Native Codex validation of workflow hypotheses — issue #357

Created: 2026-10-06
Last updated: 2026-10-06
Owning issue: https://github.com/jerrodtuck/vilya/issues/357
Stage contract: https://github.com/jerrodtuck/vilya/issues/357#issuecomment-6028446097

API results form a workflow hypothesis. The same proposed workflow must then be tested inside native Codex before recommending a change to skills or production routing. Local parser tests establish metadata handling; they do not establish that either workflow produces better accepted changes. No model trials or paid API calls ran during this collector work.

The initial ceiling remains 12 total trials and 90 trial minutes, with a proposed split of six API and six native trials. Each environment runs one matched pair for behavior, instruction and migration. Assign the first locked pair to API and the second to native: behavior API AB/native BA; instruction API BA/native AB; migration API AB/native BA. Run API discovery before the native block. This uses the existing fixture order without adding replacement runs. One pair per task/environment is screening evidence, not repeated consistency or universal superiority. Any later replication requires its own approved budget and time extension; no production recommendation can claim repetition from this sample.

A and B retain the exact fixture definitions: A planning uses native gpt-6.1-sol/medium; B planning uses native gpt-6-astra/high. Both use fresh gpt-6.1-sol/medium implementation and separate fresh gpt-6.1-sol/high review. API identifiers, efforts, certified input bounds and dated rates must be resolved separately; there is no silent mapping from native identifiers. Lock the API hypothesis and candidate workflow before the native block. Identify the actual current-flow baseline from the installed policy, rather than assuming A is production: the normal #347 policy uses Astra/high planning, Sol/medium implementation and separate Sol/high review. If the candidate is identical to the baseline, record that fact rather than presenting it as a meaningful alternative.

Each trial starts from the immutable seed and verbatim task prompt in scripts/evaluation/fixtures. Use the same ownership, focused regression gates, independent checks and semantic rubric. Isolate each trial checkout; later workers receive no earlier solution, review or oracle result. Independent checks are not technically hidden from filesystem-capable agents. These historical fixtures and globally installed skills can leak later solutions; retain that contamination limitation. Never weaken acceptance to fit a time or token target.

Record the trial/environment identifier, original seed, actual starting HEAD, exact model/effort per phase, complete brief hash, tool/environment/installed-skill differences and phase agent/session identities. Record planning, implementation, gates, independent review, repair count, accepted result, blockers, elapsed phase/end-to-end time and unavailable counters. Two consecutive unsuccessful corrective attempts on the same defect stop before a third. Failed, timed-out and repaired phases remain in total usage and accepted-output denominators. With zero accepted outcomes, cost per accepted output is undefined.

Native calls use subscription allowance. Current native tools provide observation and interruption after requests; they do not expose a hard per-request token or dollar ceiling. A seven-minute suggested trial deadline and the aggregate 90-minute ceiling are operational stop controls, not guaranteed limits on an in-flight native request. API $25 total/$2 per trial controls remain a separate ledger. Never convert native tokens or allowance percentages into actual API spend or subscription dollars. No API-equivalent estimator is included in this collector; any later estimate needs external verified exact-model dated rates and its own explicit estimate label.

Capture account allowance immediately before and after the native block, including reset timestamps and available windows. Keep non-trial development outside that block and record any concurrent work, other devices, resets, rounding or missing windows. Account-level percentage changes corroborate allowance use; they are not exact task token prices. Controller/preparation totals remain separate until disjointness is explicitly proved.

## Import interface and completion receipt

scripts/evaluation/native-usage.mjs exports:

- `await importNativeUsage({ manifest, sessionFile })`, for one explicitly named local JSONL file.
- `await importNativeUsage({ manifest, stream })`, for one string or async iterable/Node readable stream.
- `aggregateNativeUsage(receipts, { independenceEvidence })`, for explicitly disjoint fresh phase receipts.

No recursive discovery, credentials, network/provider calls or prompt/tool exports exist. CLI form: `node scripts/evaluation/native-usage.mjs --manifest <receipt.json> --session <explicit-session.jsonl>`. The CLI outputs only selected metadata and generic failure codes; unsuccessful attribution exits 2 with `usage: null`.

The caller supplies this receipt shape; no completion is inferred from the final log record:

```json
{
  "schemaVersion": 1,
  "agentId": "fixture-agent",
  "taskPath": "/root/fixture_agent",
  "sessionUUID": "11111111-1111-1111-1111-111111111111",
  "parentSessionUUID": "22222222-2222-2222-2222-222222222222",
  "model": "gpt-6.1-sol",
  "effort": "medium",
  "head": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "fixture": "behavior",
  "phase": "implementation",
  "startedAt": "2026-10-07T00:00:00.000Z",
  "endedAt": "2026-10-07T00:00:04.000Z",
  "freshSession": true,
  "historyMode": "none",
  "phaseCount": 1,
  "completionObserved": {
    "completed": true,
    "source": "native-agent-final",
    "observedAt": "2026-10-07T00:00:04.000Z"
  },
  "baseline": {
    "timestamp": "2026-10-07T00:00:00.000Z",
    "counts": {
      "input_tokens": 0,
      "cached_input_tokens": 0,
      "cache_write_input_tokens": 0,
      "output_tokens": 0,
      "reasoning_output_tokens": 0,
      "total_tokens": 0
    }
  },
  "terminal": {
    "timestamp": "2026-10-07T00:00:03.000Z",
    "counts": {
      "input_tokens": 150,
      "cached_input_tokens": 100,
      "cache_write_input_tokens": 0,
      "output_tokens": 30,
      "reasoning_output_tokens": 8,
      "total_tokens": 180
    }
  }
}
```

This is a synthetic example, not a real trial receipt. `completionObserved.source` accepts `native-agent-final` or `native-thread-final`; the caller must prove the corresponding native final signal separately. The importer validates linkage and chronology, but cannot authenticate the caller's claim. `agentId` is an external native identifier: task path/session/parent linkage is verified from the session metadata; the agent ID itself requires caller provenance.

Only a fresh no-history single-phase session is accepted. Its explicit zero baseline must match session_meta timestamp and phase start. The first cumulative count must match last-request usage, proving no inherited usage in that counter stream. Every later unique cumulative delta must match last-request usage. Duplicate snapshots are counted without adding them; counters cannot reset or become negative. The exact external terminal checkpoint must occur in a complete newline-terminated record and match the final cumulative total. Optional cutoffTimestamp must equal terminal.timestamp; parsing stops at that trusted checkpoint, without inspecting later resumed records. Without that cutoff, the entire supplied stream must be flushed and reconcile. Underlying file streams may buffer bytes ahead of the parsed cutoff, but later records are never parsed or exported. Explicit resumed/multi-phase evidence, mixed model/effort, known fork lineage, malformed/partial records, unknown count fields or a missing completion/terminal leave attribution unavailable. Multiple turn_context records with unchanged model/effort can occur during ordinary tool boundaries and are not themselves proof of resumption. The caller must supply trustworthy phase identity; same-model resumption cannot be authenticated from counter metadata alone. Arbitrary fork accounting is deliberately unsupported.

Output includes input, cached input, cache-write input, uncached input (input minus cached input), output and reasoning counters. Reasoning is already a subset of output; total tokens are input plus output. Cache-write is reported separately and is not subtracted from input. A zero-input cache ratio is unavailable. Never sum cumulative snapshots, add last-request counters to cumulative totals, or add reasoning to output again.

Aggregate imports require unique session UUIDs, no included parent/child overlap, and caller evidence `{freshNoHistory: true, accountingDisjoint: true, sessionUUIDs: [...]}` matching the exact receipt set. The importer does not infer independence from task names, siblings or different files. Parent/controller usage remains separate. That evidence is an explicit caller assertion, not an enforced hidden-check or independent-review approval.

## Observed schema and test evidence

A metadata-only shared-read inspection of the explicitly named prior preparation log confirmed the current local schema: session_meta.payload.id, parent_thread_id and agent_path, with matching source.subagent.thread_spawn identity; turn_context.payload.model/effort; event_msg payload.type token_count, info.total_token_usage and info.last_token_usage. All six named counter fields, including cache_write_input_tokens and reasoning_output_tokens, were present. Duplicate cumulative snapshots were observed. The log has since been resumed, so its entire contents cannot support a fresh single-phase attribution claim. It was used for schema inspection only, not accepted as a completed native experiment.

The inspected path was C:\Users\jerro\.codex\sessions\2026\10\06\rollout-2026-10-06T19-33-23-01a113c7-7c11-75c3-94b7-d7208c183418.jsonl. Inspection used FileShare.ReadWrite and printed only the whitelist; no private instructions, prompts, tools or provider credentials were copied into artifacts.

`node --test scripts/tests/evaluation-native-usage.test.mjs` passed 12 focused tests. They cover secret marker suppression, cumulative/last reconciliation, duplicate deduplication, resets, identity/model mismatch, reasoning subsets, missing cache-write counters, incomplete flush, fork/resumption rejection, stream failures, explicit-file CLI output and parent/child aggregation. `node --test scripts/tests/evaluation-*.test.mjs` passed all 46 current evaluation tests, including the parallel API/core tests. This script-only change does not require an app build; no app build or service launch ran.

Actual API experiments, native workflow trials, account allowance attribution, independent actual-head review and a repeated native recommendation remain unperformed. Native production skills/model defaults remain unchanged.

## Completed real-session import demonstration

The parent observed FINAL_ANSWER from the fresh no-history /root/evaluation_api_357 worker, reporting its assigned development task complete with no API requests. After that trusted notification, clock__curr_time supplied the observer bound 2026-10-07T00:54:24Z. That bound is the receipt endedAt/observedAt; it is not claimed to be the exact final-answer dispatch time.

A first-record metadata lookup in the known current-date directory identified session UUID 01a113d5-da2f-7da3-bc62-bed9b681d4cb, parent UUID 01a1033e-ca08-79e0-9b79-0f9e31b26f5d and matching /root/evaluation_api_357 task path. Its context was gpt-6.1-sol/medium. HEAD was 012220a83d11acf5c7c316dca36490152f9a8e90. The explicit session file was C:\Users\jerro\.codex\sessions\2026\10\06\rollout-2026-10-06T19-49-04-01a113d5-da2f-7da3-bc62-bed9b681d4cb.jsonl. The parser accepted the fresh zero baseline at 2026-10-07T00:49:04.935Z and every unique cumulative delta matched last-request usage.

The completed real import returned observed/single-fresh-phase with 38 unique snapshots and one deduplicated snapshot. Explicit terminal/cutoff timestamp was 2026-10-07T00:53:55.116Z. Observed counters: input 3,088,767; cached input 3,011,456; cache-write input 0; uncached input 77,311; output 13,746; reasoning subset 1,784; total input plus output 3,102,513. The input cache ratio was approximately 97.497%. These are native subscription preparation token metadata, not a paid API trial or dollar estimate. Elapsed start-to-observer bound was 319,065 ms; true end-to-end task completion occurred no later than that bound.

The explicit temporary receipt is C:\Users\jerro\AppData\Local\Temp\vilya357-native-apiworker-receipt.json. It contains only whitelisted identity/model/head/timestamp/count metadata. The real CLI import exited 0. No raw prompts, instructions, tool text, private paths from session payloads or provider credentials entered this artifact. This demonstrates runtime counter/schema linkage and deduplication for one externally confirmed fresh completed task; it does not establish the quality or cost of an experimental workflow.
