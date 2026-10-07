import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { importNativeUsage, aggregateNativeUsage } from '../evaluation/native-usage.mjs';
const id = '11111111-1111-1111-1111-111111111111';
const parent = '22222222-2222-2222-2222-222222222222';
const start = '2026-10-07T00:00:00.000Z', contextTime = '2026-10-07T00:00:01.000Z';
const firstTime = '2026-10-07T00:00:02.000Z', finalTime = '2026-10-07T00:00:03.000Z', end = '2026-10-07T00:00:04.000Z';
const c = (input, cached, output, reasoning = 0) => ({ input_tokens: input, cached_input_tokens: cached, cache_write_input_tokens: 0, output_tokens: output, reasoning_output_tokens: reasoning, total_tokens: input + output });
const manifest = () => ({ schemaVersion: 1, agentId: 'fixture-agent', taskPath: '/root/fixture_agent', sessionUUID: id, parentSessionUUID: parent,
  model: 'gpt-6.1-sol', effort: 'medium', head: 'a'.repeat(40), fixture: 'behavior', phase: 'implementation', startedAt: start, endedAt: end,
  freshSession: true, historyMode: 'none', phaseCount: 1, completionObserved: { completed: true, source: 'native-agent-final', observedAt: end },
  baseline: { timestamp: start, counts: c(0, 0, 0) }, terminal: { timestamp: finalTime, counts: c(150, 100, 30, 8) } });
const session = () => ({ type: 'session_meta', timestamp: start, payload: { id, parent_thread_id: parent, agent_path: '/root/fixture_agent',
  source: { subagent: { thread_spawn: { parent_thread_id: parent, agent_path: '/root/fixture_agent', agent_nickname: 'SECRET_NICKNAME' } } },
  base_instructions: 'SECRET_BASE_INSTRUCTIONS', cwd: 'SECRET_PRIVATE_PATH' } });
const context = () => ({ type: 'turn_context', timestamp: contextTime, payload: { model: 'gpt-6.1-sol', effort: 'medium', developer_instructions: 'SECRET_CONTEXT' } });
const token = (timestamp, total, last) => ({ type: 'event_msg', timestamp, payload: { type: 'token_count', info: { total_token_usage: total, last_token_usage: last, private: 'SECRET_USAGE' } } });
const records = () => [session(), context(), { type: 'response_item', payload: { prompt: 'SECRET_PROMPT', tool: 'SECRET_TOOL_CONTENT' } },
  token(firstTime, c(100, 70, 20, 5), c(100, 70, 20, 5)), token(finalTime, c(150, 100, 30, 8), c(50, 30, 10, 3))];
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
async function read(rows = records(), m = manifest()) { return importNativeUsage({ manifest: m, stream: jsonl(rows) }); }
function assertBlocked(r, reason) { assert.equal(r.status, 'unavailable'); assert.equal(r.usage, null); assert.ok(r.reasons.includes(reason), JSON.stringify(r)); }

