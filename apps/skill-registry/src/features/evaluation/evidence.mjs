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
    const phaseRecords=runs.flatMap(r=>environment==='api'?r.requests:r.nativePhases??[]);const usageComplete=phaseRecords.length>0&&phaseRecords.every(p=>p.usage&&Number.isSafeInteger(p.usage.totalTokens));const totalTokens=usageComplete?phaseRecords.reduce((n,p)=>n+p.usage.totalTokens,0):null;const totalElapsedMs=runs.length>0&&runs.every(r=>Number.isSafeInteger(r.elapsedMs)&&r.elapsedMs>=0)?runs.reduce((n,r)=>n+r.elapsedMs,0):null;
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
  const priorRequests = [2,3].includes(snapshot.schemaVersion) ? [...snapshot.priorCampaign.runs.flatMap(r => r.requests), ...snapshot.priorCampaign.overhead.setupRequests, ...snapshot.priorCampaign.overhead.finalRequests] : [];
  const priorHeld = priorRequests.filter(p => p.status !== 'complete').reduce((sum, p) => sum + p.reservationMicrodollars, 0);
  const apiResolved = snapshot.budget?.heldReservationMicrodollars === priorHeld && apiRuns.every(r => r.requests.length > 0) && freshRequests.every(p => p.status === 'complete' && p.costMicrodollars !== null);
  const nativeObserved = snapshot.runs.filter((r) => r.environment === 'native').every((r) => r.nativePhases?.length > 0 && r.nativePhases.every((p) => p.status === 'observed' && p.attribution === 'verified' && p.disjointnessVerified === true));
  const aCost = populations.find((p) => p.environment === 'api' && p.arm === 'A').reconciled;
  const bCost = populations.find((p) => p.environment === 'api' && p.arm === 'B').reconciled;
  const hasV2=snapshot.runs.some(r=>r.workflowProtocol);
  const fixtureDecisions=['behavior','instruction','migration'].map(fixture=>fixtureDecision(snapshot,fixture,pairs));
  const treatments=fixtureDecisions.filter(d=>!d.control);
  const consultationTreatment=treatments.every(d=>d.concordantArm&&d.concordantArm===treatments[0].concordantArm)?treatments[0].concordantArm:null;
  const apiProvisionalSelection=null,nativeConfirmedSelection=null;
  const observedLowerCostArm = !hasV2 && screeningComplete && apiResolved && nativeObserved && aCost !== null && bCost !== null && aCost !== bCost ? (aCost < bCost ? 'A' : 'B') : null;
  return { populations, pairs, observedLowerCostArm,apiProvisionalSelection,nativeConfirmedSelection,fixtureDecisions,consultationTreatment };
}

function observedTerminal(run){if(!run?.workflowProtocol||!['accepted','failed'].includes(run.status)||run.evidenceStatus!=='complete'||!run.quality.attemptHistoryComplete||!Number.isSafeInteger(run.elapsedMs))return false;try{assertWorkflowEvidence(run);}catch{return false;}if(run.status==='accepted'&&!hasCompleteAcceptedEvidence(run))return false;const phases=run.environment==='api'?run.requests:run.nativePhases;return phases.length>0&&phases.every(p=>p.usage&&Number.isSafeInteger(p.usage.totalTokens)&&p.elapsedMs!==null&&(run.environment==='api'?p.status==='complete'&&p.costMicrodollars!==null:p.status==='observed'&&p.attribution==='verified'&&p.disjointnessVerified));}
function fixtureOutcome(snapshot,fixture,environment,pairs){const runs=snapshot.runs.filter(r=>r.fixture===fixture&&r.environment===environment),a=runs.find(r=>r.arm==='A'),b=runs.find(r=>r.arm==='B');const complete=pairs.find(p=>p.fixture===fixture&&p.environment===environment)?.complete===true&&observedTerminal(a)&&observedTerminal(b);const accepted={A:a&&a.quality.accepted!==null?hasCompleteAcceptedEvidence(a):null,B:b&&b.quality.accepted!==null?hasCompleteAcceptedEvidence(b):null};const metrics=r=>{if(!r)return null;const phases=(r.environment==='api'?r.requests:r.nativePhases)??[];return {tokens:phases.length&&phases.every(p=>p.usage&&Number.isSafeInteger(p.usage.totalTokens))?phases.reduce((n,p)=>n+p.usage.totalTokens,0):null,elapsedMs:r.elapsedMs,costMicrodollars:r.environment==='api'&&phases.length&&phases.every(p=>p.costMicrodollars!==null)?phases.reduce((n,p)=>n+p.costMicrodollars,0):null};};const resources={A:metrics(a),B:metrics(b)};let preference=null,reason='unavailable';if(complete){if(accepted.A!==accepted.B){preference=accepted.A?'A':'B';reason='acceptance';}else if(!accepted.A)reason='both-failed';else{const keys=environment==='api'?['tokens','elapsedMs','costMicrodollars']:['tokens','elapsedMs'];const dominates=(x,y)=>keys.every(k=>resources[x][k]<=resources[y][k])&&keys.some(k=>resources[x][k]<resources[y][k]);preference=dominates('A','B')?'A':dominates('B','A')?'B':null;reason=preference?'resources':'tradeoff-or-equal';}}return {complete,accepted,resources,preference,reason};}
function fixtureDecision(snapshot,fixture,pairs){const api=fixtureOutcome(snapshot,fixture,'api',pairs),native=fixtureOutcome(snapshot,fixture,'native',pairs),runs=snapshot.runs.filter(r=>r.fixture===fixture);const protocolBound=runs.length===4&&runs.every(r=>r.workflowProtocol?.digest===runs[0].workflowProtocol?.digest&&r.seed===runs[0].seed),arm=api.preference;const concordantArm=protocolBound&&api.complete&&native.complete&&arm&&native.preference===arm&&api.accepted[arm]&&native.accepted[arm]&&api.accepted.A===native.accepted.A&&api.accepted.B===native.accepted.B?arm:null;return {fixture,control:fixture==='behavior',api,native,concordantArm};}
