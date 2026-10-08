import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
import test from 'node:test';
import {context,loadFixtures} from '../evaluation/workflow.mjs';
import {scopedContext} from '../evaluation/context.mjs';
import {publicSnapshot} from '../evaluation/public-results.mjs';

// Exercise the current bridge and real packet/export contracts with offline gates.
// The stub replaces only Docker acceptance, never agent calls or a live ledger.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-native-repair-test-'));
const moduleUrl=name=>pathToFileURL(path.resolve('scripts/evaluation',name)).href;
const stub=path.join(temp,'workflow.mjs');
fs.writeFileSync(stub,`export {loadFixtures,schedule,archiveFixture,phasePacket,context} from ${JSON.stringify(moduleUrl('workflow.mjs'))};\nexport let results=[{id:'focused',passed:true,code:0}];export const setResults=value=>results=value;export async function acceptance(){return results;}`);
let bridge=fs.readFileSync(new URL('../evaluation/native-bridge.mjs',import.meta.url),'utf8');
for(const name of ['native-usage.mjs','context.mjs','paths.mjs','workflow-protocol.mjs','continuation.mjs','public-results.mjs'])bridge=bridge.replaceAll(`'./${name}'`,JSON.stringify(moduleUrl(name)));
bridge=bridge.replace("'./workflow.mjs'",JSON.stringify(pathToFileURL(stub).href));
const bridgeFile=path.join(temp,'native-bridge.mjs');fs.writeFileSync(bridgeFile,bridge);
const {advanceNative}=await import(pathToFileURL(bridgeFile).href);
assert.equal(typeof advanceNative,'function','temporary bridge module loads current dependencies');
const {setResults}=await import(pathToFileURL(stub).href);
const manifest=loadFixtures().find(m=>m.name==='behavior'),trial='native_behavior_2_A',head='a'.repeat(40);
const finding='PRIVATE_FINDING: Return the mapped option label instead of its internal ID.';
function setup(){
 const workspace=fs.mkdtempSync(path.join(temp,'case-')),root=path.join(workspace,trial);fs.mkdirSync(root);
 for(const relative of manifest.fileOwnership){const file=path.join(root,relative.replace(/ \((generated|new)\)$/,''));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'original\n');}
 const state={schemaVersion:1,trial,arm:'A',fixture:'behavior',seed:manifest.seed,root,controllerHead:head,started:1000,deadline:100000,phaseStarted:1000,phase:'review',baseline:scopedContext(root,manifest),fullBaseline:context(root,manifest),plan:'settled',gates:[{id:'focused',passed:true,code:0}],review:null,attempts:[{ordinal:0,kind:'initial',started:1000,ended:1000,elapsedMs:0,outcome:'failed',gates:[{id:'focused',passed:true,code:0}],review:null}],nativePhases:[],nativeSessionIds:[],nativeUsageReceipts:[],repairs:0,terminal:false};
 const file=path.join(workspace,trial+'.native-state.json');const write=()=>fs.writeFileSync(file,JSON.stringify(state));write();let now=2000;
 const ledger={read:()=>({version:2}),clock:()=>now++,close:()=>{},transaction:()=>{throw Error('Unexpected live transaction');}};
 return {workspace,root,state,file,write,ledger,read:()=>JSON.parse(fs.readFileSync(file))};
}
async function advance(c,text){
 const state=c.read(),uuid=crypto.randomUUID(),receipt={status:'observed',attribution:'single-fresh-phase',identity:{sessionUUID:uuid,parentSessionUUID:'f'.repeat(36),phase:state.phase,model:'gpt-6.1-sol',effort:state.phase==='review'?'high':'medium',fixture:'behavior',head,startedAt:'2026-10-07T00:00:00.000Z',endedAt:'2026-10-07T00:00:01.000Z'},completionObserved:{completed:true},elapsedMs:1000,usage:{inputTokens:10,cachedInputTokens:0,cacheWriteInputTokens:0,uncachedInputTokens:10,outputTokens:10,reasoningOutputTokens:0,totalTokens:20}};
 return advanceNative({...c,trial,text:typeof text==='string'?text:JSON.stringify(text),usageReceipt:receipt,independenceEvidence:{freshNoHistory:true,accountingDisjoint:true,sessionUUIDs:[...state.nativeSessionIds,uuid]}});
}
const reject=c=>advance(c,{ready:false,findings:[finding]});
function patch(c){const file=context(c.root,manifest)[0];return {files:[{path:file.path,sha256:file.sha256,edits:[{old:'original',new:'corrected'}]}]};}

