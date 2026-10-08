// Synthetic regression data only; never export as live evidence.
import { expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { acceptedRun } from './acceptance.test-data.mjs';
import { evidenceSummary } from './evidence.mjs';
import { validateSnapshot, receiptIdForRequest } from './snapshot.mjs';
import { EvaluationList } from './evaluation-view';
import { publicSnapshot } from '../../../../../scripts/evaluation/public-results.mjs';
function completedFresh() {
  const priorState = { version:2, requests:[{id:'api_behavior_1_A_planning_1',trial:'api_behavior_1_A',phase:'planning',model:'gpt-6.1-sol',effort:'medium',status:'unknown',start:1,end:null,reservation:42730,cost:null,usage:null}] };
  const s = publicSnapshot({ sourceHead:'a'.repeat(40), state:{version:3,requests:[],recovery:{campaignId:'357-screening-2',namespace:'fresh1_',carriedExposure:42730}}, priorState, priorReceipts:[{trial:'api_behavior_1_A',started:0,ended:2,accepted:false,historyComplete:false,attempts:[],environment:{controllerHead:'f8ff32bf73433e37e97c00f52dc043501cba453b'}}] });
  s.runs = ['api','native'].flatMap(environment => ['behavior','instruction','migration'].flatMap(fixture => ['A','B'].map(arm => {
    const run = acceptedRun({environment,fixture,arm});
    if(environment === 'api') {
      const ids = new Map(run.requests.map(p => [receiptIdForRequest(p.requestId), receiptIdForRequest('fresh1_'+p.requestId)]));
      for(const request of run.requests) request.requestId = 'fresh1_'+request.requestId;
      run.provenance.receiptIds = run.provenance.receiptIds.map(id => ids.get(id));
      for(const attempt of run.attempts) attempt.review.receiptId = ids.get(attempt.review.receiptId);
    }
    return run;
  })));
  s.budget.reconciledCostMicrodollars = s.runs.flatMap(r=>r.requests).reduce((sum,p)=>sum+p.costMicrodollars,0);
  s.budget.accountedExposureMicrodollars = s.budget.reconciledCostMicrodollars+42730;
  s.budget.availableCapacityMicrodollars = 25000000-s.budget.accountedExposureMicrodollars;
  return validateSnapshot(s);
}
it('validated v2 prior hold permits only a descriptive resolved fresh comparison',()=>{
  const s=completedFresh();expect(evidenceSummary(s).observedLowerCostArm).toBe('A');
  const html=renderToStaticMarkup(createElement(EvaluationList,{snapshot:s,query:{}}));
  expect(html).toContain('lower observed fresh campaign API cost');
  expect(html).toContain('Fresh campaign API cost / held / per accepted');
  expect(html).toContain('Combined historical actual cost and cost per accepted result remain unavailable');
  expect(html).toContain('original failure is excluded');
});
it('any fresh run hold, unknown overhead or unpriced overhead blocks the fresh comparison',()=>{
  for(const mutate of [s=>{s.runs[0].requests[0].status='unknown';s.runs[0].requests[0].costMicrodollars=null;},s=>s.overhead.setupRequests.push({status:'unknown',costMicrodollars:null,reservationMicrodollars:1}),s=>s.overhead.finalRequests.push({status:'complete',costMicrodollars:null,reservationMicrodollars:0}),s=>s.budget.heldReservationMicrodollars++]) {
    const s=completedFresh();mutate(s);expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
  }
});
it('inconsistent prior holds fail validation and never authorize a comparison',()=>{
  const s=completedFresh();s.priorCampaign.runs[0].requests[0].reservationMicrodollars++;
  expect(()=>validateSnapshot(s)).toThrow('Invalid evaluation snapshot');
  expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
});
it('prior hold exclusion retains native, matched pair and accepted history gates',()=>{
  for(const mutate of [s=>s.runs[0].quality.accepted=false,s=>s.runs[1].environmentEvidence.controllerHead='b'.repeat(40),s=>s.runs[6].nativePhases[0].attribution='unavailable',s=>s.runs[0].quality.attemptHistoryComplete=false]) {
    const s=completedFresh();mutate(s);expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
  }
});
it('v1 continues to require zero combined held funds',()=>{
  const s=completedFresh();s.schemaVersion=1;delete s.priorCampaign;
  expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
  s.budget.heldReservationMicrodollars=0;expect(evidenceSummary(s).observedLowerCostArm).toBe('A');
});
