// Synthetic test data only. Never export or write this as live results.
import { REQUIRED_GATE_IDS, receiptIdForRequest } from './acceptance.mjs';
import { FIXTURES } from './snapshot.mjs';
const timestamp = (second) => new Date(Date.UTC(2026,9,7,0,0,second)).toISOString();
export function acceptedRun({ fixture='behavior', environment='api', arm='A', repairCount=0 }={}) {
  const repetition=environment==='api'?1:2;
  const order=fixture==='instruction'?['B','A']:['A','B']; if(environment==='native')order.reverse();
  const runId=`${environment}_${fixture}_${repetition}_${arm}`;
  const phases=[];
  const phase=(name,start,end)=>{
    const requestId=`${runId}_${name}_${phases.length+1}`;
    const item={phase:name,model:name==='planning'&&arm==='B'?'gpt-6-astra':'gpt-6.1-sol',effort:name==='review'||name==='planning'&&arm==='B'?'high':'medium',startedAt:timestamp(start),endedAt:timestamp(end),elapsedMs:(end-start)*1000,usage:{inputTokens:10,cachedInputTokens:0,cacheWriteInputTokens:0,outputTokens:2,reasoningOutputTokens:1,totalTokens:12,reasoningIsOutputSubset:true}};
    const result=environment==='api'?{...item,requestId,status:'complete',reservationMicrodollars:10,costMicrodollars:arm==='A'?10:20}:{...item,receiptId:receiptIdForRequest(requestId),status:'observed',attribution:'verified',reasonCodes:[],disjointnessVerified:true};phases.push(result);return result;
  };
  phase('planning',0,1);phase('implementation',1,2);
  const attempts=[];
  for(let index=0;index<=repairCount;index++){
    const start=3+index*4;const review=phase('review',start+1,start+2);const last=index===repairCount;
    attempts.push({ordinal:index+1,kind:index?'repair':'initial',defectId:index?'acceptance':null,startedAt:timestamp(start),endedAt:timestamp(start+2),elapsedMs:2000,outcome:last?'passed':'failed',gates:REQUIRED_GATE_IDS[fixture].map(id=>({id,status:'passed',exitCode:0,elapsedMs:10})),review:{status:last?'ready':'changes-required',findingCount:last?0:1,model:'gpt-6.1-sol',effort:'high',independent:true,receiptId:environment==='api'?receiptIdForRequest(review.requestId):review.receiptId}});
    if(!last)phase('repair',start+2,start+3);
  }
  const endedAt=timestamp(5+repairCount*4);
  return {runId,pairId:`${environment}_${fixture}_${repetition}`,fixture,seed:FIXTURES[fixture],environment,arm,orderIndex:order.indexOf(arm)+1,status:'accepted',failureCode:null,startedAt:timestamp(0),endedAt,elapsedMs:Date.parse(endedAt)-Date.parse(timestamp(0)),evidenceStatus:'complete',environmentEvidence:{controllerHead:'a'.repeat(40),runtime:environment==='api'?'openai-responses':'codex-desktop',gateRuntime:'docker',nodeVersion:'22.23.3',imageDigest:'b'.repeat(64),lockDigest:'c'.repeat(64),skillsDigest:'d'.repeat(64),contextMode:'scoped-search-replace-1',toolsMode:'stateless-no-tools',cacheControl:'uncontrolled',differences:[]},attempts,requests:environment==='api'?phases:[],nativePhases:environment==='native'?phases:[],quality:{accepted:true,requiredGateIds:[...REQUIRED_GATE_IDS[fixture]],independentReviewRequired:true,attemptHistoryComplete:true,adjudicationStatus:'accepted'},provenance:{receiptIds:phases.map(p=>environment==='api'?receiptIdForRequest(p.requestId):p.receiptId),digests:['e'.repeat(64)],exporterVersion:'1'}};
}
