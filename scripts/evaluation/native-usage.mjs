import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const COUNT_KEYS = ['input_tokens', 'cached_input_tokens', 'cache_write_input_tokens', 'output_tokens', 'reasoning_output_tokens', 'total_tokens'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[A-Za-z0-9_./:-]{1,160}$/;
const PHASES = new Set(['preparation', 'planning', 'implementation', 'review', 'repair', 'adjudication']);
const EFFORTS = new Set(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra']);
const validTime = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const sameCounts = (a, b) => COUNT_KEYS.every((k) => a[k] === b[k]);
const zeroCounts = () => Object.fromEntries(COUNT_KEYS.map((k) => [k, 0]));

function counts(value) {
  if (!value || COUNT_KEYS.some((k) => !Number.isSafeInteger(value[k]) || value[k] < 0)) return null;
  const result = Object.fromEntries(COUNT_KEYS.map((k) => [k, value[k]]));
  if (result.cached_input_tokens > result.input_tokens || result.reasoning_output_tokens > result.output_tokens ||
      !Number.isSafeInteger(result.input_tokens + result.output_tokens) || result.total_tokens !== result.input_tokens + result.output_tokens) return null;
  return result;
}

function safeManifest(m) {
  if (!m || m.schemaVersion !== 1 || !SAFE_ID.test(m.agentId ?? '') || !/^\/root(?:\/[a-z0-9_]+)*$/.test(m.taskPath ?? '') ||
      !UUID.test(m.sessionUUID ?? '') || !(m.parentSessionUUID === null || UUID.test(m.parentSessionUUID ?? '')) ||
      !/^gpt-[A-Za-z0-9.-]{1,80}$/.test(m.model ?? '') || !EFFORTS.has(m.effort) || !/^[0-9a-f]{40}$/i.test(m.head ?? '') ||
      !SAFE_ID.test(m.fixture ?? '') || !PHASES.has(m.phase) || !validTime(m.startedAt) || !validTime(m.endedAt) ||
      Date.parse(m.endedAt) < Date.parse(m.startedAt)) return null;
  return Object.fromEntries(['schemaVersion', 'agentId', 'taskPath', 'sessionUUID', 'parentSessionUUID', 'model', 'effort', 'head', 'fixture', 'phase', 'startedAt', 'endedAt'].map((k) => [k, m[k]]));
}

/** Read one explicitly supplied local session or stream; never discover sessions or export raw records. */
export async function importNativeUsage({ manifest, sessionFile, stream } = {}) {
  const identity = safeManifest(manifest);
  const reasons = new Set();
  const reject = (code) => reasons.add(code);
  if (!identity) reject('invalid_manifest');
  const completion = manifest?.completionObserved;
  if (completion?.completed !== true || !['native-agent-final', 'native-thread-final'].includes(completion?.source) ||
      !validTime(completion?.observedAt) || (identity && Date.parse(completion.observedAt) < Date.parse(identity.endedAt))) reject('completion_not_proven');
  if (manifest?.freshSession !== true || manifest?.historyMode !== 'none' || manifest?.phaseCount !== 1) reject('fresh_single_phase_not_proven');
  const baseline = counts(manifest?.baseline?.counts);
  const terminal = counts(manifest?.terminal?.counts);
  if (!baseline || !sameCounts(baseline, zeroCounts()) || !validTime(manifest?.baseline?.timestamp)) reject('fresh_baseline_not_proven');
  if (!terminal || !validTime(manifest?.terminal?.timestamp)) reject('terminal_checkpoint_missing');
  if (manifest?.cutoffTimestamp !== undefined && manifest.cutoffTimestamp !== manifest?.terminal?.timestamp) reject('invalid_trusted_cutoff');
  if ((sessionFile === undefined) === (stream === undefined)) reject('explicit_single_source_required');
  if (reasons.size) return blocked();

  let session = null, contexts = 0, previous = baseline, previousTime = null, terminalMatched = false;
  let uniqueSnapshots = 0, duplicateSnapshots = 0, records = 0;
  function blocked() {
    return { schemaVersion: 1, status: 'unavailable', attribution: 'blocked', identity, reasons: [...reasons], usage: null,
      units: 'native-token-metadata', actualApiSpend: null, subscriptionDollars: null, hardNativeSpendCap: false };
  }
  function inspect(line) {
    records += 1;
    if (records > 100000) { reject('record_limit'); return; }
    let r;
    try { r = JSON.parse(line); } catch { reject('malformed_jsonl'); return; }
    if (!r || typeof r !== 'object' || typeof r.type !== 'string') { reject('malformed_record'); return; }
    const isSession = r.type === 'session_meta', isContext = r.type === 'turn_context';
    const isUsage = r.type === 'event_msg' && r.payload?.type === 'token_count';
    if (!isSession && !isContext && !isUsage) return;
    if (!validTime(r.timestamp)) { reject('invalid_metadata_timestamp'); return; }
    const ts = Date.parse(r.timestamp);
    if (previousTime !== null && ts < previousTime) reject('metadata_time_reversed');
    previousTime = ts;
    const p = r.payload;
    if (!p || typeof p !== 'object') { reject('malformed_metadata'); return; }
    if (isSession) {
      if (session) reject('duplicate_session_identity');
      const spawn = p.source?.subagent?.thread_spawn;
      if (spawn && typeof spawn !== 'object') reject('malformed_spawn_identity');
      const parent = p.parent_thread_id ?? spawn?.parent_thread_id ?? null;
      const taskPath = p.agent_path ?? spawn?.agent_path ?? null;
      if (p.id !== identity.sessionUUID || parent !== identity.parentSessionUUID || taskPath !== identity.taskPath ||
          (spawn?.parent_thread_id !== undefined && spawn.parent_thread_id !== parent) ||
          (spawn?.agent_path !== undefined && spawn.agent_path !== taskPath)) reject('session_identity_mismatch');
      if (['forked_from_id', 'forked_from', 'fork_parent_id', 'forked_from_thread_id'].some((k) => p[k] != null) ||
          (p.source?.subagent && !spawn)) reject('fork_lineage_unproven');
      session = { id: p.id, parent_thread_id: parent, agent_path: taskPath };
      if (r.timestamp !== manifest.baseline.timestamp || ts !== Date.parse(identity.startedAt)) reject('baseline_start_mismatch');
      return;
    }
    if (!session) reject('metadata_before_identity');
    if (isContext) {
      contexts += 1;
      if (p.model !== identity.model || p.effort !== identity.effort) reject('model_effort_mismatch');
      if (ts < Date.parse(identity.startedAt) || ts > Date.parse(identity.endedAt)) reject('context_outside_phase');
      return;
    }
    if (!contexts) reject('usage_without_model_context');
    const total = counts(p.info?.total_token_usage), last = counts(p.info?.last_token_usage);
    if (!total || !last) { reject('partial_or_invalid_usage'); return; }
    if (ts < Date.parse(identity.startedAt) || ts > Date.parse(identity.endedAt)) reject('usage_outside_phase');
    if (sameCounts(total, previous)) {
      duplicateSnapshots += 1;
    } else {
      const delta = Object.fromEntries(COUNT_KEYS.map((k) => [k, total[k] - previous[k]]));
      if (COUNT_KEYS.some((k) => delta[k] < 0)) reject('counter_reset_or_negative_delta');
      if (!sameCounts(delta, last)) reject('cumulative_last_mismatch');
      if (!counts(delta)) reject('invalid_request_delta');
      previous = total;
      uniqueSnapshots += 1;
    }
    if (r.timestamp === manifest.terminal.timestamp) {
      if (!sameCounts(total, terminal)) reject('terminal_counts_mismatch');
      else terminalMatched = true;
    }
  }
  let carry = '', completeFlush = false;
  try {
    const input = stream ?? fs.createReadStream(sessionFile, { encoding: 'utf8' });
    // Explicit string streams are accepted alongside Node Readables/async iterables.
    const chunks = typeof input === 'string' ? [input] : input;
    readChunks: for await (const chunk of chunks) {
      carry += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
      let newline;
      while ((newline = carry.indexOf('\n')) !== -1) {
        const line = carry.slice(0, newline).replace(/\r$/, '');
        carry = carry.slice(newline + 1);
        if (Buffer.byteLength(line) > 4 * 1024 * 1024) { reject('line_limit'); break; }
        if (line.trim()) inspect(line);
        if (manifest.cutoffTimestamp && terminalMatched) { carry = ''; completeFlush = true; break readChunks; }
      }
      if (Buffer.byteLength(carry) > 4 * 1024 * 1024 || records > 100000 || reasons.has('line_limit')) { reject('input_limit'); break; }
    }
    completeFlush = carry.length === 0;
  } catch { reject('source_unavailable'); }
  if (!completeFlush) reject('incomplete_jsonl_flush');
  if (!session || contexts < 1 || uniqueSnapshots === 0) reject('missing_phase_metadata');
  if (!terminalMatched || !sameCounts(previous, terminal)) reject('terminal_not_reconciled');
  if (reasons.size) return blocked();
  const usage = { inputTokens: terminal.input_tokens, cachedInputTokens: terminal.cached_input_tokens,
    cacheWriteInputTokens: terminal.cache_write_input_tokens, uncachedInputTokens: terminal.input_tokens - terminal.cached_input_tokens,
    outputTokens: terminal.output_tokens, reasoningOutputTokens: terminal.reasoning_output_tokens,
    totalTokens: terminal.total_tokens, reasoningIsOutputSubset: true,
    cacheRatio: terminal.input_tokens === 0 ? null : terminal.cached_input_tokens / terminal.input_tokens };
  return { schemaVersion: 1, status: 'observed', attribution: 'single-fresh-phase', identity, usage,
    checkpoints: { baseline: { timestamp: manifest.baseline.timestamp, counts: baseline }, terminal: { timestamp: manifest.terminal.timestamp, counts: terminal } },
    completionObserved: { completed: true, source: completion.source, observedAt: completion.observedAt },
    uniqueSnapshots, duplicateSnapshots, elapsedMs: Date.parse(identity.endedAt) - Date.parse(identity.startedAt),
    units: 'native-token-metadata', actualApiSpend: null, subscriptionDollars: null, hardNativeSpendCap: false };
}

/** Aggregation requires explicit disjoint-session proof; parent/child and duplicate sessions never sum. */
export function aggregateNativeUsage(receipts, { independenceEvidence } = {}) {
  const unavailable = (reason) => ({ schemaVersion: 1, status: 'unavailable', attribution: 'blocked', reasons: [reason], usage: null });
  if (!Array.isArray(receipts) || !receipts.length || receipts.some((r) => r?.status !== 'observed' || r.attribution !== 'single-fresh-phase')) return unavailable('invalid_receipts');
  const ids = receipts.map((r) => r.identity?.sessionUUID);
  if (new Set(ids).size !== ids.length) return unavailable('duplicate_session');
  if (receipts.some((r) => ids.includes(r.identity?.parentSessionUUID))) return unavailable('parent_child_overlap');
  if (!independenceEvidence || independenceEvidence.freshNoHistory !== true || independenceEvidence.accountingDisjoint !== true ||
      !Array.isArray(independenceEvidence.sessionUUIDs) || independenceEvidence.sessionUUIDs.length !== ids.length ||
      new Set(independenceEvidence.sessionUUIDs).size !== ids.length || ids.some((id) => !independenceEvidence.sessionUUIDs.includes(id))) return unavailable('independence_not_proven');
  const keys = ['inputTokens', 'cachedInputTokens', 'cacheWriteInputTokens', 'uncachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens'];
  const usage = Object.fromEntries(keys.map((k) => [k, receipts.reduce((sum, r) => sum + r.usage?.[k], 0)]));
  if (keys.some((k) => !Number.isSafeInteger(usage[k]) || usage[k] < 0)) return unavailable('invalid_aggregate_counts');
  return { schemaVersion: 1, status: 'observed', attribution: 'explicit-disjoint-phases', sessionUUIDs: ids, usage: { ...usage, reasoningIsOutputSubset: true },
    units: 'native-token-metadata', actualApiSpend: null, subscriptionDollars: null, hardNativeSpendCap: false };
}

async function main(args) {
  if (args.length !== 4 || args[0] !== '--manifest' || args[2] !== '--session') throw new Error('invalid_cli');
  const manifest = JSON.parse(fs.readFileSync(args[1], 'utf8'));
  const result = await importNativeUsage({ manifest, sessionFile: args[3] });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.status !== 'observed') process.exitCode = 2;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(() => { process.stderr.write('Native metadata import unavailable: invalid explicit input.\n'); process.exitCode = 2; });
}
