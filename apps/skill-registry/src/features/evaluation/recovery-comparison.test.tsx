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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  const s = publicSnapshot({ sourceHead:'a'.repeat(40), state:{version:3,requests:[],recovery:{campaignId:'357-screening-2',namespace:'fresh1_',carriedExposure:42730}}, priorState, priorReceipts:[{trial:'api_behavior_1_A',started:0,ended:2,accepted:false,historyComplete:false,attempts:[],environment:{controllerHead:'f8ff32bf73433e37e97c00f52dc043501cba453b'}}] });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  s.runs = ['api','native'].flatMap(environment => ['behavior','instruction','migration'].flatMap(fixture => ['A','B'].map(arm => {
    const run = acceptedRun({environment,fixture,arm});
    if(environment === 'api') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
      const ids = new Map(run.requests.map(p => [receiptIdForRequest(p.requestId), receiptIdForRequest('fresh1_'+p.requestId)]));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
      for(const request of run.requests) request.requestId = 'fresh1_'+request.requestId;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
      run.provenance.receiptIds = run.provenance.receiptIds.map(id => ids.get(id));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
      for(const attempt of run.attempts) attempt.review.receiptId = ids.get(attempt.review.receiptId);
    }
    return run;
  })));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  s.budget.reconciledCostMicrodollars = s.runs.flatMap(r=>r.requests).reduce((sum,p)=>sum+p.costMicrodollars,0);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  s.budget.accountedExposureMicrodollars = s.budget.reconciledCostMicrodollars+42730;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  s.budget.availableCapacityMicrodollars = 25000000-s.budget.accountedExposureMicrodollars;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  return validateSnapshot(s);
}
it('validated v2 prior hold permits only a descriptive resolved fresh comparison',()=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  const s=completedFresh();expect(evidenceSummary(s).observedLowerCostArm).toBe('A');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  const html=renderToStaticMarkup(createElement(EvaluationList,{snapshot:s,query:{}}));
  expect(html).toContain('lower observed fresh campaign API cost');
  expect(html).toContain('Fresh campaign API cost / held / per accepted');
  expect(html).toContain('Combined historical actual cost and cost per accepted result remain unavailable');
  expect(html).toContain('original failure is excluded');
});
it('any fresh run hold, unknown overhead or unpriced overhead blocks the fresh comparison',()=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  for(const mutate of [s=>{s.runs[0].requests[0].status='unknown';s.runs[0].requests[0].costMicrodollars=null;},s=>s.overhead.setupRequests.push({status:'unknown',costMicrodollars:null,reservationMicrodollars:1}),s=>s.overhead.finalRequests.push({status:'complete',costMicrodollars:null,reservationMicrodollars:0}),s=>s.budget.heldReservationMicrodollars++]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
    const s=completedFresh();mutate(s);expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
  }
});
it('inconsistent prior holds fail validation and never authorize a comparison',()=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  const s=completedFresh();s.priorCampaign.runs[0].requests[0].reservationMicrodollars++;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  expect(()=>validateSnapshot(s)).toThrow('Invalid evaluation snapshot');
  expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
});
it('prior hold exclusion retains native, matched pair and accepted history gates',()=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  for(const mutate of [s=>s.runs[0].quality.accepted=false,s=>s.runs[1].environmentEvidence.controllerHead='b'.repeat(40),s=>s.runs[6].nativePhases[0].attribution='unavailable',s=>s.runs[0].quality.attemptHistoryComplete=false]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
    const s=completedFresh();mutate(s);expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
  }
});
it('v1 continues to require zero combined held funds',()=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  const s=completedFresh();s.schemaVersion=1;delete s.priorCampaign;
  expect(evidenceSummary(s).observedLowerCostArm).toBeNull();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- #381 baseline: existing evaluation JSON/type debt; boundary validation is deferred from #381
  s.budget.heldReservationMicrodollars=0;expect(evidenceSummary(s).observedLowerCostArm).toBe('A');
});
