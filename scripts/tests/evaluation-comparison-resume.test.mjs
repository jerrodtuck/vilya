import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ComparisonLedger,comparisonHash,comparisonPhaseDeadline} from '../evaluation/comparison-ledger.mjs';
import {advanceComparison,importComparisonNative} from '../evaluation/comparison-workflow.mjs';
import {COMPARISON_POLICY as P} from '../evaluation/comparison-campaign.mjs';
import {loadFixtures,archiveFixture,context} from '../evaluation/workflow.mjs';
import {scopedContext} from '../evaluation/context.mjs';
import {protocolDescriptor,planningSteps,buildPlanningStepPacket} from '../evaluation/workflow-protocol.mjs';
import {COUNT_BILLING_INTERPRETATION} from '../evaluation/openai-transport.mjs';
function terminal(t){const work=fs.mkdtempSync(path.join(os.tmpdir(),'comparison-final-offline-'));t.after(()=>fs.rmSync(work,{recursive:true,force:true}));let now=1002;const ledger=new ComparisonLedger({workspace:path.join(work,'campaign'),binding:{head:'a'.repeat(40)},check:()=>{},clock:()=>now});ledger.initialize();ledger.config.mode='offline';const m=loadFixtures()[0],trial=P.trials[0].id,root=path.join(ledger.workspace,trial);archiveFixture(fileURLToPath(new URL('../..',import.meta.url)),root,m.seed);ledger.transaction(s=>{s.status='running';s.executionWindow={startedAt:1000,dispatchDeadline:1000+174*60000,finalDeadline:1000+180*60000};s.trials=[{id:trial,environment:'api',started:1000,ended:null,status:'active',accepted:null,receiptDigest:null}];s.preflights=[{id:trial+'_step_count',requestId:trial+'_step',trial,phase:'planning',model:'gpt-6.1-sol',effort:'medium',payloadHash:'b'.repeat(64),serviceTier:'default',pricingDate:'2026-10-06',billingInterpretation:COUNT_BILLING_INTERPRETATION,start:1000,end:1001,status:'complete',inputTokens:50,providerRequestId:null}];s.workflow={trial,root,fixture:m.name,arm:'A',seed:m.seed,phase:'terminal',phaseStarted:1000,pending:null,steps:[{status:'complete',started:1000,ended:1002,elapsedMs:2}],attempts:[],repairs:0,sandbox:{allowedRoot:ledger.workspace},sourceHashes:context(root,m).map(({path,sha256})=>({path,sha256})),accepted:false,failure:'invalid-planning-output',protocol:protocolDescriptor(m,'A')};});return {ledger,setTime:value=>now=value};}
test('terminal receipt finalizes in the six-minute final reserve without starting another trial',async t=>{const {ledger,setTime}=terminal(t);const w=ledger.read().executionWindow;setTime(w.dispatchDeadline+1);let sends=0;const result=await advanceComparison({ledger,provider:{send(){sends++;throw Error('must not send');}}});assert.equal(result.status,'dispatch-closed');assert.equal(sends,0);const s=ledger.read();assert.equal(s.trials.length,1);assert.equal(s.trials[0].status,'complete');assert.equal(s.workflow,null);assert.equal(fs.existsSync(path.join(ledger.workspace,P.trials[0].id+'.receipt.json')),true);const before=ledger.files();await assert.rejects(advanceComparison({ledger}),/dispatch deadline/);assert.deepEqual(ledger.files(),before);assert.equal(ledger.read().trials.length,1);});
test('terminal receipt cannot finalize at or after final deadline',async t=>{const {ledger,setTime}=terminal(t);setTime(ledger.read().executionWindow.finalDeadline);const before=ledger.files();await assert.rejects(advanceComparison({ledger}),/finalization deadline/);assert.deepEqual(ledger.files(),before);assert.equal(fs.existsSync(path.join(ledger.workspace,P.trials[0].id+'.receipt.json')),false);});
test('dispatch cutoff rejects an unfinished next model phase before pending marker or transport',async t=>{const {ledger,setTime}=terminal(t);ledger.transaction(s=>{s.workflow.phase='review';});setTime(ledger.read().executionWindow.dispatchDeadline);const before=ledger.files();await assert.rejects(advanceComparison({ledger}),/Comparison deadline/);assert.deepEqual(ledger.files(),before);assert.equal(ledger.read().workflow.pending,null);});

