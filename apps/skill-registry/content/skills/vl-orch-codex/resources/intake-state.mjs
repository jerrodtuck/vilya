import { createHash } from 'node:crypto';

// Pure bookkeeping. Adapters own API reads, atomic disk replacement and host output.
export const VERSION = 1;
export const IDLE_SECONDS = Object.freeze([30, 120, 120, 300, 300, 600]);
export const MAX_REVISIONS = 2048;
export function revisionOf({ issue, source, updatedAt, content }) {
  if (![issue, source, updatedAt, content].every(value => typeof value === 'string') ||
      !issue || !source || !Number.isFinite(Date.parse(updatedAt))) {
    throw new Error('Expected stable issue/source identity, update time and exact content');
  }
  const hash = createHash('sha256').update(content, 'utf8').digest('hex');
  return { issue, source, updatedAt, hash, key: JSON.stringify([issue, source, updatedAt, hash]) };
}
export function initialState() {
  return { version: VERSION, emptyChecks: 0, watermark: null, revisions: {} };
}
export function restoreState(serialized) {
  try {
    const state = JSON.parse(serialized);
    if (state.version !== VERSION || !Number.isInteger(state.emptyChecks) || state.emptyChecks < 0 ||
        state.emptyChecks > IDLE_SECONDS.length ||
        !(state.watermark === null || Number.isFinite(Date.parse(state.watermark))) ||
        !state.revisions || Array.isArray(state.revisions) || typeof state.revisions !== 'object' ||
        Object.keys(state.revisions).length > MAX_REVISIONS) throw new Error('Invalid state');
    for (const [key, entry] of Object.entries(state.revisions)) {
      if (!entry || !['pending', 'emitted', 'consumed'].includes(entry.status) ||
          !['dispatch', 'record-only'].includes(entry.mode) ||
          typeof entry.issue !== 'string' || typeof entry.source !== 'string' ||
          !Number.isFinite(Date.parse(entry.updatedAt)) || !/^[a-f0-9]{64}$/.test(entry.hash) ||
          key !== JSON.stringify([entry.issue, entry.source, entry.updatedAt, entry.hash])) throw new Error('Invalid revision');
    }
    return { state, reconcileRequired: false };
  } catch {
    return { state: initialState(), reconcileRequired: true };
  }
}
export function sinceBoundary(watermark) {
  return watermark === null ? null : new Date(Date.parse(watermark) - 1000).toISOString();
}

/** Complete normalized observations contain relevant revisions, substantive ACK keys and watermark.
 * Own ACKs and unchanged policy gates are excluded by the adapter.
 * dispatch mode requires a verified marker AND pending label; defer unpublished dispatch sources.
 * active applies only to this stream. Failure/partial results are never empty successes.
 */
export function reconcile(previous, observation) {
  const state = structuredClone(previous);
  const { ok, complete, revisions = [], acknowledgments = [], watermark = state.watermark,
    active = false, retryAfterSeconds = 0, minimumSeconds = 0 } = observation;
  const delay = seconds => Math.max(seconds, minimumSeconds, retryAfterSeconds);
  if (!ok || !complete) {
    return { state, wakes: [], dispatchCandidates: [], delaySeconds: delay(active ? 120 : IDLE_SECONDS[Math.min(state.emptyChecks, 5)]), retry: true };
  }
  for (const revision of revisions) {
    const { key, issue, source, updatedAt, hash } = revision;
    if (key !== JSON.stringify([issue, source, updatedAt, hash]) ||
        !Number.isFinite(Date.parse(updatedAt)) || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid normalized revision');
    if (!Object.hasOwn(state.revisions, key)) {
      state.revisions[key] = { issue, source, updatedAt, hash,
        mode: revision.mode === 'dispatch' ? 'dispatch' : 'record-only', status: 'pending' };
    }
  }
  // Adapter validates substantive prose and the exact durable ACK marker.
  for (const ack of acknowledgments) {
    if (ack.substantive === true && Object.hasOwn(state.revisions, ack.key)) state.revisions[ack.key].status = 'consumed';
  }
  // Retirement requires durable consumption AND explicitly closed watch obligations.
  for (const issue of observation.retiredIssues ?? []) {
    const entries = Object.entries(state.revisions).filter(([, entry]) => entry.issue === issue);
    if (entries.some(([, entry]) => entry.status !== 'consumed')) throw new Error('Cannot retire unconsumed work');
    for (const [key] of entries) delete state.revisions[key];
  }
  if (Object.keys(state.revisions).length > MAX_REVISIONS) throw new Error('State capacity reached; retain prior state and reconcile explicitly');
  const wakes = Object.entries(state.revisions).filter(([, entry]) => entry.status === 'pending').map(([key]) => key);
  const dispatchCandidates = wakes.filter(key => state.revisions[key].mode === 'dispatch');
  if (watermark !== null) {
    if (!Number.isFinite(Date.parse(watermark))) throw new Error('Invalid watermark');
    if (state.watermark === null || Date.parse(watermark) > Date.parse(state.watermark)) state.watermark = watermark;
  }
  const delaySeconds = delay(active ? 120 : wakes.length ? 30 : IDLE_SECONDS[Math.min(state.emptyChecks, 5)]);
  state.emptyChecks = wakes.length ? 0 : Math.min(state.emptyChecks + 1, IDLE_SECONDS.length);
  return { state, wakes, dispatchCandidates, delaySeconds, retry: false };
}

// Persist pending, emit bounded output, then persist emitted keys. A crash can repeat output.
export function markEmitted(previous, keys) {
  const state = structuredClone(previous);
  for (const key of keys) {
    if (state.revisions[key]?.status === 'pending') state.revisions[key].status = 'emitted';
  }
  return state;
}
