import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecalibrationPolicy, RecalibrationPolicySummary, RECALIBRATION_POLICY_VERSION, type RouteEvidence } from './recalibration-policy';

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
    ]) expect(html).toContain(rule);
    expect(html).toContain(RECALIBRATION_POLICY_VERSION);
    expect(html).toContain('this policy defines no permanent caps');
    expect(html).toContain('No model recommendation can be made yet');
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

  it('shows scoped route evidence, uncertainty, full cost coverage, elapsed time, validity, and outcome', () => {
    const route: RouteEvidence = {
      taskFamily: 'Test task family', routeScope: 'Test scope', seat: 'lowest-test-seat', exactModelId: 'test-model-exact-1', workflow: 'test-workflow',
      standing: 'proven', decision: 'incumbent-retained', acceptance: { accepted: 8, sampleCount: 10, interval: { low: 0.49, high: 0.94, confidence: 0.95, method: 'Wilson interval' } },
      totalWorkflowCostPerAccepted: { amount: 0.123456, currency: 'USD', includes: ['failed-attempts', 'review', 'repair'] }, elapsedMs: 125000,
      validity: { status: 'valid', fingerprintVersion: 'evidence/v3', fingerprint: 'test-fingerprint', coverage: '10 matched fixtures' },
      outcome: 'Matched quality; incumbent kept on tie.',
    };
    const html = renderToStaticMarkup(<RecalibrationPolicy routes={[route]} />);
    for (const value of ['Test task family', 'test-model-exact-1', 'Scoped cheapest proven route', '8/10 accepted', '49.0%–94.0%', '95.0% Wilson interval', '$0.123456', 'Includes failed attempts, review, and repair', '2m 5s', 'evidence/v3:test-fingerprint', 'incumbent-retained', 'incumbent kept on tie']) expect(html).toContain(value);
  });

  it('labels missing uncertainty and accounting coverage instead of implying proof', () => {
    const route: RouteEvidence = {
      taskFamily: 'Incomplete family', routeScope: 'Candidate route', seat: 'test-seat', exactModelId: 'test-model-exact-2', workflow: 'test-workflow',
      standing: 'candidate', decision: 'inconclusive', acceptance: { accepted: 1, sampleCount: 2, interval: null },
      totalWorkflowCostPerAccepted: { amount: 1, currency: 'USD', includes: ['review'] }, elapsedMs: null,
      validity: { status: 'partial', fingerprintVersion: 'evidence/v3', fingerprint: 'partial-test', coverage: 'budget exhausted', invalidatedBy: ['fixture set'] },
      outcome: 'Budget exhausted; no route change.',
    };
    const html = renderToStaticMarkup(<RecalibrationPolicy routes={[route]} />);
    for (const value of ['Candidate; not proven', 'Uncertainty unavailable', 'Accounting coverage incomplete', 'Unknown', 'partial', 'Changed: fixture set', 'Budget exhausted; no route change']) expect(html).toContain(value);
  });
});
