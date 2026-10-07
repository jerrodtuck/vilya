import {createHash} from 'node:crypto';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const WORKFLOW_PROTOCOL_V2=freeze({version:2,limits:{planBytes:5000,consultPacketBytes:6000,consultEnvelopeBytes:2000,firstPlanCapacityPolicy:"shared-json-worst-case-six-bytes-per-input-byte"},questions:{behavior:null,instruction:{questionId:'migration-review-applicability',question:'Settle applicability and affected migration gates using actual touched paths and migration configuration. Preserve existing migration gates, unrelated UI acceptance and blank-evidence ambiguity.',contract:'Verified no application database needs evidence; blank evidence never means none. Unrelated UI does not block global acceptance. Relevant changes retain installed-version artifacts, immutable history, actual runner and existing baseline/backup/restore/recovery gates; unresolved evidence blocks only affected gates. No execution authority.'},migration:{questionId:'migration-markdown-roundtrip',question:'Settle literal pipe and ordinary backslash roundtrip semantics while preserving legacy configuration.',contract:'Migration tool, command and status must preserve literal pipes, ordinary backslashes and Windows paths, inline code and links through repeated parse-generate-parse. Escaped table pipes decode as literal pipes; generation escapes table delimiters without changing ordinary backslashes. Blank clearing stays blank; legacy and non-Drizzle behavior remain. No dependency or database execution.'}},steps:['complete-plan','draft-plan','consultation','synthesis','implementation','review','repair']});
export const WORKFLOW_DIGEST=createHash('sha256').update(JSON.stringify(WORKFLOW_PROTOCOL_V2)).digest('hex');
export const workflowPlanningSteps=(fixture,arm)=>arm==='B'&&fixture!=='behavior'?['draft-plan','consultation','synthesis']:['complete-plan'];
export function expectedWorkflowProtocol(fixture,arm,seed){const question=WORKFLOW_PROTOCOL_V2.questions[fixture];return {version:2,digest:WORKFLOW_DIGEST,variant:arm==='B'?'R1':'R0',reasonCode:arm==='A'?'baseline-complete-plan':question?'declared-consequential-question':'not-applicable',questionId:arm==='B'?question?.questionId??null:null,fixture,seed};}
export function assertWorkflowEvidence(run){
 const fail=()=>{throw Error('Invalid evaluation snapshot');},protocol=run.workflowProtocol,steps=run.workflowSteps;
 if(!protocol){if(steps!==undefined)fail();return;}
 if(JSON.stringify(protocol)!==JSON.stringify(expectedWorkflowProtocol(run.fixture,run.arm,run.seed))||!Array.isArray(steps))fail();
 if(new Set(steps.map(s=>s.phaseId)).size!==steps.length)fail();
 const phases=run.environment==='api'?run.requests:run.nativePhases,planning=workflowPlanningSteps(run.fixture,run.arm),used=new Set();let repairs=0,implementation=false,previous=null;
 for(let index=0;index<steps.length;index++){const step=steps[index];if(index<planning.length){if(step.stepId!==planning[index]||step.phase!=='planning')fail();}else if(index===planning.length){if(step.stepId!=='implementation'||step.phase!=='implementation')fail();implementation=true;}else{if(!['review','repair'].includes(step.stepId)||step.phase!==step.stepId)fail();if(step.stepId==='repair'){if(++repairs>2)fail();}else if(previous?.stepId==='review')fail();}
 const model=step.stepId==='consultation'?'gpt-6-astra':'gpt-6.1-sol',effort=step.stepId==='review'||step.stepId==='consultation'?'high':'medium';if(step.model!==model||step.effort!==effort)fail();
 if(step.receiptId===null){if(step.status!=='not-dispatched'||index!==steps.length-1)fail();}else{const phase=phases.find(p=>run.environment==='api'?receiptForRequest(p.requestId)===step.receiptId:p.receiptId===step.receiptId);if(!phase||used.has(step.receiptId)||phase.phase!==step.phase||phase.model!==model||phase.effort!==effort)fail();if(step.phaseId!==(run.environment==='api'?phase.requestId:phase.phaseId))fail();used.add(step.receiptId);if(step.status!==(run.environment==='api'?phase.status:phase.status==='observed'?'complete':'unavailable'))fail();if(phase.startedAt!==null&&Date.parse(step.startedAt)>Date.parse(phase.startedAt)||phase.endedAt!==null&&(step.endedAt===null||Date.parse(step.endedAt)<Date.parse(phase.endedAt)))fail();}
 if(step.startedAt===null||Date.parse(step.startedAt)<Date.parse(run.startedAt)||run.endedAt!==null&&step.endedAt!==null&&Date.parse(step.endedAt)>Date.parse(run.endedAt))fail();
 if(previous&&previous.endedAt!==null&&(Date.parse(step.startedAt)<Date.parse(previous.endedAt)||step.handoffElapsedMs!==Date.parse(step.startedAt)-Date.parse(previous.endedAt)))fail();
 if((step.outputBytes===null)!==(step.outputDigest===null))fail();if(step.status==='complete'&&(step.endedAt===null||run.status==='accepted'&&step.outputDigest===null))fail();previous=step;
 }
 if(used.size!==phases.length)fail();
 if(run.quality.attemptHistoryComplete&&['accepted','failed'].includes(run.status))assertAttemptRoute(run,planning,fail);
 if(run.status==='accepted'){const expected=[...planning,'implementation'];for(let i=0;i<run.attempts.length;i++){if(i)expected.push('repair');if(['ready','changes-required'].includes(run.attempts[i].review.status))expected.push('review');}if(!implementation||JSON.stringify(steps.map(s=>s.stepId))!==JSON.stringify(expected)||steps.some(s=>s.status!=='complete'))fail();}
}
const receiptForRequest=id=>'receipt_'+createHash('sha256').update(JSON.stringify(id)).digest('hex').slice(0,32);
export function compatibleWorkflowRuns(a,b){if(!a||!b)return false;if(!a.workflowProtocol&&!b.workflowProtocol)return true;if(!a.workflowProtocol||!b.workflowProtocol)return false;try{assertWorkflowEvidence(a);assertWorkflowEvidence(b);}catch{return false;}return a.arm==='A'&&b.arm==='B'&&a.fixture===b.fixture&&a.seed===b.seed&&a.workflowProtocol.digest===b.workflowProtocol.digest;}

