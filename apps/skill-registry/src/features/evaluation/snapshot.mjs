import { assertAcceptedEvidence, REQUIRED_GATE_IDS } from './acceptance.mjs';
export { REQUIRED_GATE_IDS, receiptIdForRequest } from './acceptance.mjs';
// Public evidence boundary: exact keys, controlled strings, and safe scalar values.
export const FIXTURES = {
  behavior: '3d868ea5e69a3d01e433488ea6a682574d03a697',
  instruction: 'd17eb2d9aafc692306976b9ad00ddccf30f6869c',
  migration: '012220a83d11acf5c7c316dca36490152f9a8e90',
};
export const STATUSES = ['not-started', 'running', 'accepted', 'failed', 'timed-out', 'blocked', 'incomplete'];
const enumeration = (...values) => ({ enum: values });
const nullable = (type) => ({ nullable: type });
const array = (type, max = 256) => ({ array: type, max });
const integer = { integer: true };
const numberOrNull = nullable(integer);
const code = { pattern: /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/, max: 100 };
const identifier = { pattern: /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/, max: 100 };
const receiptIdentifier = { pattern: /^receipt_[a-f0-9]{16,64}$/, max: 72 };
const digest = { pattern: /^[a-f0-9]{64}$/, max: 64 };
const head = { pattern: /^[a-f0-9]{40}$/, max: 40 };
const time = { time: true };
const optionalTime = nullable(time);
const model = enumeration('gpt-6.1-sol', 'gpt-6-astra');
const effort = enumeration('medium', 'high');
const phase = enumeration('planning', 'implementation', 'review', 'repair', 'setup-review', 'final-review', 'preparation');
const usage = nullable({ inputTokens: numberOrNull, cachedInputTokens: numberOrNull, cacheWriteInputTokens: numberOrNull,
  outputTokens: numberOrNull, reasoningOutputTokens: numberOrNull, totalTokens: numberOrNull, reasoningIsOutputSubset: enumeration(true) });
const request = { requestId: identifier, phase, model, effort, status: enumeration('pending', 'unknown', 'complete'),
  startedAt: optionalTime, endedAt: optionalTime, elapsedMs: numberOrNull,
  reservationMicrodollars: numberOrNull, costMicrodollars: numberOrNull, usage };
const native = { receiptId: receiptIdentifier, phase, model, effort, status: enumeration('observed', 'unavailable'),
  attribution: enumeration('verified', 'unavailable', 'blocked'), startedAt: optionalTime, endedAt: optionalTime,
  elapsedMs: numberOrNull, usage, reasonCodes: array(enumeration('attribution-unavailable','missing-completion','missing-terminal','mixed-phase','counter-reset','session-mismatch','fork-overlap','missing-independence'), 32), disjointnessVerified: enumeration(true, false, null) };
const review = { status: enumeration('ready', 'changes-required', 'not-run', 'unavailable'), findingCount: numberOrNull,
  model: nullable(model), effort: nullable(effort), independent: enumeration(true, false, null), receiptId: nullable(receiptIdentifier) };
const gate = { id: { pattern: /^(?:setup-sync-skills|focused|regression|oracle|sync-projects|sync-night-shift|sync-skills|tests|build|spacing)$/, max: 24 }, status: enumeration('passed', 'failed', 'timed-out', 'not-run', 'unavailable'), exitCode: nullable({ signedInteger: true }), elapsedMs: numberOrNull };
const attempt = { ordinal: integer, kind: enumeration('initial', 'repair'), defectId: nullable({ pattern: /^(?:acceptance|gates|review|defect_[a-f0-9]{16,64})$/, max: 71 }), startedAt: optionalTime,
  endedAt: optionalTime, elapsedMs: numberOrNull, outcome: enumeration('passed', 'failed', 'inconclusive'), gates: array(gate, 32), review };
const run = { runId: identifier, pairId: identifier, fixture: enumeration(...Object.keys(FIXTURES)), seed: head,
  environment: enumeration('api', 'native'), arm: enumeration('A', 'B'), orderIndex: integer, status: enumeration(...STATUSES),
  failureCode: nullable(enumeration('budget-exhausted','trial-budget-exhausted','phase-budget-exhausted','token-bound-exceeded','request-limit','no-corrective-change','invalid-output','unresolved-request','acceptance-failed','deadline-exceeded','not-run','unavailable','controller-stopped','context-too-large','sandbox-cleanup-unresolved')), startedAt: optionalTime, endedAt: optionalTime, elapsedMs: numberOrNull,
  evidenceStatus: enumeration('complete', 'partial', 'unavailable'),
  environmentEvidence: { controllerHead: nullable(head), runtime: enumeration('openai-responses', 'codex-desktop'), gateRuntime: enumeration('docker'),
    nodeVersion: nullable({ pattern: /^v?\d+\.\d+\.\d+$/, max: 32 }), imageDigest: nullable({ pattern: /^(?:sha256:)?[a-f0-9]{64}$/, max: 71 }),
    lockDigest: nullable(digest), skillsDigest: nullable(digest), contextMode: enumeration('scoped-search-replace-1'), toolsMode: enumeration('stateless-no-tools'), cacheControl: enumeration('uncontrolled'), differences: array(enumeration('api-json-edits','native-desktop-tools'), 32) },
  attempts: array(attempt, 8), requests: array(request, 64), nativePhases: array(native, 32),
  quality: { accepted: enumeration(true, false, null), requiredGateIds: array(code, 32), independentReviewRequired: enumeration(true),
    attemptHistoryComplete: enumeration(true, false), adjudicationStatus: enumeration('accepted', 'rejected', 'pending', 'unavailable') },
  provenance: { receiptIds: array(receiptIdentifier, 128), digests: array(digest, 128), exporterVersion: enumeration('1') } };
