import styles from './recalibration-policy.module.css';

export const RECALIBRATION_POLICY_VERSION = 'incremental-route-ladder/v1';

export type CampaignLimits = {
  name: string;
  currency: string;
  totalBudget: number;
  maxCostPerTrial: number;
  trialSlots: number;
  maxElapsedMinutes: number;
};

export type RouteEvidence = {
  taskFamily: string;
  routeScope: string;
  seat: string;
  exactModelId: string;
  workflow: string;
  standing: 'proven' | 'candidate' | 'invalidated';
  decision: 'promoted' | 'incumbent-retained' | 'inconclusive';
  ranking: {
    status: 'ranked' | 'tied' | 'unranked';
    rank: number | null;
    comparedRoutes: number;
    metric: 'total-workflow-cost-per-accepted';
    evidenceDigest: string;
  };
  acceptance: {
    accepted: number;
    sampleCount: number;
    interval: { low: number; high: number; confidence: number; method: string } | null;
  };
  totalWorkflowCostPerAccepted: {
    amount: number;
    currency: string;
    includes: Array<'failed-attempts' | 'review' | 'repair'>;
  } | null;
  elapsedMs: number | null;
  validity: {
    status: 'valid' | 'partial' | 'stale';
    fingerprint: {
      version: string;
      digest: string;
      exactModelId: string;
      exactEffort: string;
      exactSettings: Record<string, string | number | boolean | null>;
      routeScope: string;
      workflow: string;
      policyVersion: string;
      workflowProtocolVersion: string;
      runtime: string;
      nodeVersion: string;
      controllerDigest: string;
      dependenciesDigest: string;
      skillsDigest: string;
      contextMode: string;
      cacheConditions: string;
      promptsDigest: string;
      toolsDigest: string;
      fixturesDigest: string;
      seedsDigest: string;
      armOrderDigest: string;
      acceptanceRubricDigest: string;
      capabilitiesDigest: string;
      accountingVersion: string;
      pricingVersion: string;
    };
    coverage: string;
    invalidatedBy?: string[];
  };
  outcome: string;
};

export function RecalibrationPolicySummary() {
  return <section className={styles.summary} aria-labelledby="recalibration-policy-summary-title">
    <h2 id="recalibration-policy-summary-title">Incremental model recalibration</h2>
    <p>New exact models challenge the lowest relevant seat with matched, independently accepted evidence. Campaign limits stay campaign-specific, and no route changes on an inconclusive result.</p>
    <p><a href="/evaluation/policy">Read the policy and route-evidence contract</a></p>
  </section>;
}

const money = (amount: number, currency: string) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 6,
}).format(amount);

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

const requiredCostParts: Array<'failed-attempts' | 'review' | 'repair'> = ['failed-attempts', 'review', 'repair'];

const hasValidAcceptance = ({ accepted, sampleCount, interval }: RouteEvidence['acceptance']) =>
  Number.isInteger(accepted)
  && Number.isInteger(sampleCount)
  && accepted > 0
  && sampleCount > 0
  && accepted <= sampleCount
  && interval !== null
  && Number.isFinite(interval.low)
  && Number.isFinite(interval.high)
  && Number.isFinite(interval.confidence)
  && interval.low >= 0
  && interval.low <= interval.high
  && interval.high <= 1
  && interval.confidence > 0
  && interval.confidence <= 1
  && interval.method.trim().length > 0;

const hasResolvedWorkflowCost = (cost: RouteEvidence['totalWorkflowCostPerAccepted']) => cost !== null
  && Number.isFinite(cost.amount)
  && cost.amount >= 0
  && cost.currency.trim().length > 0
  && requiredCostParts.every((part) => cost.includes.includes(part));

