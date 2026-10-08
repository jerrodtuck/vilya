import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecalibrationPolicy, RecalibrationPolicySummary, RECALIBRATION_POLICY_VERSION, type RouteEvidence } from './recalibration-policy';
import ModelRecalibrationPolicyPage from '../../app/evaluation/policy/page';

const completeFingerprint: RouteEvidence['validity']['fingerprint'] = {
  version: 'evidence/v3',
  digest: 'complete-test-fingerprint',
  exactModelId: 'test-model-exact-1',
  exactEffort: 'medium',
  exactSettings: { temperature: 0, parallelTools: false },
  routeScope: 'Test scope',
  workflow: 'test-workflow',
  policyVersion: RECALIBRATION_POLICY_VERSION,
  workflowProtocolVersion: 'workflow/v2',
  runtime: 'api',
  nodeVersion: '26.4.0',
  controllerDigest: 'controller-digest',
  dependenciesDigest: 'dependencies-digest',
  skillsDigest: 'skills-digest',
  contextMode: 'fresh-no-history',
  cacheConditions: 'disabled-and-verified',
  promptsDigest: 'prompts-digest',
  toolsDigest: 'tools-digest',
  fixturesDigest: 'fixtures-digest',
  seedsDigest: 'seeds-digest',
  armOrderDigest: 'order-digest',
  acceptanceRubricDigest: 'rubric-digest',
  capabilitiesDigest: 'capabilities-digest',
  accountingVersion: 'accounting/v2',
  pricingVersion: 'pricing/2026-10-08',
};

const firstPlaceRanking: RouteEvidence['ranking'] = {
  status: 'ranked',
  rank: 1,
  comparedRoutes: 2,
  metric: 'total-workflow-cost-per-accepted',
  evidenceDigest: 'ranking-evidence-digest',
};

