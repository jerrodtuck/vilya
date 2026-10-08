// A fresh claim scaffold and offline controller proof. No live dispatch entry point.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {apiConfig,maximumCost,actualCost} from './money.mjs';

const repo=fileURLToPath(new URL('../..',import.meta.url));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const hash=v=>sha(JSON.stringify(v));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const predecessor='scripts/evaluation/runtime/campaign-v2-continuation-1/';
export const SCHEMA_PROBE_ORIGIN=freeze({
  [predecessor+'pilot-budget.json']:'dcc04d00141219a0660e0b32df34f5cdac7b9a4a4ce76d48e8212c41a106e340',
  [predecessor+'pilot-budget.json.diagnostics.jsonl']:'9968dabd6c580dcc891cfd8fd2c80d5b184b3617f43835e88a7c41b6b413775a',
  [predecessor+'api_instruction_1_B.receipt.json']:'7ddd197e41312470ddc191b011e569955cd898977f29fbe957f510f9c358c02a',
  [predecessor+'api_instruction_1_A.receipt.json']:'e4aa11b6f6fad0b3b1227098d3f34197364c17cfcaa259b42514e2523f37c771',
  [predecessor+'post-unknown-blocked.json']:'d4f90a7dd8c99b54d9c3ed4c7b80e04a8eaab843808b162bb90d4db019923828',
  [predecessor+'execution-window.json']:'5feb2e02830369ca96015782e4f285bb2e6932c677fe90b99bf4a94f628c81b5',
  'apps/skill-registry/.evaluation/results.json':'f985c0c8d4e9163c9167337b2d90fe89545ed03b086272f12ba7d0f3675ef1b9'
});
export const SCHEMA_PROBE_POLICY=freeze({
  schemaVersion:1,campaignId:'357-schema-probe-1',namespace:'probe1_',sourceBase:'1901738149a5833063e3759ebfbc3721254d0e1c',
  workspace:'scripts/evaluation/runtime/campaign-schema-probe-1',
  claim:'scripts/evaluation/runtime/schema-probe-357-1.claim.json',
  trial:'probe1_schema_1',requestId:'probe1_schema_1_generation_1',
  model:'gpt-6.1-sol',effort:'medium',maxOutputTokens:4000,maxToolCalls:0,retries:0,
  trialCap:2000000,totalCap:25000000,diagnosticProjectionVersion:2,financialContractVersion:3,
  nativeEnabled:false,maximumGenerations:1,maximumNewCountCalls:1,
  stopAfterGeneration:true,replayAllowed:false,resetAllowed:false,
  carry:{known:10929,held:361646,exposure:372575,countCalls:5,consumedTrialSlots:4},
  consumedSlotHistory:[{segment:'pre-continuation',slots:2},
    {segment:'v2-continuation-1',trial:'api_instruction_1_B',slots:1},
    {segment:'v2-continuation-1',trial:'api_instruction_1_A',slots:1}]
});
export function createSchemaProbeScaffold(){return freeze({policy:structuredClone(SCHEMA_PROBE_POLICY),predecessorDigests:structuredClone(SCHEMA_PROBE_ORIGIN),activation:null,executionWindow:null,paidRequests:0});}
function validateScaffold(value){if(!equal(value,createSchemaProbeScaffold()))throw Error('Immutable schema-probe scaffold changed');}
export function schemaProbeActivation(scaffold,{reviewedHead,currentHead,reviews}){
  validateScaffold(scaffold);
  if(!/^[a-f0-9]{40}$/.test(reviewedHead)||reviewedHead!==currentHead)throw Error('Exact reviewed schema-probe head required');
  if(!Array.isArray(reviews)||reviews.length!==2)throw Error('Two schema-probe reviews required');
  const digests=new Set();
  for(const [i,model]of ['gpt-6.1-sol','gpt-6-astra'].entries()){
    const r=reviews[i];
    if(!r||Object.keys(r).sort().join()!==['model','effort','status','head','receiptDigest'].sort().join()||r.model!==model||r.effort!=='high'||r.status!=='READY'||r.head!==reviewedHead||!/^[a-f0-9]{64}$/.test(r.receiptDigest)||digests.has(r.receiptDigest))throw Error('Schema-probe review stale or invalid');
    digests.add(r.receiptDigest);
  }
  return freeze({...structuredClone(scaffold),activation:{reviewedHead,reviews:structuredClone(reviews),scaffoldDigest:hash(scaffold)},executionWindow:null,paidRequests:0});
}
function safeBytes(file){let at=path.parse(file).root;for(const part of file.slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw Error('Schema-probe symlink denied');}const st=fs.statSync(file);if(!st.isFile()||st.size>1000000)throw Error('Schema-probe evidence bound');return fs.readFileSync(file);}
export function verifySchemaProbePredecessor(){for(const [relative,digest]of Object.entries(SCHEMA_PROBE_ORIGIN))if(sha(safeBytes(path.join(repo,relative)))!==digest)throw Error('Frozen schema-probe predecessor changed');return true;}
// Publishing creates only an immutable claim. It cannot start a window or a count.
// A paid execution path must be separately implemented, reviewed and authorized.
export function publishSchemaProbeClaim({initialize,reviewedHead,reviews}){
  if(initialize!==true)throw Error('Explicit schema-probe claim initialization required');
  const currentHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
  execFileSync('git',['merge-base','--is-ancestor',SCHEMA_PROBE_POLICY.sourceBase,currentHead],{cwd:repo,stdio:'ignore',windowsHide:true});
  const dirty=execFileSync('git',['status','--porcelain','--untracked-files=all'],{cwd:repo,encoding:'utf8',windowsHide:true}).split(/\r?\n/).filter(l=>l&&!l.slice(3).startsWith('.claude/')&&!l.slice(3).startsWith('scripts/evaluation/runtime/')&&!l.slice(3).startsWith('apps/skill-registry/.evaluation/'));
  if(dirty.length)throw Error('Schema-probe reviewed source changed');
  verifySchemaProbePredecessor();
  const activation=schemaProbeActivation(createSchemaProbeScaffold(),{reviewedHead,currentHead,reviews});
  const claim=path.join(repo,SCHEMA_PROBE_POLICY.claim),workspace=path.join(repo,SCHEMA_PROBE_POLICY.workspace),marker=claim+'.attempt.json';
  // Parent directories must exist and be unlinked; publication never creates runtime.
  fs.realpathSync(path.dirname(claim));safeBytes(path.join(repo,predecessor+'pilot-budget.json'));
  for(const file of [claim,marker,claim+'.lock',claim+'.next',workspace])if(fs.existsSync(file))throw Error('Schema-probe claim already attempted; replay denied');
  let lock,output,attempt;
  const serialized=JSON.stringify({activation,sha256:hash(activation)})+'\n';
  try{
    lock=fs.openSync(claim+'.lock','wx',0o600);
    // The durable marker is never removed, even after a torn publication. A stale
    // contender that passed prechecks cannot become a second publisher.
    attempt=fs.openSync(marker,'wx',0o600);
    fs.writeFileSync(attempt,JSON.stringify({schemaVersion:1,claimDigest:sha(serialized)})+'\n');fs.fsyncSync(attempt);fs.closeSync(attempt);attempt=undefined;
    for(const file of [claim,claim+'.next',workspace])if(fs.existsSync(file))throw Error('Schema-probe publication torn; replay denied');
    verifySchemaProbePredecessor();
    output=fs.openSync(claim+'.next','wx',0o600);fs.writeFileSync(output,serialized);fs.fsyncSync(output);fs.closeSync(output);output=undefined;
    // Hard-link publication atomically refuses an existing destination; rename
    // would replace it on some platforms. A leftover .next also stays held.
    fs.linkSync(claim+'.next',claim);fs.unlinkSync(claim+'.next');
    return {claimDigest:sha(safeBytes(claim)),executionWindowStarted:false,paidRequests:0};
  }
  finally{if(attempt!==undefined)fs.closeSync(attempt);if(output!==undefined)fs.closeSync(output);if(lock!==undefined){fs.closeSync(lock);fs.unlinkSync(claim+'.lock');}}
}