const schema = { schemaVersion: enumeration(1), generatedAt: time, campaignId: enumeration('357-screening-1'),
  issueUrl: enumeration('https://github.com/jerrodtuck/vilya/issues/357'), sourceHead: head,
  protocol: { maxTrials: enumeration(12), apiTrials: enumeration(6), nativeTrials: enumeration(6), totalMs: enumeration(5400000),
    perTrialMs: enumeration(420000), finalReserveMs: enumeration(360000), historicalReplay: enumeration(true), heldOut: enumeration(false), oracleAccessEnforced: enumeration(false) },
  budget: { currency: enumeration('USD'), totalCapMicrodollars: enumeration(25000000), trialCapMicrodollars: enumeration(2000000), overheadCapMicrodollars: enumeration(1000000),
    reconciledCostMicrodollars: numberOrNull, heldReservationMicrodollars: numberOrNull, accountedExposureMicrodollars: numberOrNull, availableCapacityMicrodollars: numberOrNull,
    pricingDate: nullable({ pattern: /^\d{4}-\d{2}-\d{2}$/, max: 10 }), countBillingInterpretation: enumeration('published-zero-count-fee', 'unavailable') },
  overhead: { setupRequests: array(request, 64), finalRequests: array(request, 64), nativePreparation: array(native, 32) }, runs: array(run, 12), limitations: array(enumeration('historical-replay','not-held-out','oracle-access-not-enforced','small-sample','cache-uncontrolled','incomplete-history','missing-native-evidence','unresolved-funds','environment-differences','pricing-unavailable','live-not-run','full-gates-unverified'), 64) };