describe('incremental model recalibration policy', () => {
  it('publishes the ladder without inventing campaign limits or results', () => {
    const html = renderToStaticMarkup(<RecalibrationPolicy />);
    for (const rule of [
      'lowest relevant seat',
      'same fixtures and seeds',
      'randomize or counterbalance arm order',
      'acceptance independent of model identity',
      'Require quality first',
      'Challenge the next tier only',
      'A tie preserves the incumbent',
      'exhaustion is not a loss',
      'invalidate only the routes',
      'full matrix only for broad drift',
      'exact model, effort and settings',
      'workflow protocol',
      'required capabilities',
      'runtime and Node version',
      'context and cache conditions',
      'accounting and pricing versions',
    ]) expect(html).toContain(rule);
    expect(html).toContain(RECALIBRATION_POLICY_VERSION);
    expect(html).toContain('this policy defines no permanent caps');
    expect(html).toContain('No model recommendation can be made yet');
    expect(html).toContain('<article');
    expect(html).not.toContain('<main');
    expect(html).not.toContain('$25');
    expect(html).not.toContain('$2');
  });

  it('renders campaign caps only from campaign configuration', () => {
    const html = renderToStaticMarkup(<RecalibrationPolicy campaignLimits={{
      name: 'bounded-test-campaign', currency: 'USD', totalBudget: 7, maxCostPerTrial: 0.5, trialSlots: 9, maxElapsedMinutes: 45,
    }} />);
    for (const value of ['bounded-test-campaign', '$7.00', '$0.50', '>9<', '45 minutes']) expect(html).toContain(value);
    expect(html).not.toContain('this policy defines no permanent caps');
  });

  it('links the live evaluation page to the full policy', () => {
    const html = renderToStaticMarkup(<RecalibrationPolicySummary />);
    expect(html).toContain('Incremental model recalibration');
    expect(html).toContain('lowest relevant seat');
    expect(html).toContain('Campaign limits stay campaign-specific');
    expect(html).toContain('href="/evaluation/policy"');
  });

  it('renders the policy route without introducing a nested main landmark', () => {
    const html = renderToStaticMarkup(<ModelRecalibrationPolicyPage />);
    expect(html).toContain('<article');
    expect(html).not.toContain('<main');
  });

  it('shows scoped route evidence, uncertainty, full cost coverage, elapsed time, validity, and outcome', () => {
    const route: RouteEvidence = {
      taskFamily: 'Test task family', routeScope: 'Test scope', seat: 'lowest-test-seat', exactModelId: 'test-model-exact-1', workflow: 'test-workflow',
      standing: 'proven', decision: 'incumbent-retained', ranking: { ...firstPlaceRanking, status: 'tied' }, acceptance: { accepted: 8, sampleCount: 10, interval: { low: 0.49, high: 0.94, confidence: 0.95, method: 'Wilson interval' } },
      totalWorkflowCostPerAccepted: { amount: 0.123456, currency: 'USD', includes: ['failed-attempts', 'review', 'repair'] }, elapsedMs: 125000,
      validity: { status: 'valid', fingerprint: { ...completeFingerprint, digest: 'test-fingerprint' }, coverage: '10 matched fixtures' },
      outcome: 'Matched quality; incumbent kept on tie.',
    };
    const html = renderToStaticMarkup(<RecalibrationPolicy routes={[route]} />);
    for (const value of ['Test task family', 'test-model-exact-1', 'Scoped cheapest proven route', '8/10 accepted', '49.0%–94.0%', '95.0% Wilson interval', '$0.123456', 'Includes failed attempts, review, and repair', '2m 5s', 'evidence/v3:test-fingerprint', 'incumbent-retained', 'incumbent kept on tie']) expect(html).toContain(value);
  });

  it('labels missing uncertainty and accounting coverage instead of implying proof', () => {
    const route: RouteEvidence = {
      taskFamily: 'Incomplete family', routeScope: 'Candidate route', seat: 'test-seat', exactModelId: 'test-model-exact-2', workflow: 'test-workflow',
      standing: 'candidate', decision: 'inconclusive', ranking: { ...firstPlaceRanking, status: 'unranked', rank: null, evidenceDigest: '' }, acceptance: { accepted: 1, sampleCount: 2, interval: null },
      totalWorkflowCostPerAccepted: { amount: 1, currency: 'USD', includes: ['review'] }, elapsedMs: null,
      validity: { status: 'partial', fingerprint: { ...completeFingerprint, digest: 'partial-test', exactModelId: 'test-model-exact-2', routeScope: 'Candidate route' }, coverage: 'budget exhausted', invalidatedBy: ['fixture set'] },
      outcome: 'Budget exhausted; no route change.',
    };
    const html = renderToStaticMarkup(<RecalibrationPolicy routes={[route]} />);
    for (const value of ['Historical or unverified evidence', 'Uncertainty unavailable', 'Accounting coverage incomplete', 'Unknown', 'partial', 'Changed: fixture set', 'Budget exhausted; no route change']) expect(html).toContain(value);
  });

  it.each([
    ['stale evidence', { validity: { status: 'stale' as const, fingerprint: { ...completeFingerprint, digest: 'stale-test', exactModelId: 'test-model-exact-3', routeScope: 'Guarded scope' }, coverage: '10 matched fixtures' } }],
    ['an old policy fingerprint', { validity: { status: 'valid' as const, fingerprint: { ...completeFingerprint, digest: 'old-policy-test', exactModelId: 'test-model-exact-3', routeScope: 'Guarded scope', policyVersion: 'incremental-route-ladder/v0' }, coverage: '10 matched fixtures' } }],
    ['zero samples', { acceptance: { accepted: 0, sampleCount: 0, interval: null } }],
    ['unknown uncertainty', { acceptance: { accepted: 8, sampleCount: 10, interval: null } }],
    ['unknown cost', { totalWorkflowCostPerAccepted: null }],
    ['unresolved cost', { totalWorkflowCostPerAccepted: { amount: 0.2, currency: '', includes: ['failed-attempts' as const, 'review' as const, 'repair' as const] } }],
    ['inconclusive outcome', { decision: 'inconclusive' as const }],
    ['no comparison ranking', { ranking: { ...firstPlaceRanking, status: 'unranked' as const, rank: null, evidenceDigest: '' } }],
    ['a tied ranking paired with promotion', { ranking: { ...firstPlaceRanking, status: 'tied' as const } }],
  ])('does not call standing=proven evidence cheapest when it has %s', (_case, override) => {
    const route: RouteEvidence = {
      taskFamily: 'Guarded family', routeScope: 'Guarded scope', seat: 'test-seat', exactModelId: 'test-model-exact-3', workflow: 'test-workflow',
      standing: 'proven', decision: 'promoted', ranking: firstPlaceRanking, acceptance: { accepted: 8, sampleCount: 10, interval: { low: 0.49, high: 0.94, confidence: 0.95, method: 'Wilson interval' } },
      totalWorkflowCostPerAccepted: { amount: 0.2, currency: 'USD', includes: ['failed-attempts', 'review', 'repair'] }, elapsedMs: 1000,
      validity: { status: 'valid', fingerprint: { ...completeFingerprint, digest: 'guarded-test', exactModelId: 'test-model-exact-3', routeScope: 'Guarded scope' }, coverage: '10 matched fixtures' },
      outcome: 'Test outcome.',
      ...override,
    };
    const html = renderToStaticMarkup(<RecalibrationPolicy routes={[route]} />);
    expect(html).toContain('Historical or unverified evidence');
    expect(html).not.toContain('Scoped cheapest proven route');
  });
});