test('specific finding reaches the immediate repair packet and stays private in summaries and snapshot',async()=>{
 const c=setup(),packet=await reject(c),state=c.read();assert.equal(packet.phase,'repair');assert.deepEqual(JSON.parse(packet.payload).review.findings,[finding]);assert.equal(state.repairContext.reviewReceiptId,state.review.receiptId);assert.deepEqual(state.repairContext.sourceHashes,context(c.root,manifest).map(({path,sha256})=>({path,sha256})));
 assert.equal(JSON.stringify({review:state.review,attempts:state.attempts,nativePhases:state.nativePhases}).includes(finding),false);
 assert.equal(JSON.stringify(publicSnapshot({receipts:[state],sourceHead:head})).includes(finding),false);
});
test('review findings use UTF-8 byte bounds, retain exact limits, and never truncate',async()=>{
 for(const findings of [[null],[''],['   '],[]])assert.equal((await advance(setup(),{ready:false,findings})).failure,'invalid-output');
 for(const findings of [['é'.repeat(251)],Array(9).fill('x')])assert.equal((await advance(setup(),{ready:false,findings})).failure,'context-too-large');
 const findings=Array(8).fill('é'.repeat(250)),packet=await advance(setup(),{ready:false,findings});assert.deepEqual(JSON.parse(packet.payload).review.findings,findings);
 for(const value of [null,[],{ready:'false',findings:[finding]}])assert.equal((await advance(setup(),value)).failure,'invalid-output');
});
test('mismatched review receipt, latest attempt, source hashes, and legacy missing context stop before edits',async()=>{
 for(const tamper of [s=>s.repairContext.reviewReceiptId='wrong',s=>s.attempts.at(-1).review={...s.review,receiptId:'wrong'},s=>s.nativePhases.at(-1).receiptId='wrong',s=>s.attempts.at(-1).review={...s.review,ready:true,findingCount:0},s=>s.nativePhases.push({phase:'repair',receiptId:'later'}),s=>delete s.repairContext,s=>s.repairContext.findings=['']]){
  const c=setup();await reject(c);const s=c.read();tamper(s);fs.writeFileSync(c.file,JSON.stringify(s));assert.equal((await advance(c,patch(c))).failure,'invalid-output');assert.equal(context(c.root,manifest)[0].content,'original\n');
 }
 const c=setup();await reject(c);fs.writeFileSync(path.join(c.root,context(c.root,manifest)[0].path),'externally changed\n');assert.equal((await advance(c,{files:[]})).failure,'invalid-output');
});
test('repair clears findings before later gate failure and old gate-only state remains safe',async()=>{
 setResults([{id:'focused',passed:false,code:1}]);
 try{
  const c=setup();await reject(c);const packet=await advance(c,patch(c));assert.equal(packet.phase,'repair');assert.equal(JSON.parse(packet.payload).review,null);assert.equal(Object.hasOwn(c.read(),'repairContext'),false);assert.equal(packet.payload.includes(finding),false);
  const legacy=setup();legacy.state.phase='repair';legacy.state.repairs=1;legacy.write();const next=await advance(legacy,patch(legacy));assert.equal(next.phase,'repair');assert.equal(JSON.parse(next.payload).review,null);
 }finally{setResults([{id:'focused',passed:true,code:0}]);}
});
test('valid ready review accepts unchanged and post-repair review can accept without private context',async()=>{
 const direct=setup(),accepted=await advance(direct,{ready:true,findings:[]});assert.equal(accepted.accepted,true);assert.equal(accepted.terminal,true);assert.equal(Object.hasOwn(accepted,'repairContext'),false);
 const c=setup();await reject(c);assert.equal((await advance(c,patch(c))).phase,'review');assert.equal(Object.hasOwn(c.read(),'repairContext'),false);assert.equal((await advance(c,{ready:true,findings:[]})).accepted,true);
});
