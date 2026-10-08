import fs from 'node:fs';
import path from 'node:path';
import {COMPARISON_POLICY as P} from './comparison-campaign.mjs';
import {comparisonRead,comparisonPublish,comparisonHash,comparisonSafe,comparisonSummary,comparisonPhaseDeadline} from './comparison-ledger.mjs';
import {loadFixtures,archiveFixture,phasePacket,acceptance,context} from './workflow.mjs';
import {scopedContext,applyEdits} from './context.mjs';
import {planningSteps,buildPlanningStepPacket,validatePlanningStepOutput,protocolDescriptor,REQUIRED_GATE_IDS} from './workflow-protocol.mjs';
import {generate} from './generation.mjs';
import {aggregateNativeUsage} from './native-usage.mjs';
import {verifyComparisonNativeSession} from './comparison-native-evidence.mjs';
import {actualCost,maximumCost} from './money.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const hashes=(root,manifest)=>context(root,manifest).map(({path,sha256})=>({path,sha256}));
const settings=step=>({model:step==='consultation'?'gpt-6-astra':'gpt-6.1-sol',effort:['consultation','review'].includes(step)?'high':'medium',maxOutputTokens:['implementation','repair'].includes(step)?8000:4000});
export function comparisonPacket(flow,manifest){const step=flow.phase==='planning'?flow.planningSteps[flow.cursor]:flow.phase;const payload=flow.phase==='planning'?buildPlanningStepPacket(step,manifest,flow.baseline,{draft:flow.draft,answer:flow.answer}):phasePacket({phase:flow.phase,manifest,baseline:flow.baseline,fullBaseline:flow.fullBaseline,fullCurrent:context(flow.root,manifest),current:scopedContext(flow.root,manifest),plan:flow.plan,gates:flow.gates,review:flow.review});return {id:flow.trial+'_'+step+'_'+(flow.steps.length+1),trial:flow.trial,phase:flow.phase,step,...settings(step),payload,sourceHashes:hashes(flow.root,manifest)};}
function verifyReceipts(ledger,s){for(const trial of s.trials.filter(t=>t.status==='complete')){const raw=comparisonRead(path.join(ledger.workspace,trial.id+'.receipt.json'));if(comparisonHash(raw)!==trial.receiptDigest)throw Error('Completed receipt changed; no resume');const r=JSON.parse(raw);if(r.trial!==trial.id||r.bindingDigest!==comparisonHash(ledger.bound)||r.status!=='complete'||r.accepted!==trial.accepted||!r.steps.length||r.steps.some(step=>step.status!=='complete'))throw Error('Invalid completed receipt');}}
export function completedComparisonStatus(ledger){const s=ledger.read();if(s.status!=='complete')return null;verifyReceipts(ledger,s);return comparisonSummary(s);}
function setupTrial(ledger,repo,images){const s=ledger.read();ledger.ready(s);verifyReceipts(ledger,s);if(s.workflow)throw Error('Unfinished trial already exists');const item=P.trials[s.trials.length];if(!item)return false;if(s.executionWindow&&ledger.clock()>=s.executionWindow.dispatchDeadline)throw Error('Comparison dispatch deadline');if(item.environment==='native'&&(!s.contract4Confirmed||s.trials.slice(0,6).some(t=>t.status!=='complete')))throw Error('Native transfer lacks API proof');const manifest=loadFixtures().find(m=>m.name===item.task),root=path.join(ledger.workspace,item.id),image=images[item.task];if(!image||image.seed!==manifest.seed||!/^sha256:[a-f0-9]{64}$/.test(image.image)||!/^vilya357-deps-[a-f0-9]{64}$/.test(image.volume))throw Error('Pinned sandbox required');
 ledger.transaction((s,now)=>{s.trials.push({id:item.id,environment:item.environment,started:now,ended:null,status:'active',accepted:null,receiptDigest:null});s.workflow={trial:item.id,phase:'preparation',pending:{kind:'archive'},root};});archiveFixture(repo,root,manifest.seed);const baseline=scopedContext(root,manifest);const fullBaseline=context(root,manifest);ledger.transaction((s,now)=>{s.workflow={trial:item.id,fixture:manifest.name,arm:item.arm,seed:manifest.seed,root,phase:'planning',phaseStarted:now,planningSteps:planningSteps(manifest,item.arm),cursor:0,draft:null,answer:null,plan:'',baseline,fullBaseline,sourceHashes:hashes(root,manifest),gates:[],review:null,attempts:[],steps:[],repairs:0,accepted:false,failure:null,pending:null,sandbox:{allowedRoot:ledger.workspace,image:image.image,volume:image.volume,nodeVersion:image.nodeVersion,lockSha256:image.lockSha256},protocol:protocolDescriptor(manifest,item.arm)};});return true;}
