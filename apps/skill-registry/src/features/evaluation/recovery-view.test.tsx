// Synthetic rendering data only. Never write this as live results.
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EvaluationList } from './evaluation-view';
import { publicSnapshot } from '../../../../../scripts/evaluation/public-results.mjs';
describe('recovery results presentation', () => {
  it('shows original failure before twelve fresh trials with combined accounting and no recommendation', () => {
    const priorState = { version: 2, requests: [{ id: 'api_behavior_1_A_planning_1', trial: 'api_behavior_1_A', phase: 'planning', model: 'gpt-6.1-sol', effort: 'medium', status: 'unknown', start: 1, end: null, reservation: 42730, cost: null, usage: null }] };
    const snapshot = publicSnapshot({ sourceHead: 'a'.repeat(40), state: { version: 3, requests: [], recovery: { campaignId: '357-screening-2', namespace: 'fresh1_', carriedExposure: 42730 } }, priorState, priorReceipts: [{ trial: 'api_behavior_1_A', started: 0, ended: 2, accepted: false, historyComplete: false, attempts: [], environment: { controllerHead: 'f8ff32bf73433e37e97c00f52dc043501cba453b' } }] });
    const html = renderToStaticMarkup(createElement(EvaluationList, { snapshot, query: {} }));
    expect(html).toContain('Prior campaign failure');
    expect(html.indexOf('Prior campaign failure')).toBeLessThan(html.indexOf('Fresh campaign 357-screening-2'));
    expect(html).toContain('actual cost Unavailable');
    expect(html).toContain('Usage unavailable');
    expect(html).toContain('$0.042730');
    expect(html).toContain('Combined budget and unresolved funds');
    expect(html).toContain('Fresh trials (12 shown)');
    expect(html).toContain('Insufficient evidence for a production recommendation');
    expect(html).toContain('prior failure excluded');
    expect(html).toContain('Download all sanitized results');
  });
});
