// Synthetic reviewer packets only. No provider calls or real campaign state.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {loadFixtures,archiveFixture,runTrial} from '../evaluation/workflow.mjs';import {offlineProofLedger,scriptedProvider} from '../evaluation/contract-proof.mjs';import {REQUIRED_GATE_IDS} from '../../apps/skill-registry/src/features/evaluation/acceptance.mjs';
const repo=fileURLToPath(new URL('../..',import.meta.url));
for(const [label,payload] of [['empty','{}'],['null','null'],['invalid-json','PRIVATE_REVIEW_BODY'],['wrong-ready','{"ready":"PRIVATE_VALUE","findings":[]}'],['wrong-findings','{"ready":true,"findings":null}'],['non-string-finding','{"ready":false,"findings":[{"private":"PRIVATE_VALUE"}]}']])test('malformed review '+label+' returns sanitized closed terminal receipt with completed cost',async t=>{
 const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-review-terminal-'));t.after(()=>fs.rmSync(workspace,{recursive:true,force:true}));const root=path.join(workspace,'fixture');const manifest=loadFixtures().find(m=>m.name==='behavior');archiveFixture(repo,root,manifest.seed);
 const ledger=offlineProofLedger(path.join(workspace,'ledger.json'));ledger.pair('api_behavior_1','api_behavior_1_A','api_behavior_1_B');const scripted=scriptedProvider({root,manifest,arm:'A'});
 const provider={...scripted,async send(request){const response=await scripted.send(request);return request.reservation.phase==='review'?{...response,text:payload}:response;}};
 const acceptanceFn=async()=>REQUIRED_GATE_IDS.behavior.map(id=>({id,passed:true,timedOut:false,code:0}));
 const receipt=await runTrial({ledger,provider,root,manifest,trial:'api_behavior_1_A',arm:'A',acceptanceFn});
 assert.equal(receipt.accepted,false);assert.equal(receipt.review,null);assert.equal(receipt.historyComplete,false);assert.equal(receipt.failure,'Trial stopped: invalid output, unresolved request or required acceptance failure');assert.equal(ledger.read().trials.api_behavior_1_A.closed,true);
 assert.deepEqual(scripted.calls.map(c=>c.phase),['planning','implementation','review']);assert.equal(receipt.requests.length,3);assert.equal(receipt.requests.every(r=>r.status==='complete'&&r.cost>0&&r.usage!==null),true);assert.equal(ledger.sum(ledger.read()),1890);assert.equal(receipt.attempts.length,0);assert.doesNotMatch(JSON.stringify(receipt),/PRIVATE_|TypeError/);
});
