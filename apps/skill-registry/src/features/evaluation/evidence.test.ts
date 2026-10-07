import { describe, expect, it } from 'vitest';
import { evidenceSummary, filterRuns, findRun, normalizeFilters } from './evidence.mjs';
describe('evaluation evidence',()=>{
  it('normalizes repeated and invalid filters and preserves valid GET filters',()=>{const result=normalizeFilters({environment:['api','native'],fixture:'wrong',arm:'B',status:'blocked'});expect(result.normalized).toBe(true);expect(result.values).toEqual({environment:'all',fixture:'all',arm:'B',status:'blocked'});});
  it('filters without changing the downloaded population; unknown trial is absent',()=>{const runs=[{runId:'one',environment:'api',arm:'A'},{runId:'two',environment:'native',arm:'B'}];expect(filterRuns(runs,{environment:'api',arm:'all'})).toEqual([runs[0]]);expect(runs).toHaveLength(2);expect(findRun({runs},'unknown')).toBeNull();});
  it('keeps failed attempt costs, held funds, zero accepted and native separate',()=>{
    const runs=[{runId:'api_behavior_1_A',environment:'api',fixture:'behavior',arm:'A',status:'failed',elapsedMs:100,endedAt:'end',quality:{accepted:false},requests:[{status:'complete',costMicrodollars:20,reservationMicrodollars:20},{status:'unknown',costMicrodollars:null,reservationMicrodollars:30}]},{runId:'native_behavior_2_A',environment:'native',fixture:'behavior',arm:'A',status:'accepted',elapsedMs:null,endedAt:'end',quality:{accepted:true},requests:[]}];
    const summary=evidenceSummary({runs});expect(summary.populations[0]).toMatchObject({count:1,accepted:0,failures:1,reconciled:20,held:30,costPerAccepted:null});expect(summary.populations[2]).toMatchObject({accepted:1,reconciled:null,costPerAccepted:null,elapsed:null});expect(summary.pairs[0].complete).toBe(false);
  });
});
describe('model selection screening threshold',()=>{
  it('describes these fixtures only after accepted complete pairs and native attribution',()=>{
    const runs=['api','native'].flatMap(environment=>['behavior','instruction','migration'].flatMap(fixture=>['A','B'].map(arm=>({runId:`${environment}_${fixture}_${arm}`,environment,fixture,arm,status:'accepted',elapsedMs:100,endedAt:'end',quality:{accepted:true},evidenceStatus:'complete',requests:environment==='api'?[{status:'complete',costMicrodollars:arm==='A'?10:20,reservationMicrodollars:20}]:[],nativePhases:environment==='native'?[{status:'observed',attribution:'verified',disjointnessVerified:true}]:[]}))));
    const snapshot={runs,budget:{heldReservationMicrodollars:0}};expect(evidenceSummary(snapshot).observedLowerCostArm).toBe('A');runs[0].quality.accepted=false;expect(evidenceSummary(snapshot).observedLowerCostArm).toBeNull();runs[0].quality.accepted=true;snapshot.budget.heldReservationMicrodollars=1;expect(evidenceSummary(snapshot).observedLowerCostArm).toBeNull();
  });
});
it('does not present absent API receipts as zero-cost evidence',()=>{const summary=evidenceSummary({runs:[{environment:'api',arm:'A',fixture:'behavior',status:'not-started',quality:{accepted:null},elapsedMs:null,requests:[]}]});expect(summary.populations[0]).toMatchObject({reconciled:null,held:null,costPerAccepted:null});});
