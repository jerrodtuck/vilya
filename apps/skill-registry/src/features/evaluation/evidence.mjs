import { hasCompleteAcceptedEvidence } from './acceptance.mjs';
import { STATUSES } from './snapshot.mjs';
export const FILTERS = { environment: ['all', 'api', 'native'], fixture: ['all', 'behavior', 'instruction', 'migration'], arm: ['all', 'A', 'B'], status: ['all', ...STATUSES] };
export function normalizeFilters(query) {
  /** @type {Record<string, string>} */
  const values = {}; let normalized = false;
  for (const [key, allowed] of Object.entries(FILTERS)) {
    const value = query[key];
    if (value === undefined) values[key] = 'all';
    else if (typeof value === 'string' && allowed.includes(value)) values[key] = value;
    else { values[key] = 'all'; normalized = true; }
  }
  return { values, normalized };
}
export function filterRuns(runs, filters) {
  return runs.filter((run) => Object.entries(filters).every(([key, value]) => value === 'all' || run[key] === value));
}
export function findRun(snapshot, id) { return snapshot.runs.find((run) => run.runId === id) ?? null; }
function distribution(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2);
  return { count: sorted.length, median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2, min: sorted[0], max: sorted.at(-1) };
}
export function evidenceSummary(snapshot) {
  const populations = ['api', 'native'].flatMap((environment) => ['A', 'B'].map((arm) => {
    const runs = snapshot.runs.filter((r) => r.environment === environment && r.arm === arm);
    const accepted = runs.filter((r) => r.quality.accepted === true).length;
    const failures = runs.filter((r) => ['failed', 'timed-out', 'blocked', 'incomplete'].includes(r.status)).length;
    const requests = runs.flatMap((r) => r.requests);
    const reconciled = requests.length > 0 && requests.every((p) => p.status !== 'complete' || p.costMicrodollars !== null) ? requests.reduce((n, p) => n + (p.costMicrodollars ?? 0), 0) : null;
    const unresolved = requests.filter((p) => p.status !== 'complete');
    const held = requests.length > 0 && unresolved.every((p) => p.reservationMicrodollars !== null) ? unresolved.reduce((n, p) => n + p.reservationMicrodollars, 0) : null;
    const resolved = requests.every((p) => p.status === 'complete' && p.costMicrodollars !== null) && runs.every((r) => !['not-started', 'running'].includes(r.status));
    return { environment, arm, count: runs.length, accepted, failures, elapsed: distribution(runs.map((r) => r.elapsedMs).filter((n) => n !== null)),
      reconciled: environment === 'api' ? reconciled : null, held: environment === 'api' ? held : null,
      costPerAccepted: environment === 'api' && accepted > 0 && resolved && held === 0 && reconciled !== null ? reconciled / accepted : null };
  }));
  const pairs = ['api', 'native'].flatMap((environment) => ['behavior', 'instruction', 'migration'].map((fixture) => {
    const runs = snapshot.runs.filter((r) => r.environment === environment && r.fixture === fixture);
    const a = runs.find((r) => r.arm === 'A'); const b = runs.find((r) => r.arm === 'B');
    const keys = ['controllerHead','imageDigest','lockDigest','skillsDigest','nodeVersion','contextMode','toolsMode'];
    const comparable = !!a && !!b && keys.every((key) => a.environmentEvidence?.[key] !== null && a.environmentEvidence?.[key] !== undefined && a.environmentEvidence[key] === b.environmentEvidence?.[key]);
    return { environment, fixture, a: a?.runId ?? null, b: b?.runId ?? null, complete: comparable && a.quality.accepted !== null && b.quality.accepted !== null && a.endedAt !== null && b.endedAt !== null };
  }));
  const screeningComplete = snapshot.runs.length === 12 && pairs.every((p) => p.complete) && snapshot.runs.every((r) => hasCompleteAcceptedEvidence(r));
  const apiRuns = snapshot.runs.filter(r => r.environment === 'api');
  const freshRequests = [...apiRuns.flatMap(r => r.requests), ...(snapshot.overhead?.setupRequests ?? []), ...(snapshot.overhead?.finalRequests ?? [])];
  const priorRequests = snapshot.schemaVersion === 2 ? [...snapshot.priorCampaign.runs.flatMap(r => r.requests), ...snapshot.priorCampaign.overhead.setupRequests, ...snapshot.priorCampaign.overhead.finalRequests] : [];
  const priorHeld = priorRequests.filter(p => p.status !== 'complete').reduce((sum, p) => sum + p.reservationMicrodollars, 0);
  const apiResolved = snapshot.budget?.heldReservationMicrodollars === priorHeld && apiRuns.every(r => r.requests.length > 0) && freshRequests.every(p => p.status === 'complete' && p.costMicrodollars !== null);
  const nativeObserved = snapshot.runs.filter((r) => r.environment === 'native').every((r) => r.nativePhases?.length > 0 && r.nativePhases.every((p) => p.status === 'observed' && p.attribution === 'verified' && p.disjointnessVerified === true));
  const aCost = populations.find((p) => p.environment === 'api' && p.arm === 'A').reconciled;
  const bCost = populations.find((p) => p.environment === 'api' && p.arm === 'B').reconciled;
  const observedLowerCostArm = screeningComplete && apiResolved && nativeObserved && aCost !== null && bCost !== null && aCost !== bCost ? (aCost < bCost ? 'A' : 'B') : null;
  return { populations, pairs, observedLowerCostArm };
}