const hasCompleteFingerprint = (route: RouteEvidence) => {
  const fingerprint = route.validity.fingerprint;
  return fingerprint.version.trim().length > 0
    && fingerprint.digest.trim().length > 0
    && fingerprint.exactModelId === route.exactModelId
    && fingerprint.exactEffort.trim().length > 0
    && Object.keys(fingerprint.exactSettings).length > 0
    && fingerprint.routeScope === route.routeScope
    && fingerprint.workflow === route.workflow
    && [
      fingerprint.policyVersion,
      fingerprint.workflowProtocolVersion,
      fingerprint.runtime,
      fingerprint.nodeVersion,
      fingerprint.controllerDigest,
      fingerprint.dependenciesDigest,
      fingerprint.skillsDigest,
      fingerprint.contextMode,
      fingerprint.cacheConditions,
      fingerprint.promptsDigest,
      fingerprint.toolsDigest,
      fingerprint.fixturesDigest,
      fingerprint.seedsDigest,
      fingerprint.armOrderDigest,
      fingerprint.acceptanceRubricDigest,
      fingerprint.capabilitiesDigest,
      fingerprint.accountingVersion,
      fingerprint.pricingVersion,
    ].every((value) => value.trim().length > 0);
};

const hasFirstPlaceRanking = ({ status, rank, comparedRoutes, metric, evidenceDigest }: RouteEvidence['ranking']) =>
  (status === 'ranked' || status === 'tied')
  && rank === 1
  && Number.isInteger(comparedRoutes)
  && comparedRoutes >= 2
  && metric === 'total-workflow-cost-per-accepted'
  && evidenceDigest.trim().length > 0;

const isCurrentProvenRoute = (route: RouteEvidence) => route.standing === 'proven'
  && route.validity.status === 'valid'
  && (route.validity.invalidatedBy?.length ?? 0) === 0
  && hasCompleteFingerprint(route)
  && route.validity.coverage.trim().length > 0
  && route.decision !== 'inconclusive'
  && hasFirstPlaceRanking(route.ranking)
  && hasValidAcceptance(route.acceptance)
  && hasResolvedWorkflowCost(route.totalWorkflowCostPerAccepted);