test('terminal finalization rechecks advancing clock inside commit before publishing receipt',async t=>{
 const {ledger}=terminal(t),deadline=ledger.read().executionWindow.finalDeadline,before=ledger.files();let reads=0;
 ledger.clock=()=>++reads===1?deadline-1:deadline+1;
 await assert.rejects(advanceComparison({ledger}),/finalization deadline/);
 assert.equal(reads,2);assert.deepEqual(ledger.files(),before);assert.equal(ledger.read().trials[0].status,'active');
 assert.equal(fs.existsSync(path.join(ledger.workspace,P.trials[0].id+'.receipt.json')),false);
});
test('terminal receipt and trial bind the same checked commit timestamp',async t=>{
 const {ledger}=terminal(t),deadline=ledger.read().executionWindow.finalDeadline;let now=deadline-3;
 ledger.clock=()=>++now;
 assert.equal((await advanceComparison({ledger})).status,'dispatch-closed');
 const trial=ledger.read().trials[0],receipt=JSON.parse(fs.readFileSync(path.join(ledger.workspace,trial.id+'.receipt.json')));
 assert.equal(trial.ended,deadline-1);assert.equal(receipt.ended,trial.ended);
});
function nativePending(t,limit){
 const {ledger,setTime}=terminal(t),m=loadFixtures()[0],item=P.trials[6],window=ledger.read().executionWindow;
 const start=limit==='final'?window.dispatchDeadline-1000:1002,root=path.join(ledger.workspace,item.id);
 archiveFixture(fileURLToPath(new URL('../..',import.meta.url)),root,m.seed);setTime(start);
 ledger.transaction(s=>{
  const completed=P.trials.slice(0,6).map(item=>{const receipt={trial:item.id,bindingDigest:comparisonHash(ledger.bound),status:'complete',accepted:false,steps:[{status:'complete'}]},file=path.join(ledger.workspace,item.id+'.receipt.json');fs.writeFileSync(file,JSON.stringify(receipt));return {id:item.id,environment:'api',started:1000,ended:1002,status:'complete',accepted:false,receiptDigest:comparisonHash(fs.readFileSync(file))};});
  const phase=limit==='final'?'implementation':'planning',packet={id:item.id+'_step_1',trial:item.id,phase,step:phase,model:'gpt-6.1-sol',effort:'medium',maxOutputTokens:4000,payload:'EXACT PACKET',sourceHashes:context(root,m).map(({path,sha256})=>({path,sha256}))};
  s.trials=[...completed,{id:item.id,environment:'native',started:start,ended:null,status:'active',accepted:null,receiptDigest:null}];
  Object.assign(s.workflow,{trial:item.id,arm:item.arm,root,phase,phaseStarted:start,pending:{kind:'native',packet,started:start},steps:[],sourceHashes:packet.sourceHashes});
 });
 const s=ledger.read(),f=s.workflow,p=f.pending.packet,deadline=ledger.deadline(f.trial,f.phase),iso=n=>new Date(n).toISOString(),text='synthetic complete plan';
 const zero={input_tokens:0,cached_input_tokens:0,cache_write_input_tokens:0,output_tokens:0,reasoning_output_tokens:0,total_tokens:0},counts={...zero,input_tokens:50,output_tokens:10,total_tokens:60};
 const manifest={schemaVersion:1,agentId:'native_race',taskPath:'/root/native_race',sessionUUID:'11111111-1111-4111-8111-111111111111',parentSessionUUID:null,model:p.model,effort:p.effort,head:ledger.bound.head,fixture:f.fixture,phase:p.phase,startedAt:iso(start),endedAt:iso(deadline-2),completionObserved:{completed:true,source:'native-agent-final',observedAt:iso(deadline-1)},freshSession:true,historyMode:'none',phaseCount:1,baseline:{timestamp:iso(start),counts:zero},terminal:{timestamp:iso(deadline-2),counts},packetDigest:comparisonHash(p),outputDigest:comparisonHash(text),phaseId:p.id};
 const rows=[{type:'session_meta',timestamp:iso(start),payload:{id:manifest.sessionUUID,parent_thread_id:null,agent_path:manifest.taskPath}},{type:'turn_context',timestamp:iso(start),payload:{model:p.model,effort:p.effort,turn_id:p.id}},{type:'event_msg',timestamp:iso(start),payload:{type:'task_started',turn_id:p.id}},{type:'response_item',timestamp:iso(start),payload:{type:'message',role:'user',content:[{type:'input_text',text:p.payload}]}},...Array.from({length:3},()=>({type:'response_item',timestamp:iso(start),payload:{type:'reasoning',summary:[{type:'summary_text',text:'x'.repeat(2000000)}]}})),{type:'response_item',timestamp:iso(deadline-2),payload:{type:'message',role:'assistant',phase:'final',content:[{type:'output_text',text}]}},{type:'event_msg',timestamp:iso(deadline-2),payload:{type:'token_count',info:{total_token_usage:counts,last_token_usage:counts}}},{type:'event_msg',timestamp:iso(deadline-2),payload:{type:'task_complete',turn_id:p.id,last_agent_message:text}}];
 const manifestFile=path.join(ledger.workspace,'import.manifest.json'),sessionFile=path.join(ledger.workspace,'import.jsonl'),outputFile=path.join(ledger.workspace,'import.txt');fs.writeFileSync(manifestFile,JSON.stringify(manifest));fs.writeFileSync(sessionFile,rows.map(r=>JSON.stringify(r)).join('\n')+'\n');fs.writeFileSync(outputFile,text);
 return {ledger,deadline,input:{manifestFile,sessionFile,outputFile}};
}
for(const limit of ['phase','final'])test('native large-session verification cannot commit beyond '+limit+' deadline',async t=>{
 const {ledger,deadline,input}=nativePending(t,limit),before=ledger.files(),state=ledger.read();let reads=0;
 ledger.clock=()=>++reads===1?deadline-1:deadline+1;
 await assert.rejects(importComparisonNative({ledger,...input}),/phase commit deadline/);
 assert.equal(reads,2);assert.deepEqual(ledger.files(),before);assert.deepEqual(ledger.read(),state);
 assert.equal(ledger.read().nativeReceipts.length,0);assert.equal(ledger.read().workflow.pending.kind,'native');
});

