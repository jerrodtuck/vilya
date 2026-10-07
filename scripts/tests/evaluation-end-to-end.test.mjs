// Controller contract tests. Scripted responses are never model-quality evidence.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {contractCase,runContractProof,publicContractEvidence,offlineProofLedger,SCRIPTED_USAGE} from '../evaluation/contract-proof.mjs';
import {REQUIRED_GATE_IDS} from '../../apps/skill-registry/src/features/evaluation/acceptance.mjs';import {publicSnapshot} from '../evaluation/public-results.mjs';import {actualCost,LIMITS} from '../evaluation/money.mjs';import {generate} from '../evaluation/generation.mjs';
const repo=fileURLToPath(new URL('../..',import.meta.url));
const goodGates=async()=>REQUIRED_GATE_IDS.behavior.map(id=>({id,passed:true,timedOut:false,code:0,started:Date.now(),ended:Date.now()}));
function temporary(t){const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-contract-component-'));t.after(()=>fs.rmSync(workspace,{recursive:true,force:true}));return workspace;}
test('component-only scripted A/B complete packets, hash edits, reviews, repair and public evidence',async t=>{
 const cases=[];for(const [arm,scenario] of [['A','accept'],['B','review-repair']]){const workspace=path.join(temporary(t),arm);fs.mkdirSync(workspace);cases.push(await contractCase({repo,workspace,arm,scenario,acceptanceFn:goodGates}));}
 const snapshot=publicContractEvidence(cases,'a'.repeat(40));assert.equal(snapshot.runs.filter(r=>r.status==='accepted').length,2);
 assert.deepEqual(cases[0].calls.map(c=>c.phase),['planning','implementation','review']);assert.deepEqual(cases[1].calls.map(c=>c.phase),['planning','implementation','review','repair','review']);
 assert.equal(cases[1].receipt.attempts[0].review.ready,false);assert.equal(cases[1].receipt.attempts[1].review.ready,true);assert.equal(cases[1].receipt.repairs.acceptance.unsuccessful,0);
 assert.equal(cases.every(c=>c.gateEvidence==='injected-component'),true);assert.equal(snapshot.budget.reconciledCostMicrodollars,cases.reduce((n,c)=>n+c.syntheticMicrodollars,0));
 const malformed=structuredClone(cases[0].receipt);malformed.gates=malformed.gates.filter(g=>g.id!=='build');malformed.attempts[0].gates=malformed.attempts[0].gates.filter(g=>g.id!=='build');assert.throws(()=>publicSnapshot({sourceHead:'a'.repeat(40),state:{requests:malformed.requests},receipts:[malformed]}));
});
test('component-only malformed edit and missing independent review never yield acceptance',async t=>{
 for(const scenario of ['invalid-edit','invalid-review']){const c=await contractCase({repo,workspace:temporary(t),scenario,acceptanceFn:goodGates});assert.equal(c.receipt.accepted,false);assert.equal(c.receipt.historyComplete,false);assert.ok(c.receipt.failure);assert.equal(c.receipt.requests.every(r=>r.status==='complete'),true);assert.equal(c.calls.length,scenario==='invalid-edit'?2:3);}
});
test('component-only failed required gate rejects all three attempts and stops before third correction',async t=>{
 const badGates=async()=>{const gates=await goodGates();gates.find(g=>g.id==='build').passed=false;gates.find(g=>g.id==='build').code=1;return gates;};
 const c=await contractCase({repo,workspace:temporary(t),scenario:'repair-stop',acceptanceFn:badGates});assert.equal(c.receipt.accepted,false);assert.equal(c.receipt.attempts.length,3);assert.equal(c.calls.filter(r=>r.phase==='repair').length,2);assert.equal(c.calls.filter(r=>r.phase==='review').length,0);assert.equal(c.receipt.repairs.acceptance.unsuccessful,2);assert.equal(c.receipt.requests.length,4);assert.ok(c.syntheticMicrodollars>0);
});
test('component-only reviewer rejection retains failed review + two corrective attempts and review costs',async t=>{
 const c=await contractCase({repo,workspace:temporary(t),scenario:'repair-stop',acceptanceFn:goodGates});assert.equal(c.receipt.accepted,false);assert.equal(c.receipt.attempts.length,3);assert.equal(c.calls.filter(r=>r.phase==='repair').length,2);assert.equal(c.calls.filter(r=>r.phase==='review').length,3);assert.equal(c.receipt.repairs.acceptance.unsuccessful,2);assert.equal(c.receipt.requests.length,7);assert.equal(c.syntheticMicrodollars,c.calls.reduce((n,r)=>n+actualCost(c.ledger.config.models[r.model],SCRIPTED_USAGE),0));
});
test('component-only request/input/time and phase budget admission denies before later provider sends',async t=>{
 const limited=await contractCase({repo,workspace:temporary(t),scenario:'review-repair',acceptanceFn:goodGates,configure:c=>c.bounds.maxRequestsPerPhase=1});assert.equal(limited.receipt.accepted,false);assert.equal(limited.receipt.failure,'Request limit');assert.equal(limited.calls.length,4);
 const bounded=await contractCase({repo,workspace:temporary(t),acceptanceFn:goodGates,configure:c=>c.bounds.maxInputTokens=127});assert.equal(bounded.calls.length,0);assert.equal(bounded.receipt.accepted,false);assert.equal(bounded.receipt.failure,'Token bound exceeded');
 const ledger=offlineProofLedger(path.join(temporary(t),'ledger.json'),{clock:()=>1000});ledger.pair('p','a','b');ledger.begin('a');
 for(let i=0;i<3;i++){ledger.reserve({requestId:'planning_'+i,trial:'a',phase:'planning',model:'gpt-6.1-sol',effort:'medium',inputBound:32000,outputBound:4000});ledger.reconcile('planning_'+i,{input:32000,cachedInput:0,cacheWrite:0,output:4000,reasoning:0,fees:0});}
 let calls=0;const provider={kind:'fake',inputBound:()=>32000,async send(){calls++;throw Error('Must never send');}};
 await assert.rejects(generate(ledger,provider,{requestId:'blocked_budget',trial:'a',phase:'planning',model:'gpt-6.1-sol',effort:'medium',prompt:'scripted',maxOutputTokens:4000}),/budget/i);assert.equal(calls,0);
 const timed=offlineProofLedger(path.join(temporary(t),'ledger.json'),{clock:()=>1000});timed.pair('p','a','b');timed.begin('a');timed.clock=()=>1000+LIMITS.trialMs;
 await assert.rejects(generate(timed,provider,{requestId:'blocked_time',trial:'a',phase:'implementation',model:'gpt-6.1-sol',effort:'medium',prompt:'scripted',maxOutputTokens:4000}),/deadline/i);assert.equal(calls,0);
});
test('actual pinned network-none Docker A/B full controller contract proof',{skip:process.env.EVALUATION_DOCKER_CONTRACT!=='1',timeout:240000},async()=>{
 const result=await runContractProof({repo});assert.equal(result.report.kind,'synthetic-controller-contract-proof');assert.equal(result.report.paidCalls,0);assert.equal(result.report.gateEvidence,'actual-network-none-docker');assert.equal(result.report.cleanupConfirmed,true);assert.equal(result.report.cases.length,2);assert.deepEqual(result.report.cases.map(c=>c.attempts),[1,2]);
 console.log(JSON.stringify({contractProof:result.report,artifactDirectory:result.workspace}));
});