const proofs=new WeakMap();
// Fake adapters are never accepted by a live ledger and this token is process-local.
export function offlineSchemaProbeStore(){const state={kind:'synthetic-schema-probe-proof',status:'scaffold',executionWindow:null,newCountCalls:0,consumedCountCalls:5,newGenerations:0,newTrialSlots:0,consumedTrialSlots:4,consumedSlotHistory:structuredClone(SCHEMA_PROBE_POLICY.consumedSlotHistory),reservation:0,cost:null,held:361646,known:10929,exposure:372575,carriedCountCalls:5,carriedTrialSlots:4};const store=Object.freeze({read:()=>structuredClone(proofs.get(store))});proofs.set(store,state);return store;}
export async function runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow=false,prompt,clock=Date.now}){
  if(!proofs.has(store)||provider?.kind!=='fake'||authorizeSyntheticWindow!==true||typeof prompt!=='string')throw Error('Synthetic schema-probe authorization required; live unavailable');
  let s=store.read();if(s.status!=='scaffold')throw Error('Schema-probe already attempted; no replay or reset');
  const now=clock();if(!Number.isSafeInteger(now)||now<0)throw Error('Invalid schema-probe clock');
  s.status='count-pending';s.executionWindow={startedAt:now,deadline:now+60000};s.newCountCalls=1;s.consumedCountCalls+=1;s.newTrialSlots=1;s.consumedTrialSlots+=1;s.consumedSlotHistory.push({segment:SCHEMA_PROBE_POLICY.campaignId,trial:SCHEMA_PROBE_POLICY.trial,slots:1});proofs.set(store,structuredClone(s));
  const p=SCHEMA_PROBE_POLICY,packet=freeze({model:p.model,effort:p.effort,prompt,maxOutputTokens:p.maxOutputTokens,maxToolCalls:0,retries:0,diagnosticProjectionVersion:2,financialContractVersion:3});
  try{
    const certificate=freeze(structuredClone(await provider.count(packet)));
    if(!certificate||Object.keys(certificate).sort().join()!==['payloadHash','inputTokens'].sort().join()||certificate.payloadHash!==hash(packet)||!Number.isSafeInteger(certificate.inputTokens)||certificate.inputTokens<0||certificate.inputTokens>32000||clock()<now||clock()>=s.executionWindow.deadline)throw Error('Exact schema-probe count required');
    const rate=apiConfig().models[p.model],reservation=maximumCost(rate,certificate.inputTokens,p.maxOutputTokens);
    if(reservation>p.trialCap||s.exposure+reservation>p.totalCap)throw Error('Schema-probe cap exhausted');
    s.status='generation-pending';s.newGenerations=1;s.reservation=reservation;s.held+=reservation;s.exposure+=reservation;proofs.set(store,structuredClone(s));
    const result=await provider.send(packet,certificate);
    if(clock()<now||clock()>=s.executionWindow.deadline||!result||!result.usage||result.usage.input>certificate.inputTokens||result.usage.output>p.maxOutputTokens)throw Error('Unresolved schema-probe generation');
    const cost=actualCost(rate,result.usage);if(cost>reservation)throw Error('Unbounded schema-probe cost');
    s.cost=cost;s.known+=cost;s.exposure=s.exposure-reservation+cost;s.held-=reservation;
  }catch{/* Missing evidence retains the reservation; no retry or second generation. */}
  finally{s.status='stopped';proofs.set(store,structuredClone(s));}
  return freeze(store.read());
}