export const REQUIRED_GATE_IDS = Object.freeze({
  behavior: Object.freeze(['focused','oracle','sync-projects','sync-skills','tests','build','spacing']),
  instruction: Object.freeze(['setup-sync-skills','focused','regression','oracle','sync-projects','sync-night-shift','sync-skills','tests','build','spacing']),
  migration: Object.freeze(['focused','oracle','sync-projects','sync-night-shift','sync-skills','tests','build','spacing']),
});
function assertAttemptRoute(run,planning,fail){const steps=run.workflowSteps;let cursor=planning.length;
 if(steps.length<=cursor){if(run.attempts.length||run.status==='accepted')fail();return;}
 if(!run.attempts.length||run.attempts.length>3)fail();
 for(let i=0;i<run.attempts.length;i++){const a=run.attempts[i],step=steps[cursor++],ids=REQUIRED_GATE_IDS[run.fixture];if(a.ordinal!==i+1||a.kind!==(i?'repair':'initial')||!step||step.stepId!==(i?'repair':'implementation')||Date.parse(step.endedAt)>Date.parse(a.startedAt)||a.gates.length!==ids.length||ids.some(id=>!a.gates.some(g=>g.id===id)))fail();
 if(i){const prior=run.attempts[i-1];if(Date.parse(step.startedAt)<Date.parse(prior.endedAt)||prior.outcome==='passed')fail();}
 const passed=a.gates.every(g=>g.status==='passed');if(!passed){if(a.review.status!=='not-run'||a.outcome!=='failed')fail();}else{const review=steps[cursor++];if(!review||review.stepId!=='review'||review.receiptId!==a.review.receiptId||!['ready','changes-required'].includes(a.review.status)||a.review.independent!==true||Date.parse(review.startedAt)<Date.parse(a.startedAt)||Date.parse(review.endedAt)>Date.parse(a.endedAt))fail();if(a.review.status==='ready'&&(a.review.findingCount!==0||i!==run.attempts.length-1||run.status!=='accepted'))fail();if(a.review.status==='changes-required'&&a.outcome!=='failed')fail();}
 }
 if(cursor!==steps.length)fail();
}