function finish(ledger){ledger.transaction((s,now)=>{
 const f=s.workflow,t=s.trials.at(-1);
 if(!s.executionWindow||now>=s.executionWindow.finalDeadline)throw Error('Comparison finalization deadline');
 if(f?.phase!=='terminal'||f.pending||f.steps.some(step=>step.status!=='complete'))throw Error('Incomplete phase evidence');
 const receipt={schemaVersion:1,trial:f.trial,fixture:f.fixture,arm:f.arm,seed:f.seed,bindingDigest:comparisonHash(ledger.bound),status:'complete',accepted:f.accepted,failure:f.failure,workflowProtocol:f.protocol,steps:f.steps,attempts:f.attempts,started:t.started,ended:now,requests:s.requests.filter(r=>r.trial===f.trial),nativeReceipts:s.nativeReceipts.filter(r=>r.trial===f.trial),sandbox:f.sandbox};
 const file=path.join(ledger.workspace,f.trial+'.receipt.json');comparisonPublish(file,receipt);
 Object.assign(t,{status:'complete',ended:now,accepted:f.accepted,receiptDigest:comparisonHash(comparisonRead(file))});s.workflow=null;if(s.trials.length===12)s.status='complete';
});}
function recordOutput(ledger,text,receipt,{nativeReceipt=null,expectedPending=null}={}){
 const s=ledger.read(),f=s.workflow,pending=f.pending,manifest=loadFixtures().find(m=>m.name===f.fixture);
 if(!pending||!['api','native'].includes(pending.kind)||typeof text!=='string'||Buffer.byteLength(text)>128000||!same(pending.packet.sourceHashes,hashes(f.root,manifest))||expectedPending&&!same(pending,expectedPending))throw Error('Phase output/source binding changed');
 ledger.transaction((s,now)=>{
  const f=s.workflow;
  if(!f||!same(f.pending,pending)||f.phase!==pending.packet.phase)throw Error('Phase output binding changed before commit');
  const p=f.pending.packet;
  if(now>=comparisonPhaseDeadline(s,f.trial,p.phase))throw Error('Comparison phase commit deadline');
  if(nativeReceipt){
   const all=[...s.nativeReceipts.map(r=>r.usageReceipt),nativeReceipt.usageReceipt];
   if(aggregateNativeUsage(all,{independenceEvidence:{freshNoHistory:true,accountingDisjoint:true,sessionUUIDs:all.map(r=>r.identity.sessionUUID)}}).status!=='observed')throw Error('Native session overlap');
   if(s.nativeReceipts.filter(r=>r.trial===f.trial).reduce((sum,r)=>sum+r.costEquivalentMicrodollars,0)+nativeReceipt.costEquivalentMicrodollars>2000000)throw Error('Native observed usage exceeds configured bound');
   s.nativeReceipts.push(nativeReceipt);
  }
  f.steps.push({id:p.id,step:p.step,phase:p.phase,model:p.model,effort:p.effort,status:'complete',inputDigest:comparisonHash(p.payload),outputDigest:comparisonHash(text),inputBytes:Buffer.byteLength(p.payload),outputBytes:Buffer.byteLength(text),started:f.pending.started,ended:now,elapsedMs:now-f.pending.started,receipt});f.pending={kind:'apply',text,step:p.step};
 });
}
async function applyOutput(ledger){let s=ledger.read(),f=s.workflow;const manifest=loadFixtures().find(m=>m.name===f.fixture),{text,step}=f.pending;let terminalFailure=null,value;try{if(f.phase==='planning')value=validatePlanningStepOutput(step,text,{manifest,answer:f.answer});else if(['implementation','repair'].includes(f.phase)){if(!applyEdits(f.root,manifest,text))throw Error('No corrective change');}else{value=JSON.parse(text);if(!value||Object.keys(value).sort().join()!=='findings,ready'||typeof value.ready!=='boolean'||!Array.isArray(value.findings)||value.findings.length>8||value.findings.some(v=>typeof v!=='string'||!v.trim()||Buffer.byteLength(v)>500)||value.findings.join('').length>4000)throw Error('Invalid independent review');}}catch{terminalFailure='invalid-'+f.phase+'-output';}
 ledger.transaction((s,now)=>{const f=s.workflow;f.pending=null;if(terminalFailure){f.failure=terminalFailure;f.phase='terminal';return;}if(f.phase==='planning'){if(step==='draft-plan')f.draft=value;else if(step==='consultation')f.answer=value;else f.plan=value;f.phaseStarted=now;if(++f.cursor===f.planningSteps.length)f.phase='implementation';}else if(['implementation','repair'].includes(f.phase)){f.sourceHashes=hashes(f.root,manifest);f.phase='gates';f.phaseStarted=now;}else{f.review=value;f.attempts.at(-1).review={...value,receiptId:f.steps.at(-1).id};if(value.ready&&!value.findings.length){f.accepted=true;f.phase='terminal';}else if(f.repairs===2){f.failure='acceptance-failed';f.phase='terminal';}else{f.repairs++;f.phase='repair';f.phaseStarted=now;}}});}