const elapsed = (milliseconds: number | null) => {
  if (milliseconds === null) return 'Unknown';
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

function Acceptance({ evidence }: { evidence: RouteEvidence['acceptance'] }) {
  const { accepted, sampleCount, interval } = evidence;
  return <>{accepted}/{sampleCount} accepted{interval
    ? <><br /><span className={styles.muted}>{percent(interval.low)}–{percent(interval.high)} {percent(interval.confidence)} {interval.method}</span></>
    : <><br /><span className={styles.muted}>Uncertainty unavailable</span></>}</>;
}

function Cost({ evidence }: { evidence: RouteEvidence['totalWorkflowCostPerAccepted'] }) {
  if (!evidence) return <>Unknown</>;
  if (!Number.isFinite(evidence.amount) || evidence.amount < 0 || evidence.currency.trim().length === 0) {
    return <>Unknown<br /><span className={styles.muted}>Accounting unresolved</span></>;
  }
  const complete = hasResolvedWorkflowCost(evidence);
  return <>{money(evidence.amount, evidence.currency)}<br /><span className={styles.muted}>{complete
    ? 'Includes failed attempts, review, and repair'
    : 'Accounting coverage incomplete'}</span></>;
}

export function RecalibrationPolicy({
  routes = [],
  campaignLimits = null,
}: {
  routes?: RouteEvidence[];
  campaignLimits?: CampaignLimits | null;
}) {
  return <article className={styles.policy}>
    <p><a href="/evaluation">Workflow evaluation</a></p>
    <h1>Model recalibration policy</h1>
    <p className={styles.lede}>Find the cheapest proven route for each task family without turning one campaign&apos;s limits into permanent product policy.</p>
    <p className={styles.version}>Policy {RECALIBRATION_POLICY_VERSION}</p>

    <section aria-labelledby="ladder-title">
      <h2 id="ladder-title">Incremental challenge ladder</h2>
      <ol className={styles.ladder}>
        <li><strong>Scope the route.</strong> Name the task family, workflow, required capabilities, and current seat before comparing models.</li>
        <li><strong>Start at the lowest relevant seat.</strong> A new exact model ID challenges the lowest incumbent seat that already covers that scope.</li>
        <li><strong>Run a matched challenge.</strong> Pin the same fixtures and seeds, randomize or counterbalance arm order, and keep acceptance independent of model identity.</li>
        <li><strong>Require quality first.</strong> Promote only after the challenger passes the quality gate and supplies decision evidence for total workflow cost, elapsed time, or a required capability.</li>
        <li><strong>Escalate with a reason.</strong> Challenge the next tier only when the recorded scope needs its capability or the prior result creates a specific, versioned question. A tie preserves the incumbent.</li>
        <li><strong>Keep incomplete work inconclusive.</strong> Budget, slot, or time exhaustion is not a loss and cannot promote or demote a route.</li>
      </ol>
    </section>

    <section aria-labelledby="validity-title">
      <h2 id="validity-title">Evidence validity</h2>
      <p>Each decision keeps a versioned fingerprint of the exact model, effort and settings; route, workflow, policy and workflow protocol; runtime and Node version; controller, dependencies and skills; context and cache conditions; prompts, tools, fixtures, seeds and randomized order; acceptance rubric and required capabilities; and accounting and pricing versions.</p>
      <p>When one dimension changes, invalidate only the routes whose fingerprints depend on it. Run the full matrix only for broad drift such as a shared policy or acceptance-rubric change, a controller-wide behavior change, or evidence that crosses several task families.</p>
    </section>

    <section aria-labelledby="limits-title">
      <h2 id="limits-title">Campaign limits</h2>
      {campaignLimits ? <dl className={styles.limits}>
        <div><dt>Campaign</dt><dd>{campaignLimits.name}</dd></div>
        <div><dt>Total budget</dt><dd>{money(campaignLimits.totalBudget, campaignLimits.currency)}</dd></div>
        <div><dt>Per-trial cap</dt><dd>{money(campaignLimits.maxCostPerTrial, campaignLimits.currency)}</dd></div>
        <div><dt>Trial slots</dt><dd>{campaignLimits.trialSlots}</dd></div>
        <div><dt>Time limit</dt><dd>{campaignLimits.maxElapsedMinutes} minutes</dd></div>
      </dl> : <p role="status" className={styles.notice}>No campaign configuration is loaded. Budget, per-trial, slot, and time limits belong to each campaign; this policy defines no permanent caps.</p>}
    </section>

    <section aria-labelledby="routes-title">
      <h2 id="routes-title">Route evidence by task family</h2>
      {routes.length === 0 ? <p role="status" className={styles.notice}>No sanitized route evidence has been published. No model recommendation can be made yet.</p> : <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Task family / route</th><th>Standing</th><th>Acceptance</th><th>Total workflow cost / accepted</th><th>Elapsed</th><th>Validity / coverage</th><th>Outcome</th></tr></thead>
          <tbody>{routes.map((route) => <tr key={`${route.taskFamily}:${route.routeScope}:${route.exactModelId}`}>
            <td><strong>{route.taskFamily}</strong><br />{route.routeScope}<br /><span className={styles.muted}>{route.seat} · <code>{route.exactModelId}</code> · {route.workflow}</span></td>
            <td>{isCurrentProvenRoute(route) ? 'Scoped cheapest proven route' : 'Historical or unverified evidence'}</td>
            <td><Acceptance evidence={route.acceptance} /></td>
            <td><Cost evidence={route.totalWorkflowCostPerAccepted} /></td>
            <td>{elapsed(route.elapsedMs)}</td>
            <td><strong>{route.validity.status}</strong> · {route.validity.coverage}<br /><code>{route.validity.fingerprint.version}:{route.validity.fingerprint.digest}</code>{route.validity.invalidatedBy?.length ? <><br /><span className={styles.muted}>Changed: {route.validity.invalidatedBy.join(', ')}</span></> : null}</td>
            <td><strong>{route.decision}</strong> · {route.ranking.status}{route.ranking.rank === null ? '' : ` #${route.ranking.rank}`}<br />{route.outcome}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <p className={styles.muted}>A route is proven only within its recorded scope and validity fingerprint. Cost per accepted result must include failed attempts, review, and repair.</p>
    </section>
  </article>;
}