function nativeReady(t,limit='dispatch'){
 const {ledger}=nativePending(t,limit==='dispatch'?'final':'phase');
 ledger.transaction(s=>{const f=s.workflow,m=loadFixtures()[0];Object.assign(f,{pending:null,phase:'implementation',phaseStarted:s.trials.at(-1).started+(limit==='trial'?10*60000:0),baseline:scopedContext(f.root,m),fullBaseline:context(f.root,m),plan:'synthetic plan'});});
 const s=ledger.read(),f=s.workflow,deadline=limit==='dispatch'?s.executionWindow.dispatchDeadline:limit==='trial'?s.trials.at(-1).started+14*60000:ledger.deadline(f.trial,f.phase);
 return {ledger,deadline};
}
for(const limit of ['dispatch','trial','phase'])for(const edge of ['pending','publication'])test('native '+limit+' cutoff advancing at '+edge+' leaves pending and packet unchanged',async t=>{
 const {ledger,deadline}=nativeReady(t,limit),before=ledger.files(),state=ledger.read(),files=fs.readdirSync(ledger.workspace);let reads=0;
 ledger.clock=()=>++reads<=(edge==='pending'?1:2)?deadline-1:deadline+1;
 await assert.rejects(advanceComparison({ledger}),/dispatch deadline/);
 assert.equal(reads,edge==='pending'?2:3);assert.deepEqual(ledger.files(),before);assert.deepEqual(ledger.read(),state);assert.deepEqual(fs.readdirSync(ledger.workspace),files);
});
test('native handoff carries explicit dispatch cutoff and bounded phase deadline',async t=>{
 const {ledger,deadline}=nativeReady(t);ledger.clock=()=>deadline-1;
 const result=await advanceComparison({ledger}),packet=JSON.parse(fs.readFileSync(result.packetFile));
 assert.equal(result.status,'native-dispatch-required');assert.equal(result.dispatchDeadline,deadline);assert.equal(packet.dispatchDeadline,deadline);assert.equal(packet.deadline,result.deadline);assert.ok(packet.deadline<=ledger.read().executionWindow.finalDeadline);
});
test('native return guard refuses handoff if publication crosses dispatch cutoff',async t=>{
 const {ledger,deadline}=nativeReady(t);let reads=0;ledger.clock=()=>++reads<=3?deadline-1:deadline+1;
 await assert.rejects(advanceComparison({ledger}),/dispatch deadline/);assert.equal(reads,4);
 assert.equal(ledger.read().workflow.pending.kind,'native');assert.equal((await advanceComparison({ledger})).dispatchAgain,false);
});

