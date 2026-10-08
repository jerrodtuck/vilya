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
    fingerprintVersion: string;
    fingerprint: string;
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
  const complete = ['failed-attempts', 'review', 'repair'].every((part) => evidence.includes.includes(part as 'failed-attempts' | 'review' | 'repair'));
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
  return <main className={styles.policy}>
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
      <p>Each decision keeps a versioned fingerprint of the exact models, route scope, policy, fixtures, seeds, randomized order, acceptance rubric, controller, dependencies, tools, and capabilities.</p>
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
            <td>{route.standing === 'proven' ? 'Scoped cheapest proven route' : route.standing === 'candidate' ? 'Candidate; not proven' : 'Invalidated; not current'}</td>
            <td><Acceptance evidence={route.acceptance} /></td>
            <td><Cost evidence={route.totalWorkflowCostPerAccepted} /></td>
            <td>{elapsed(route.elapsedMs)}</td>
            <td><strong>{route.validity.status}</strong> · {route.validity.coverage}<br /><code>{route.validity.fingerprintVersion}:{route.validity.fingerprint}</code>{route.validity.invalidatedBy?.length ? <><br /><span className={styles.muted}>Changed: {route.validity.invalidatedBy.join(', ')}</span></> : null}</td>
            <td><strong>{route.decision}</strong><br />{route.outcome}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <p className={styles.muted}>A route is proven only within its recorded scope and validity fingerprint. Cost per accepted result must include failed attempts, review, and repair.</p>
    </section>
  </main>;
}
