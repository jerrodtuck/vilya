import Link from 'next/link';
import { evidenceSummary, FILTERS, filterRuns, normalizeFilters } from './evidence.mjs';
import type { Run, Snapshot, Usage } from './types';
import styles from './evaluation.module.css';
const money = (n: number | null) => n === null ? 'Unavailable' : `$${(n / 1000000).toFixed(4)}`;
const duration = (n: number | null) => n === null ? 'Unavailable' : `${(n / 1000).toFixed(1)} s`;
function EvaluationMethod() {
  return <>
    <h2>Approved limits</h2>
    <p>Up to 12 trials: six API and six native. Total trial time: 90 minutes; each trial: 7 minutes. API budget: $25 total, $2 per API trial, and $1 shared setup/final overhead.</p>
    <h2>Workflows and method</h2>
    <p>A uses Sol/medium planning; B uses Astra/high planning. Both use Sol/medium implementation and repairs, then a separate Sol/high review with the same acceptance gates.</p>
    <p>The API pairs test a cost and accepted-quality hypothesis. Native Codex pairs then check that hypothesis on the same fixtures. Repeated native confirmation is required before recommending a production model change.</p>
    <p>Native output-token limits are checked after completion; the exposed agent tool cannot cap output before generation. Native no-tools is an instruction while tools remain available. These historical fixtures include writable copied dependencies, tests and oracle checks. This screening provides no adversarial holdout guarantee.</p>
  </>;
}
export function NoResults({ invalid = false }: { invalid?: boolean }) {
  return <section className={styles.evaluation}><h1>Workflow evaluation</h1><EvaluationMethod /><p role="status" className={styles.notice}>{invalid ? 'The results snapshot could not be validated. Results are temporarily unavailable.' : 'No results have been exported yet. Completed trials will appear after an evidence snapshot is exported.'}</p><p><Link href="/evaluation">Refresh results</Link></p></section>;
}
function UsageView({ usage }: { usage: Usage | null }) {
  return usage === null ? <span>Usage unavailable</span> : <span>Input {usage.inputTokens ?? 'unknown'}; cached {usage.cachedInputTokens ?? 'unknown'}; cache write {usage.cacheWriteInputTokens ?? 'unknown'}; output {usage.outputTokens ?? 'unknown'}; reasoning {usage.reasoningOutputTokens ?? 'unknown'} (included in output)</span>;
}
function PriorCampaignView({ prior }: { prior: NonNullable<Snapshot['priorCampaign']> }) {
  return <>
    <h2>Prior campaign failure</h2>
    <p>Campaign {prior.campaignId} stopped after one failed API behavior trial. Its attempt history is incomplete. This original failure is excluded from the 12 fresh scheduled trials and their comparisons. Combined historical actual cost and cost per accepted result remain unavailable while its charge is unknown.</p>
    {prior.runs.map(run => <article key={run.runId} className={styles.card}>
      <h3>{run.runId} · {run.status}</h3>
      <p>Controller <span className={styles.codes}>{run.environmentEvidence.controllerHead}</span>; evidence {run.evidenceStatus}; attempts {run.attempts.length}; accepted {String(run.quality.accepted)}.</p>
      {run.requests.map(request => <p key={request.requestId}>Prior request {request.status}; actual cost {money(request.costMicrodollars)}; held reservation {money(request.reservationMicrodollars)}. <UsageView usage={request.usage} /></p>)}
    </article>)}
    {prior.overhead.nativePreparation.length > 0 && <>
      <h3>Prior native preparation</h3><p>These preparation receipts stay outside fresh trial populations. They have no dollar value.</p>
      {prior.overhead.nativePreparation.map(p => <article key={p.receiptId} className={styles.card}>
        <h4>{p.phase} · {p.model} / {p.effort}</h4><p>{p.status}; attribution {p.attribution}; elapsed {duration(p.elapsedMs)}.</p>
        <UsageView usage={p.usage} /><p className={styles.codes}>{p.receiptId}</p>
      </article>)}
    </>}
    <p role="status">The prior provider result remains unknown. Its $0.042730 reservation is included once in combined accounting. Fresh dispatch requires the separate recovery authorization and keeps this hold reserved.</p>
  </>;
}
export function EvaluationList({ snapshot, query }: { snapshot: Snapshot; query: Record<string, string | string[] | undefined> }) {
  const filters = normalizeFilters(query); const runs: Run[] = filterRuns(snapshot.runs, filters.values);
  const summary = evidenceSummary(snapshot);
  const prior = snapshot.priorCampaign;
  const unresolvedProviderRequests = [...snapshot.overhead.setupRequests, ...snapshot.overhead.finalRequests, ...snapshot.runs.flatMap((run) => run.requests)].some((request) => request.status === 'pending' || request.status === 'unknown');
  return <section className={styles.evaluation}>
    <h1>Workflow evaluation</h1><EvaluationMethod />
    <p className={styles.muted}>Snapshot {snapshot.generatedAt} · <Link href="/evaluation">Refresh results</Link> · <a href="/evaluation/data.json" download>Download all sanitized results</a></p>
    <p className={styles.notice}>Historical screening: up to 12 trials, six API and six native. These tasks are not held out, and oracle access is not enforced. One screen does not establish universal model quality or cache causality.</p>
    <form method="get" action="/evaluation" className={styles.filters}>
      {Object.entries(FILTERS).map(([key, values]) => <label key={key}>{key[0].toUpperCase() + key.slice(1)}<select name={key} defaultValue={filters.values[key]}>{values.map((value: string) => <option key={value} value={value}>{value}</option>)}</select></label>)}
      <button type="submit">Apply filters</button>
    </form>
    {filters.normalized && <p role="status">Repeated or invalid filter values were reset to all.</p>}
    {prior && <><PriorCampaignView prior={prior} /><h2>Fresh campaign {snapshot.campaignId}</h2></>}
    {unresolvedProviderRequests && <p role="status" className={styles.notice}>A provider request is pending or its result is unknown. Paid dispatch is held while it is reconciled. Reconciled API cost excludes any unknown charge; its reservation remains held.</p>}
    <h2>{prior ? 'Combined budget and unresolved funds' : 'Budget and unresolved funds'}</h2><div className={styles.cards}>
      <div className={styles.card}><h3>Reconciled API cost</h3>{money(snapshot.budget.reconciledCostMicrodollars)}<p>Includes setup, failures, repairs and review{prior ? ' across prior and fresh campaigns' : ''}.</p></div>
      <div className={styles.card}><h3>Held reservations</h3>{money(snapshot.budget.heldReservationMicrodollars)}<p>Unresolved requests remain reserved.</p></div>
      <div className={styles.card}><h3>Available capacity</h3>{money(snapshot.budget.availableCapacityMicrodollars)}<p>Cap {money(snapshot.budget.totalCapMicrodollars)}; shared overhead cap {money(snapshot.budget.overheadCapMicrodollars)}.</p></div>
    </div>
    <h2>Native preparation and orchestration usage</h2>
    {snapshot.overhead.nativePreparation.length === 0 ? <p>Native preparation usage has not been imported; it is unavailable, not zero. Trial totals do not include orchestration/setup allowance.</p> : <><p>These preparation and orchestration receipts are separate from trial populations. They have no dollar value and are excluded from trial totals.</p>{snapshot.overhead.nativePreparation.map((p) => <article key={p.receiptId} className={styles.card}><h3>{p.phase} · {p.model} / {p.effort}</h3><p>{p.status}; attribution {p.attribution}; elapsed {duration(p.elapsedMs)}.</p><UsageView usage={p.usage} /><p className={styles.codes}>{p.receiptId}</p>{p.reasonCodes.length > 0 && <p>{p.reasonCodes.join(', ')}</p>}</article>)}</>}
    <h2>Evidence and model selection</h2><p>{summary.observedLowerCostArm ? `Workflow ${summary.observedLowerCostArm} had lower observed ${prior ? 'fresh campaign ' : ''}API cost with equal accepted quality, and native trials confirmed accepted quality for these three fixtures. This descriptive result supports further replication; it does not establish a universal winner or change production routing.` : 'Insufficient evidence for a production recommendation. Missing, unresolved or discordant pairs retain the current baseline. Repeated native comparisons must confirm any API hypothesis at the same acceptance standard.'}</p>
    <p>API and native populations remain separate. Native usage is token evidence, with no subscription dollar value or API equivalent bill. Timing ranges below include all runs with observed elapsed time; cost per accepted result is unavailable when no result is accepted or funds remain unresolved.</p>
    <div className={styles.tableWrap}><table><caption>{prior ? 'Fresh campaign runs, independent of active filters; prior failure excluded' : 'All exported runs, independent of active filters'}</caption><thead><tr><th>Environment / arm</th><th>Scheduled / accepted / failures</th><th>Elapsed median (range), observed n</th><th>{prior ? 'Fresh campaign API cost / held / per accepted' : 'API cost / held / per accepted'}</th></tr></thead><tbody>{summary.populations.map((p: { environment: string; arm: string; count: number; accepted: number; failures: number; elapsed: { median: number; min: number; max: number; count: number } | null; reconciled: number | null; held: number | null; costPerAccepted: number | null }) => <tr key={`${p.environment}_${p.arm}`}><td>{p.environment} / {p.arm}</td><td>{p.count} / {p.accepted} / {p.failures}</td><td>{p.elapsed ? `${duration(p.elapsed.median)} (${duration(p.elapsed.min)}–${duration(p.elapsed.max)}), n=${p.elapsed.count}` : 'Unavailable'}</td><td>{p.environment === 'native' ? 'Not priced' : `${money(p.reconciled)} / ${money(p.held)} / ${money(p.costPerAccepted)}`}</td></tr>)}</tbody></table></div>
    <ul>{summary.pairs.map((p: { environment: string; fixture: string; a: string | null; b: string | null; complete: boolean }) => <li key={`${p.environment}_${p.fixture}`}>{p.environment} / {p.fixture}: {p.a ? <Link href={`/evaluation/${p.a}`}>A evidence</Link> : 'A missing'} · {p.b ? <Link href={`/evaluation/${p.b}`}>B evidence</Link> : 'B missing'} · {p.complete ? 'Both terminal results present' : 'Incomplete pair'}</li>)}</ul>
    <h2>{prior ? 'Fresh trials' : 'Trials'} ({runs.length} shown)</h2>{runs.length === 0 && <p role="status">No trials match these filters.</p>}
    <div className={styles.tableWrap}><table><thead><tr><th>Trial</th><th>Environment / arm</th><th>Status / evidence</th><th>Elapsed</th><th>Attempts</th></tr></thead><tbody>{runs.map((r) => <tr key={r.runId}><td><Link href={`/evaluation/${r.runId}`}>{r.fixture} · {r.runId}</Link></td><td>{r.environment} / {r.arm}</td><td>{r.status} / {r.evidenceStatus}</td><td>{duration(r.elapsedMs)}</td><td>{r.attempts.length}</td></tr>)}</tbody></table></div>
    <h2>Limitations and provenance</h2><p className={styles.codes}>Source {snapshot.sourceHead}</p><p>Pricing date: {snapshot.budget.pricingDate ?? 'unavailable'}; count billing interpretation: {snapshot.budget.countBillingInterpretation}. Published zero count fee is an interpretation, not a free billing warranty.</p><ul>{snapshot.limitations.map((code) => <li key={code}>{code.replaceAll('-', ' ').replaceAll('_', ' ')}</li>)}</ul><p><a href={snapshot.issueUrl}>Issue 357 protocol and decisions</a></p>
  </section>;
}
export function TrialDetail({ run, generatedAt }: { run: Run; generatedAt: string }) {
  const e = run.environmentEvidence;
  return <section className={styles.evaluation}><p><Link href="/evaluation">All evaluation results</Link></p><h1>{run.fixture} · {run.arm}</h1><p className={styles.codes}>{run.runId}</p><p>Status {run.status}; evidence {run.evidenceStatus}; adjudication {run.quality.adjudicationStatus}; elapsed {duration(run.elapsedMs)}.</p><p>Snapshot {generatedAt} · <Link href={`/evaluation/${run.runId}`}>Refresh trial</Link></p><p>Failure code: {run.failureCode ?? 'None recorded'}. Accepted: {run.quality.accepted === null ? 'Unadjudicated' : String(run.quality.accepted)}. Attempt history {run.quality.attemptHistoryComplete ? 'complete' : 'incomplete'}.</p>
    <h2>Attempt history</h2>{run.attempts.length === 0 && <p>No attempts recorded.</p>}{run.attempts.map((a) => <article key={a.ordinal} className={styles.card}><h3>Attempt {a.ordinal} · {a.kind} · {a.outcome}</h3><p>Defect {a.defectId ?? 'unavailable'}; elapsed {duration(a.elapsedMs)}.</p><ul>{a.gates.map((g) => <li key={g.id}>{g.id}: {g.status}; exit {g.exitCode ?? 'unknown'}; {duration(g.elapsedMs)}</li>)}</ul><p>Review {a.review.status}; findings {a.review.findingCount ?? 'unknown'}; independent {a.review.independent === null ? 'unknown' : String(a.review.independent)}; {a.review.model ?? 'unknown model'} / {a.review.effort ?? 'unknown effort'}.</p></article>)}
    <h2>Observed model and usage receipts</h2>{run.requests.map((p) => <article className={styles.card} key={p.requestId}><h3>{p.phase} · {p.model} / {p.effort}</h3><p>{p.status}; {duration(p.elapsedMs)}; cost {money(p.costMicrodollars)}; reservation {money(p.reservationMicrodollars)}</p><UsageView usage={p.usage} /></article>)}{run.nativePhases.map((p) => <article className={styles.card} key={p.receiptId}><h3>{p.phase} · {p.model} / {p.effort}</h3><p>{p.status}; attribution {p.attribution}; {duration(p.elapsedMs)}; disjointness {String(p.disjointnessVerified)}.</p><UsageView usage={p.usage} /><p>{p.reasonCodes.join(', ')}</p></article>)}
    <h2>Environment and provenance</h2><p>{e.runtime}; gates {e.gateRuntime}; Node {e.nodeVersion ?? 'unknown'}; context {e.contextMode}; tools {e.toolsMode}; cache {e.cacheControl}.</p><p className={styles.codes}>Controller {e.controllerHead ?? 'unknown'}<br />Image {e.imageDigest ?? 'unknown'}<br />Lock {e.lockDigest ?? 'unknown'}<br />Skills {e.skillsDigest ?? 'unknown'}<br />Seed {run.seed}</p><p>Differences: {e.differences.join(', ') || 'None recorded'}</p><p>Required gates: {run.quality.requiredGateIds.join(', ') || 'Unavailable'}. Independent review required.</p><p className={styles.codes}>Receipts: {run.provenance.receiptIds.join(', ') || 'Unavailable'}<br />Digests: {run.provenance.digests.join(', ') || 'Unavailable'}</p>
  </section>;
}