test('known cumulative increments produce one phase total, reasoning is already in output, and secrets never export', async () => {
  const r = await read(); assert.equal(r.status, 'observed'); assert.deepEqual(r.usage, { inputTokens: 150, cachedInputTokens: 100, cacheWriteInputTokens: 0,
    uncachedInputTokens: 50, outputTokens: 30, reasoningOutputTokens: 8, totalTokens: 180, reasoningIsOutputSubset: true, cacheRatio: 2 / 3 });
  assert.equal(r.elapsedMs, 4000); assert.equal(r.actualApiSpend, null); assert.equal(r.subscriptionDollars, null); assert.equal(r.hardNativeSpendCap, false);
  assert.equal(JSON.stringify(r).includes('SECRET'), false);
});
test('duplicate cumulative snapshots are recorded, never summed again', async () => {
  const rows = records(); rows.push(token('2026-10-07T00:00:03.500Z', c(150, 100, 30, 8), c(50, 30, 10, 3)));
  const r = await read(rows); assert.equal(r.status, 'observed'); assert.equal(r.uniqueSnapshots, 2); assert.equal(r.duplicateSnapshots, 1); assert.equal(r.usage.totalTokens, 180);
});
test('unknown completion and missing terminal flush never become zero', async () => {
  const m = manifest(); delete m.completionObserved; assertBlocked(await read(records(), m), 'completion_not_proven');
  assertBlocked(await importNativeUsage({ manifest: manifest(), stream: jsonl(records()).trimEnd() }), 'incomplete_jsonl_flush');
  const rows = records().slice(0, -1); assertBlocked(await read(rows), 'terminal_not_reconciled');
});
test('negative/reset and cumulative-last mismatch stop attribution', async () => {
  const rows = records(); rows[4] = token(finalTime, c(90, 60, 10, 3), c(1, 0, 1)); assertBlocked(await read(rows), 'counter_reset_or_negative_delta');
  const different = records(); different[4].payload.info.last_token_usage = c(51, 30, 10, 3); assertBlocked(await read(different), 'cumulative_last_mismatch');
});
test('partial usage and invalid subset counts fail, unknown cache-write is never assumed zero', async () => {
  for (const key of ['cached_input_tokens', 'cache_write_input_tokens', 'reasoning_output_tokens']) {
    const rows = records(); delete rows[4].payload.info.total_token_usage[key]; assertBlocked(await read(rows), 'partial_or_invalid_usage');
  }
  const rows = records(); rows[4].payload.info.total_token_usage.reasoning_output_tokens = 31; assertBlocked(await read(rows), 'partial_or_invalid_usage');
});
test('session/path/parent identities and mixed models cannot be attributed to manifest', async () => {
  for (const [key, value] of [['id', parent], ['agent_path', '/root/wrong'], ['parent_thread_id', id]]) {
    const rows = records(); rows[0].payload[key] = value; assertBlocked(await read(rows), 'session_identity_mismatch');
  }
  const rows = records(); rows[1].payload.model = 'gpt-6-astra'; assertBlocked(await read(rows), 'model_effort_mismatch');
});
test('fresh no-history evidence, known forks, inherited counters and resumed turns fail closed', async () => {
  const m = manifest(); m.historyMode = 'all'; assertBlocked(await read(records(), m), 'fresh_single_phase_not_proven');
  const rows = records(); rows[0].payload.forked_from_id = parent; assertBlocked(await read(rows), 'fork_lineage_unproven');
  const inherited = records(); inherited[3].payload.info.last_token_usage = c(80, 50, 10, 4); assertBlocked(await read(inherited), 'cumulative_last_mismatch');
  const repeated = records(); repeated.splice(2, 0, context()); assert.equal((await read(repeated)).status, 'observed');
  const resumedManifest = manifest(); resumedManifest.phaseCount = 2; assertBlocked(await read(records(), resumedManifest), 'fresh_single_phase_not_proven');
});
test('malformed records, unavailable sources and mismatched terminal are unavailable', async () => {
  assertBlocked(await importNativeUsage({ manifest: manifest(), stream: jsonl(records()) + '{BROKEN}\n' }), 'malformed_jsonl');
  const m = manifest(); m.terminal.counts = c(151, 100, 30, 8); assertBlocked(await read(records(), m), 'terminal_counts_mismatch');
  const broken = Readable.from((async function* () { yield jsonl(records()); throw Error('SECRET_STREAM_ERROR'); })());
  const result = await importNativeUsage({ manifest: manifest(), stream: broken }); assertBlocked(result, 'source_unavailable'); assert.equal(JSON.stringify(result).includes('SECRET'), false);
});
test('out-of-order metadata and usage outside the explicit phase are blocked', async () => {
  const rows = records(); rows[4].timestamp = contextTime; assertBlocked(await read(rows), 'metadata_time_reversed');
  const outside = records(); outside[4].timestamp = '2026-10-07T00:00:05.000Z'; assertBlocked(await read(outside), 'usage_outside_phase');
});
test('aggregation refuses duplicate sessions, parent/child overlap and absent independence evidence', async () => {
  const r = await read(); assertBlocked(aggregateNativeUsage([r, r]), 'duplicate_session');
  const child = structuredClone(r); child.identity.sessionUUID = '33333333-3333-3333-3333-333333333333'; child.identity.parentSessionUUID = id;
  assertBlocked(aggregateNativeUsage([r, child]), 'parent_child_overlap');
  child.identity.parentSessionUUID = parent; assertBlocked(aggregateNativeUsage([r, child]), 'independence_not_proven');
  const a = aggregateNativeUsage([r, child], { independenceEvidence: { freshNoHistory: true, accountingDisjoint: true, sessionUUIDs: [id, child.identity.sessionUUID] } });
  assert.equal(a.status, 'observed'); assert.equal(a.usage.totalTokens, 360); assert.equal(a.usage.reasoningOutputTokens, 16);
});
test('CLI reads only the explicit files and emits no raw prompt, path or tool content', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vilya-native-usage-test-'));
  fs.writeFileSync(path.join(temp, 'receipt.json'), JSON.stringify(manifest())); fs.writeFileSync(path.join(temp, 'session.jsonl'), jsonl(records()));
  const run = spawnSync(process.execPath, ['scripts/evaluation/native-usage.mjs', '--manifest', path.join(temp, 'receipt.json'), '--session', path.join(temp, 'session.jsonl')], { encoding: 'utf8' });
  assert.equal(run.status, 0); assert.equal(run.stdout.includes('SECRET'), false); assert.equal(run.stdout.includes(temp), false);
  assert.equal(JSON.parse(run.stdout).usage.totalTokens, 180);
});

test('trusted exact terminal cutoff validates completed historical phase without parsing later resumed records', async () => {
  const m = manifest(); m.cutoffTimestamp = m.terminal.timestamp;
  const resumed = { ...context(), timestamp: '2026-10-07T00:00:10.000Z', payload: { model: 'gpt-6-astra', effort: 'high', secret: 'SECRET_LATER_TURN' } };
  const r = await importNativeUsage({ manifest: m, stream: jsonl([...records(), resumed]) + '{PRIVATE_PARTIAL' });
  assert.equal(r.status, 'observed'); assert.equal(r.usage.totalTokens, 180); assert.equal(JSON.stringify(r).includes('SECRET'), false);
  const wrong = manifest(); wrong.cutoffTimestamp = firstTime; assertBlocked(await read(records(), wrong), 'invalid_trusted_cutoff');
});