async function runGates(ledger,gateRunner=acceptance){const s=ledger.read(),f=s.workflow,manifest=loadFixtures().find(m=>m.name===f.fixture);ledger.transaction((s,now)=>{s.workflow.pending={kind:'gates',started:now};});const deadline=Math.min(s.executionWindow.dispatchDeadline,ledger.deadline(f.trial,'gates')),gates=await gateRunner(f.root,manifest,deadline,{sandbox:f.sandbox});const ids=REQUIRED_GATE_IDS[manifest.name];if(gates.length!==ids.length||ids.some(id=>gates.filter(g=>g.id===id).length!==1)||gates.some(g=>g.cleanupConfirmed!==true&&!g.notRun))throw Error('Complete gate receipts required');ledger.transaction((s,now)=>{const f=s.workflow;f.gates=gates.map(({output,...g})=>g);f.attempts.push({ordinal:f.attempts.length+1,kind:f.repairs?'repair':'initial',started:f.pending.started,ended:now,elapsedMs:now-f.pending.started,gates:f.gates,review:null});f.pending=null;if(gates.every(g=>g.passed)){f.phase='review';}else if(f.repairs===2){f.phase='terminal';f.failure='acceptance-failed';}else{f.repairs++;f.phase='repair';}f.phaseStarted=now;});}
function requireDispatchTime(s,now,minimum=s.lastTime,phaseDeadline=Infinity){
 const f=s.workflow,t=s.trials.at(-1);
 if(!Number.isSafeInteger(now)||now<minimum)throw Error('Comparison dispatch clock regressed');
 if(!f||!t||t.status!=='active'||now>=Math.min(phaseDeadline,s.executionWindow?.dispatchDeadline??Infinity,t.started+14*60000,s.executionWindow?comparisonPhaseDeadline(s,f.trial,f.phase):f.phaseStarted+3*60000))throw Error('Comparison dispatch deadline');
}
export async function advanceComparison({ledger,repo,images,provider,credential=null,offlineGates=null}){
 if(offlineGates!==null&&(ledger.config.mode!=='offline'||provider?.kind!=='fake'||typeof offlineGates!=='function'))throw Error('Synthetic gates require offline fake provider');
 let s=ledger.read();verifyReceipts(ledger,s);if(s.status==='complete')return {status:'complete'};ledger.ready(s);if(s.workflow?.pending){if(s.workflow.pending.kind==='native')return {status:'awaiting-native',trial:s.workflow.trial,phaseId:s.workflow.pending.packet.id,dispatchAgain:false};throw Error('Incomplete side effect receipt; replay forbidden');}
 while(ledger.read().status!=='complete'){
  s=ledger.read();ledger.ready(s);if(!s.workflow){if(!setupTrial(ledger,repo,images))break;s=ledger.read();}const f=s.workflow,manifest=loadFixtures().find(m=>m.name===f.fixture);
  if(!same(f.sourceHashes,hashes(f.root,manifest)))throw Error('Fixture source changed');
  if(f.phase==='terminal'){if(!s.executionWindow||ledger.clock()>=s.executionWindow.finalDeadline)throw Error('Comparison finalization deadline');finish(ledger);if(ledger.read().status!=='complete'&&ledger.clock()>=s.executionWindow.dispatchDeadline)return {status:'dispatch-closed'};continue;}
  if(s.executionWindow&&ledger.clock()>=Math.min(s.executionWindow.dispatchDeadline,s.trials.at(-1).started+14*60000))throw Error('Comparison deadline');if(f.phase==='gates'){await runGates(ledger,offlineGates??acceptance);continue;}
  const packet=comparisonPacket(f,manifest),kind=s.trials.at(-1).environment;
  const handoff=ledger.transaction((current,now)=>{
   ledger.ready(current);if(!same(current.workflow,f))throw Error('Comparison dispatch phase changed');requireDispatchTime(current,now);
   const phaseDeadline=current.executionWindow?comparisonPhaseDeadline(current,f.trial,f.phase):Infinity;
   current.workflow.pending={kind,packet,started:now};
   if(kind!=='native')return null;
   const priorEquivalent=current.nativeReceipts.filter(r=>r.trial===f.trial).reduce((sum,r)=>sum+r.costEquivalentMicrodollars,0);
   if(priorEquivalent+maximumCost(ledger.config.models[packet.model],32000,packet.maxOutputTokens)>2000000)throw Error('Native bounded equivalent budget exhausted');
   const deadline=Math.min(phaseDeadline,comparisonPhaseDeadline(current,f.trial,f.phase)),dispatchDeadline=current.executionWindow.dispatchDeadline;
   const dispatch={schemaVersion:1,campaignId:P.campaignId,trial:f.trial,phaseId:packet.id,packetDigest:comparisonHash(packet),controllerHead:ledger.bound.head,fixture:f.fixture,phase:packet.phase,model:packet.model,effort:packet.effort,maxInputTokens:32000,maxOutputTokens:packet.maxOutputTokens,deadline,dispatchDeadline,historyMode:'none',freshSession:true,phaseCount:1,dispatchOwner:'root-orchestrator',actualApiSpend:null,hardNativeSpendCap:false,prompt:packet.payload};
   const file=path.join(ledger.workspace,packet.id+'.native-packet.json');requireDispatchTime(current,ledger.clock(),now,deadline);comparisonPublish(file,dispatch);
   return {status:'native-dispatch-required',packetFile:file,phaseId:packet.id,deadline,dispatchDeadline};
  });
  if(handoff){const current=ledger.read();requireDispatchTime(current,ledger.clock(),current.lastTime,handoff.deadline);return handoff;}
  let text;try{text=await generate(ledger,provider,{prompt:packet.payload,requestId:packet.id,trial:f.trial,phase:packet.phase,model:packet.model,effort:packet.effort,maxOutputTokens:packet.maxOutputTokens});}catch{const r=ledger.read().requests.at(-1);if(r?.id===packet.id&&r.status==='complete'){ledger.transaction(s=>{s.workflow.steps.push({id:packet.id,step:packet.step,phase:packet.phase,model:packet.model,effort:packet.effort,status:'complete',inputDigest:comparisonHash(packet.payload),outputDigest:null,started:s.workflow.pending.started,ended:r.end,elapsedMs:r.end-s.workflow.pending.started,receipt:r.id});s.workflow.pending=null;s.workflow.phase='terminal';s.workflow.failure='content-rejected';});continue;}throw Error('API evidence unresolved');}
  if(credential&&text.includes(credential))throw Error('Private output denied');recordOutput(ledger,text,packet.id);await applyOutput(ledger);
 }
 return {status:ledger.read().status};
}
export async function importComparisonNative({ledger,manifestFile,sessionFile,outputFile,credential=null}){
 const s=ledger.read();ledger.ready(s);verifyReceipts(ledger,s);const f=s.workflow,p=f?.pending;if(p?.kind!=='native')throw Error('Exactly one pending native packet required');const manifest=JSON.parse(comparisonRead(manifestFile)),text=comparisonRead(outputFile).toString('utf8'),session=comparisonRead(sessionFile).toString('utf8'),packet=p.packet;const now=ledger.clock();if(credential&&text.includes(credential))throw Error('Private native output denied');
 if(manifest.packetDigest!==comparisonHash(packet)||manifest.outputDigest!==comparisonHash(text)||manifest.phaseId!==packet.id||manifest.head!==ledger.bound.head||manifest.fixture!==f.fixture||manifest.phase!==packet.phase||manifest.model!==packet.model||manifest.effort!==packet.effort||Date.parse(manifest.startedAt)<p.started||Date.parse(manifest.endedAt)>now||now>=ledger.deadline(f.trial,f.phase))throw Error('Native receipt does not bind pending phase');
 const usage=await verifyComparisonNativeSession({manifest,session,text,packet,pendingStarted:p.started,deadline:ledger.deadline(f.trial,f.phase),dispatchDeadline:s.executionWindow.dispatchDeadline,now});
 const u=usage.usage,costEquivalent=actualCost(ledger.config.models[packet.model],{input:u.inputTokens,cachedInput:u.cachedInputTokens,cacheWrite:u.cacheWriteInputTokens,output:u.outputTokens,reasoning:u.reasoningOutputTokens,fees:0});
 if(u.inputTokens>32000||u.outputTokens>packet.maxOutputTokens)throw Error('Native observed usage exceeds configured bound');
 const nativeReceipt={trial:f.trial,phaseId:packet.id,packetDigest:comparisonHash(packet),outputDigest:comparisonHash(text),sourceDigest:comparisonHash(session),usageReceipt:usage,costEquivalentMicrodollars:costEquivalent,actualApiSpend:null};
 recordOutput(ledger,text,usage.identity.sessionUUID,{nativeReceipt,expectedPending:p});await applyOutput(ledger);return {status:'native-phase-complete',phaseId:packet.id};
}
