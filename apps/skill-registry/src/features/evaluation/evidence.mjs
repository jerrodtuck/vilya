import {compatibleWorkflowRuns,assertWorkflowEvidence} from './workflow-contract.mjs';
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
    const accepted = runs.filter((r) => r.workflowProtocol?hasCompleteAcceptedEvidence(r):r.quality.accepted===true).length;
    const failures = runs.filter((r) => ['failed', 'timed-out', 'blocked', 'incomplete'].includes(r.status)).length;
    const requests = runs.flatMap((r) => r.requests);
    const reconciled = requests.length > 0 && requests.every((p) => p.status !== 'complete' || p.costMicrodollars !== null) ? requests.reduce((n, p) => n + (p.costMicrodollars ?? 0), 0) : null;
    const unresolved = requests.filter((p) => p.status !== 'complete');
    const held = requests.length > 0 && unresolved.every((p) => p.reservationMicrodollars !== null) ? unresolved.reduce((n, p) => n + p.reservationMicrodollars, 0) : null;
    const resolved = requests.every((p) => p.status === 'complete' && p.costMicrodollars !== null) && runs.every((r) => !['not-started', 'running'].includes(r.status));
    const phaseRecords=runs.flatMap(r=>environment==='api'?r.requests:r.nativePhases??[]);const usageComplete=phaseRecords.length>0&&phaseRecords.every(p=>p.usage&&Number.isSafeInteger(p.usage.totalTokens));const totalTokens=usageComplete?phaseRecords.reduce((n,p)=>n+p.usage.totalTokens,0):null;const totalElapsedMs=runs.length>0&&runs.every(r=>r.elapsedMs!==null)?runs.reduce((n,r)=>n+r.elapsedMs,0):null;
    return { totalTokens,totalElapsedMs,environment, arm, count: runs.length, accepted, failures, elapsed: distribution(runs.map((r) => r.elapsedMs).filter((n) => n !== null)),
      reconciled: environment === 'api' ? reconciled : null, held: environment === 'api' ? held : null,
      costPerAccepted: environment === 'api' && accepted > 0 && resolved && held === 0 && reconciled !== null ? reconciled / accepted : null };
  }));
  const pairs = ['api', 'native'].flatMap((environment) => ['behavior', 'instruction', 'migration'].map((fixture) => {
    const runs = snapshot.runs.filter((r) => r.environment === environment && r.fixture === fixture);
    const a = runs.find((r) => r.arm === 'A'); const b = runs.find((r) => r.arm === 'B');
    const keys = ['controllerHead','imageDigest','lockDigest','skillsDigest','nodeVersion','contextMode','toolsMode'];
    const comparable = !!a && !!b && compatibleWorkflowRuns(a,b) && keys.every((key) => a.environmentEvidence?.[key] !== null && a.environmentEvidence?.[key] !== undefined && a.environmentEvidence[key] === b.environmentEvidence?.[key]);
    return { protocolVersion:a?.workflowProtocol?.version??1,environment, fixture, a: a?.runId ?? null, b: b?.runId ?? null, complete: comparable && a.quality.accepted !== null && b.quality.accepted !== null && a.endedAt !== null && b.endedAt !== null };
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
  const hasV2=snapshot.runs.some(r=>r.workflowProtocol);
  const completeEnvironment=environment=>{const runs=snapshot.runs.filter(r=>r.environment===environment);return runs.length===6&&pairs.filter(p=>p.environment===environment).every(p=>p.complete)&&runs.every(r=>r.workflowProtocol&&r.evidenceStatus==='complete'&&r.quality.attemptHistoryComplete&&['accepted','failed'].includes(r.status)&&r.elapsedMs!==null&&(r.status!=='accepted'||hasCompleteAcceptedEvidence(r))&&(()=>{try{assertWorkflowEvidence(r);return true;}catch{return false;}})());};
  const select=environment=>{if(!completeEnvironment(environment)||(environment==='api'?!apiResolved:!nativeObserved))return null;const a=populations.find(p=>p.environment===environment&&p.arm==='A'),b=populations.find(p=>p.environment===environment&&p.arm==='B');if(a.totalTokens===null||b.totalTokens===null||a.totalElapsedMs===null||b.totalElapsedMs===null)return null;if(a.accepted!==b.accepted)return a.accepted>b.accepted?'A':'B';if(a.accepted===0)return null;const metrics=environment==='api'?['reconciled','totalTokens','totalElapsedMs']:['totalTokens','totalElapsedMs'];if(metrics.some(k=>a[k]===null||b[k]===null))return null;const dominates=(x,y)=>metrics.every(k=>x[k]<=y[k])&&metrics.some(k=>x[k]<y[k]);return dominates(a,b)?'A':dominates(b,a)?'B':null;};
  const apiProvisionalSelection=hasV2?select('api'):null,nativeSelection=hasV2?select('native'):null,nativeConfirmedSelection=apiProvisionalSelection&&nativeSelection===apiProvisionalSelection?apiProvisionalSelection:null;
  const observedLowerCostArm = !hasV2 && screeningComplete && apiResolved && nativeObserved && aCost !== null && bCost !== null && aCost !== bCost ? (aCost < bCost ? 'A' : 'B') : null;
  return { populations, pairs, observedLowerCostArm,apiProvisionalSelection,nativeConfirmedSelection };
}