function apiPlanning(t,arm){
 const {ledger,setTime}=terminal(t),item=P.trials.find(item=>item.environment==='api'&&item.task==='instruction'&&item.arm===arm),m=loadFixtures().find(m=>m.name===item.task),root=path.join(ledger.workspace,item.id);
 archiveFixture(fileURLToPath(new URL('../..',import.meta.url)),root,m.seed);
 ledger.transaction(s=>{
  s.trials=P.trials.slice(0,P.trials.indexOf(item)).map(item=>{const r={trial:item.id,bindingDigest:comparisonHash(ledger.bound),status:'complete',accepted:false,steps:[{status:'complete'}]},file=path.join(ledger.workspace,item.id+'.receipt.json');fs.writeFileSync(file,JSON.stringify(r));return {id:item.id,environment:'api',started:1000,ended:1002,status:'complete',accepted:false,receiptDigest:comparisonHash(fs.readFileSync(file))};});
  s.trials.push({id:item.id,environment:'api',started:1002,ended:null,status:'active',accepted:null,receiptDigest:null});
  Object.assign(s.workflow,{trial:item.id,fixture:m.name,arm,seed:m.seed,root,phase:'planning',phaseStarted:1002,planningSteps:planningSteps(m,arm),cursor:0,draft:null,answer:null,plan:'',baseline:scopedContext(root,m),fullBaseline:context(root,m),sourceHashes:context(root,m).map(({path,sha256})=>({path,sha256})),steps:[],failure:null,protocol:protocolDescriptor(m,arm)});
 });return {ledger,setTime};
}
for(const arm of ['A','B'])test('planning '+arm+' counts each 45-second completed substep once',async t=>{
 const {ledger,setTime}=apiPlanning(t,arm);let now=1002;const starts=[];
 const provider={kind:'fake',prepare(request,scope){if(scope.phase!=='planning')throw Error('end of planning probe');const c=ledger.beginPreflight({...scope,model:request.model,effort:request.effort,payloadHash:comparisonHash(request),serviceTier:'default',pricingDate:'2026-10-06',billingInterpretation:COUNT_BILLING_INTERPRETATION});ledger.completePreflight(c.id,{inputTokens:100,providerRequestId:null});return c;},inputBound:()=>100,async send(){const p=ledger.read().workflow.pending.packet,input=JSON.parse(p.payload);starts.push({step:p.step,at:now});now+=45000;setTime(now);const text=p.step==='consultation'?JSON.stringify({questionId:input.questionId,resolution:'resolved',answer:'synthetic answer'}):p.step==='synthesis'?JSON.stringify({status:'settled',plan:'synthetic plan',answerDigest:input.answerDigest}):'synthetic plan';return {text,usage:{input:100,cachedInput:0,cacheWrite:0,output:10,reasoning:0,fees:0},metadata:{providerRequestId:null}};}};
 await assert.rejects(advanceComparison({ledger,provider}),/API evidence unresolved/);
 const f=ledger.read().workflow;assert.equal(f.phase,'implementation');assert.equal(f.steps.length,arm==='B'?3:1);assert.ok(f.steps.every(step=>step.elapsedMs===45000));assert.equal(f.phaseStarted,now);
 if(arm==='B')assert.deepEqual(starts.at(-1),{step:'synthesis',at:1002+90000});
});
for(const arm of ['A','B'])test('planning '+arm+' rejects dispatch at its true 180-second budget boundary',async t=>{
 const {ledger,setTime}=apiPlanning(t,arm),start=1002;
 if(arm==='B'){setTime(start+90000);ledger.transaction(s=>{const f=s.workflow,m=loadFixtures().find(m=>m.name===f.fixture),question=JSON.parse((buildPlanningStepPacket('consultation',m,f.baseline,{draft:'synthetic draft'})));f.cursor=2;f.draft='synthetic draft';f.answer={questionId:question.questionId,resolution:'resolved',answer:'synthetic answer'};f.steps=[{phase:'planning',status:'complete',started:start,ended:start+45000,elapsedMs:45000},{phase:'planning',status:'complete',started:start+45000,ended:start+90000,elapsedMs:45000}];f.phaseStarted=start+90000;});}
 assert.equal(ledger.deadline(ledger.read().workflow.trial,'planning'),start+180000);setTime(start+180000);const before=ledger.files();await assert.rejects(advanceComparison({ledger}),/dispatch deadline/);assert.deepEqual(ledger.files(),before);assert.equal(ledger.read().workflow.pending,null);
});
for(const [phase,used,attempts,budget]of [['planning',90000,0,180000],['implementation',60000,0,480000],['repair',120000,30000,480000],['review',60000,0,180000]])test(phase+' remaining budget subtracts completed work exactly once',()=>{
 const start=1000,anchor=start+used+attempts,s={executionWindow:{finalDeadline:9999999},trials:[{id:'trial',started:start}],workflow:{phaseStarted:anchor,pending:null,steps:[{phase:phase==='repair'?'implementation':phase,elapsedMs:used}],attempts:attempts?[{elapsedMs:attempts}]:[]}};
 assert.equal(comparisonPhaseDeadline(s,'trial',phase),start+budget);
 s.workflow.pending={started:anchor};assert.equal(comparisonPhaseDeadline(s,'trial',phase),start+budget);
});
