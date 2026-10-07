import { createHash } from 'node:crypto';
// Immutable acceptance gates at the three fixture seeds; never supplied by a result.
export const REQUIRED_GATE_IDS = Object.freeze({
  behavior: Object.freeze(['focused','oracle','sync-projects','sync-skills','tests','build','spacing']),
  instruction: Object.freeze(['setup-sync-skills','focused','regression','oracle','sync-projects','sync-night-shift','sync-skills','tests','build','spacing']),
  migration: Object.freeze(['focused','oracle','sync-projects','sync-night-shift','sync-skills','tests','build','spacing']),
});
export const receiptIdForRequest = (id) => `receipt_${createHash('sha256').update(JSON.stringify(id)).digest('hex').slice(0,32)}`;
const fail = () => { throw new Error('Invalid evaluation snapshot'); };
const within = (item, start, end) => item.startedAt !== null && item.endedAt !== null && item.elapsedMs !== null && Date.parse(item.startedAt) >= Date.parse(start) && Date.parse(item.endedAt) <= Date.parse(end);
const completeUsage = (usage) => usage !== null && ['inputTokens','cachedInputTokens','cacheWriteInputTokens','outputTokens','reasoningOutputTokens','totalTokens'].every((key) => Number.isSafeInteger(usage[key]) && usage[key] >= 0);
export function assertAcceptedEvidence(run) {
  const gates = REQUIRED_GATE_IDS[run.fixture];
  if (!gates || !run.startedAt || !run.endedAt || run.elapsedMs === null || !run.attempts.length || !run.quality.attemptHistoryComplete) fail();
  if (run.quality.requiredGateIds.length !== gates.length || gates.some((id) => !run.quality.requiredGateIds.includes(id))) fail();
  const phases = run.environment === 'api' ? run.requests.map((p) => ({ ...p, receiptId: receiptIdForRequest(p.requestId) })) : run.nativePhases;
  if (phases.some((p) => !within(p,run.startedAt,run.endedAt) || !completeUsage(p.usage) || !run.provenance.receiptIds.includes(p.receiptId))) fail();
  if (run.environment === 'api' ? phases.some((p) => p.status !== 'complete' || p.costMicrodollars === null) : phases.some((p) => p.status !== 'observed' || p.attribution !== 'verified' || p.disjointnessVerified !== true)) fail();
  if (phases.some((p) => p.model !== (p.phase === 'planning' && run.arm === 'B' ? 'gpt-6-astra' : 'gpt-6.1-sol') || p.effort !== (p.phase === 'review' || p.phase === 'planning' && run.arm === 'B' ? 'high' : 'medium'))) fail();
  if (phases.some((p) => !['planning','implementation','repair','review'].includes(p.phase))) fail();
  const planning = phases.filter((p) => p.phase === 'planning');
  const implementation = phases.filter((p) => p.phase === 'implementation');
  const repairs = phases.filter((p) => p.phase === 'repair');
  const reviews = phases.filter((p) => p.phase === 'review');
  if (planning.length !== 1 || implementation.length !== 1 || repairs.length !== run.attempts.length - 1) fail();
  if (Date.parse(planning[0].endedAt) > Date.parse(implementation[0].startedAt) || Date.parse(implementation[0].endedAt) > Date.parse(run.attempts[0].startedAt)) fail();
  const usedReviews = new Set(); const usedRepairs = new Set();
  for (let index = 0; index < run.attempts.length; index++) {
    const attempt = run.attempts[index];
    if (!within(attempt,run.startedAt,run.endedAt)) fail();
    if (index > 0) {
      const previous = run.attempts[index - 1];
      if (previous.outcome === 'passed') fail();
      const repair = repairs.filter((p) => within(p,previous.endedAt,attempt.startedAt));
      if (repair.length !== 1 || usedRepairs.has(repair[0].receiptId)) fail();
      usedRepairs.add(repair[0].receiptId);
    }
    if (['ready','changes-required'].includes(attempt.review.status)) {
      const phase = reviews.find((p) => p.receiptId === attempt.review.receiptId);
      if (!phase || usedReviews.has(phase.receiptId) || !within(phase,attempt.startedAt,attempt.endedAt) || phase.model !== 'gpt-6.1-sol' || phase.effort !== 'high' || attempt.review.independent !== true || attempt.review.model !== phase.model || attempt.review.effort !== phase.effort) fail();
      if (gates.some((id) => !attempt.gates.some((g) => g.id === id && g.status === 'passed' && g.exitCode === 0))) fail();
      usedReviews.add(phase.receiptId);
    } else if (attempt.review.receiptId !== null) fail();
  }
  if (usedReviews.size !== reviews.length || usedRepairs.size !== repairs.length) fail();
  const last = run.attempts.at(-1);
  if (last.outcome !== 'passed' || last.review.status !== 'ready' || last.review.findingCount !== 0 || gates.some((id) => !last.gates.some((g) => g.id === id && g.status === 'passed' && g.exitCode === 0))) fail();
}
export function hasCompleteAcceptedEvidence(run) {
  if (run.status !== 'accepted' || run.quality.accepted !== true || run.quality.adjudicationStatus !== 'accepted' || run.evidenceStatus !== 'complete') return false;
  try { assertAcceptedEvidence(run); return true; } catch { return false; }
}
