# Native review findings repair context — #357

The native bridge now keeps rejected review findings for the immediate repair packet. Previously it retained only `findingCount`, which left the repair phase without the specific defect to correct.

## Scope and authority

Owning issue: https://github.com/jerrodtuck/vilya/issues/357, freshly read as OPEN before implementation on 2026-10-07. The bounded settled implementation uses `gpt-6.1-sol` / `medium` under the operator's #347 policy and the parent worker brief. The orchestrator owns separate Sol/high review and merge coordination. No subagents were spawned.

Worktree: `C:/Users/jerro/.codex/worktrees/357-model-workflow-pilot/vilya`, branch `codex/357-model-workflow-pilot`. Brief base: `ddde35e33d4c70786df490a4628b46801b0b103e`. Original start: `012220a83d11acf5c7c316dca36490152f9a8e90`. The base is an ancestor of that original start. Actual repair starting HEAD: `e057a381bbd950cd21e645eb4731c7ee02aa4fed`, after the separate workflow proof commit.

Only these paths belong to this correction:

- `scripts/evaluation/native-bridge.mjs`
- `scripts/tests/evaluation-native-repair-context.test.mjs`
- `docs/design/model-workflow-native-repair-context-357.md`

## Contract

The existing private native state stores `repairContext = {reviewReceiptId, findings, sourceHashes}` after a rejected review. Each of at most eight findings must be a nonempty string, at most 500 UTF-8 bytes; the combined bound is 4000 bytes. Malformed or empty findings stop with `invalid-output`. Oversize findings stop with `context-too-large`. The bridge does not truncate findings.

The repair packet includes the exact findings only when the private context matches the latest rejected attempt's review, its native review receipt, the immediately preceding native review phase, and current hashes for every owned source file. A receipt, attempt, phase or source mismatch stops before applying edits. Old gate-only states with no review continue safely. Old rejected-review states without context stop rather than invent findings.

After successful `applyEdits`, the bridge removes private repair context before running acceptance gates. A later gate failure receives gate results and a null review. A valid ready review with no findings still accepts. Review summaries, attempt summaries, native phase metadata and `publicSnapshot` retain counts and provenance without raw finding text.

## Verification and repair receipt

Stable defect: `native-review-findings-loss`. Initial detection is ordinal 0: source inspection found that `state.review` dropped findings before packet creation. Correction 1 adds private receipt/source binding, validation, immediate repair delivery and clearing after edits. `node --test scripts/tests/evaluation-native-repair-context.test.mjs` passed all five tests with no skips. This resolves the defect; consecutive unsuccessful corrections: 0. No third correction is authorized after two unsuccessful corrections of the same gate.

The tests exercise the current bridge with real phase packet, edit, context and public export functions. They replace only acceptance with explicit offline gate results, and use disposable synthetic native state and usage receipts. They cover exact finding delivery, maximum UTF-8 bytes, oversized and malformed inputs, receipt/latest attempt/phase mismatch, changed source, legacy missing context, clearing after repair, a later gate failure, private public output, ready acceptance and acceptance after repair. These are component tests, not native-agent or Docker execution evidence.

The full `node --test scripts/tests/*.test.mjs` source suite ran in a disposable current-source Git clone at `C:/Users/jerro/AppData/Local/Temp/vilya-native-repair-verify-Tng8rN/vilya`. The clone received pre-A runtime metadata from `C:/Users/jerro/AppData/Local/Temp/vilya-inspector-source-1791382856298/scripts/evaluation/runtime`, without the active recovery claim. Frozen original/B ledger fixture paths were injected as read-only test inputs. The result was 152 tests: 151 passed, 0 failed and 1 skipped (the explicitly gated actual Docker contract proof). Final output is `C:/Users/jerro/AppData/Local/Temp/vilya-native-repair-verify-Tng8rN/test-output-final.txt`.

An earlier source copy without Git history failed archive-based fixture setup. That was a disposable verification setup failure, with no corrective production change. The subsequent Git clone preserved immutable seed history and passed the full source suite.

No paid/API/native agent calls, environment/key reads, live ledger or journal writes, model settings, budget limits or gate changes were made. Existing financial admission repair history remains unchanged. The parent reported the separate proof worker's prior actual Docker whole-chain proof; this correction does not claim a new Docker or native execution. Independent review is still required. Usage is unavailable, not zero.