function invalid() { throw new Error('Invalid evaluation snapshot'); }
function project(value, spec) {
  if (spec.nullable) return value === null ? null : project(value, spec.nullable);
  if (spec.enum) { if (!spec.enum.includes(value)) invalid(); return value; }
  if (spec.integer || spec.signedInteger) { if (!Number.isSafeInteger(value) || (spec.integer && value < 0)) invalid(); return value; }
  if (spec.pattern) { if (typeof value !== 'string' || value.length > spec.max || !spec.pattern.test(value)) invalid(); return value; }
  if (spec.time) { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().replace('.000Z', 'Z') !== value.replace('.000Z', 'Z')) invalid(); return value; }
  if (spec.array) { if (!Array.isArray(value) || value.length > spec.max) invalid(); return value.map((item) => project(item, spec.array)); }
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) invalid();
  const keys = Object.keys(spec);
  if (Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !Object.hasOwn(spec, key))) invalid();
  return Object.fromEntries(keys.map((key) => [key, project(value[key], spec[key])]));
}
function unique(values) { if (new Set(values).size !== values.length) invalid(); }
function chronological(item) {
  if (item.endedAt !== null && item.startedAt === null) invalid();
  if (item.startedAt !== null && item.endedAt !== null && Date.parse(item.endedAt) < Date.parse(item.startedAt)) invalid();
  if (item.elapsedMs !== null && item.startedAt !== null && item.endedAt !== null && item.elapsedMs !== Date.parse(item.endedAt) - Date.parse(item.startedAt)) invalid();
}
function usageChecks(item) {
  chronological(item);
  const u = item.usage;
  if (u === null) return;
  if (u.cachedInputTokens !== null && u.inputTokens !== null && u.cachedInputTokens > u.inputTokens) invalid();
  if (u.cacheWriteInputTokens !== null && u.inputTokens !== null && u.cacheWriteInputTokens > u.inputTokens) invalid();
  if (u.cachedInputTokens !== null && u.cacheWriteInputTokens !== null && u.inputTokens !== null && u.cachedInputTokens + u.cacheWriteInputTokens > u.inputTokens) invalid();
  if (u.reasoningOutputTokens !== null && u.outputTokens !== null && u.reasoningOutputTokens > u.outputTokens) invalid();
  if (u.inputTokens !== null && u.outputTokens !== null && u.totalTokens !== null && u.totalTokens !== u.inputTokens + u.outputTokens) invalid();
}
/** Validate and project an exact public DTO. Errors never contain input data. */
export function validateSnapshot(candidate) {
  const result = project(candidate, schema);
  const ids = []; const receipts = [];
  for (const r of result.runs) {
    chronological(r);
    if (r.seed !== FIXTURES[r.fixture] || r.orderIndex < 1 || r.orderIndex > 2) invalid();
    const repetition = r.environment === 'api' ? 1 : 2;
    const order = r.fixture === 'instruction' ? ['B', 'A'] : ['A', 'B'];
    if (r.environment === 'native') order.reverse();
    if (r.arm !== order[r.orderIndex - 1] || r.runId !== `${r.environment}_${r.fixture}_${repetition}_${r.arm}` || r.pairId !== `${r.environment}_${r.fixture}_${repetition}`) invalid();
    ids.push(r.runId);
    if (r.environmentEvidence.runtime !== (r.environment === 'api' ? 'openai-responses' : 'codex-desktop')) invalid();
    if ((r.environment === 'api' && r.nativePhases.length) || (r.environment === 'native' && r.requests.length)) invalid();
    unique(r.quality.requiredGateIds); unique(r.provenance.receiptIds); unique(r.provenance.digests);
    for (let index = 0; index < r.attempts.length; index++) {
      const a = r.attempts[index]; chronological(a);
      if (a.ordinal !== index + 1 || a.kind !== (index === 0 ? 'initial' : 'repair')) invalid();
      unique(a.gates.map((g) => g.id));
      if (a.review.model !== null && (a.review.model !== 'gpt-6.1-sol' || a.review.effort !== 'high')) invalid();
    }
    for (const p of [...r.requests, ...r.nativePhases]) {
      usageChecks(p);
      const expected = p.phase === 'planning' && r.arm === 'B' ? 'gpt-6-astra' : 'gpt-6.1-sol';
      if (p.model !== expected || p.effort !== (p.phase === 'review' || expected === 'gpt-6-astra' ? 'high' : 'medium')) invalid();
    }
    const required = REQUIRED_GATE_IDS[r.fixture];
    if (r.quality.requiredGateIds.length !== required.length || required.some((id) => !r.quality.requiredGateIds.includes(id))) invalid();
    const last = r.attempts.at(-1);
    if (r.quality.accepted === true || r.status === 'accepted') {
      if (r.status !== 'accepted' || r.quality.accepted !== true || r.quality.adjudicationStatus !== 'accepted' || !r.quality.attemptHistoryComplete || !r.quality.requiredGateIds.length || !last || last.outcome !== 'passed' || last.review.status !== 'ready' || last.review.model !== 'gpt-6.1-sol' || last.review.effort !== 'high' || last.review.independent !== true || last.review.findingCount !== 0 || !last.review.receiptId || r.endedAt === null) invalid();
      assertAcceptedEvidence(r);
      if (r.quality.requiredGateIds.some((id) => !last.gates.some((g) => g.id === id && g.status === 'passed' && g.exitCode === 0))) invalid();
    }
  }
  unique(ids);
  const requests = [...result.overhead.setupRequests, ...result.overhead.finalRequests, ...result.runs.flatMap((r) => r.requests)];
  unique(requests.map((p) => p.requestId));
  const phases = [...result.overhead.nativePreparation, ...result.runs.flatMap((r) => r.nativePhases)];
  for (const p of [...result.overhead.setupRequests, ...result.overhead.finalRequests, ...result.overhead.nativePreparation]) usageChecks(p);
  for (const p of phases) { receipts.push(p.receiptId); if (p.status === 'observed' && (p.attribution !== 'verified' || p.disjointnessVerified !== true || p.usage === null)) invalid(); }
  unique(receipts);
  const b = result.budget;
  if ([b.reconciledCostMicrodollars, b.heldReservationMicrodollars, b.accountedExposureMicrodollars, b.availableCapacityMicrodollars].every((v) => v !== null)) {
    if (b.accountedExposureMicrodollars !== b.reconciledCostMicrodollars + b.heldReservationMicrodollars || b.availableCapacityMicrodollars !== b.totalCapMicrodollars - b.accountedExposureMicrodollars) invalid();
    if (requests.some((p) => p.status === 'complete' ? p.costMicrodollars === null : p.reservationMicrodollars === null)) invalid();
    const costs = requests.reduce((n, p) => n + (p.costMicrodollars ?? 0), 0);
    const held = requests.filter((p) => p.status !== 'complete').reduce((n, p) => n + (p.reservationMicrodollars ?? 0), 0);
    if (costs !== b.reconciledCostMicrodollars || held !== b.heldReservationMicrodollars) invalid();
  }
  const exposure = (items) => items.reduce((sum, p) => sum + (p.status === 'complete' ? (p.costMicrodollars ?? 0) : (p.reservationMicrodollars ?? 0)), 0);
  if (exposure([...result.overhead.setupRequests, ...result.overhead.finalRequests]) > b.overheadCapMicrodollars) invalid();
  if (result.runs.some((r) => exposure(r.requests) > b.trialCapMicrodollars)) invalid();
  return result;
}

export function parseSnapshot(content) {
  if (content === null) return { status: 'missing', snapshot: null };
  try { return { status: 'ready', snapshot: validateSnapshot(JSON.parse(content)) }; }
  catch { return { status: 'invalid', snapshot: null }; }
}
