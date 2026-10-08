// A fresh claim scaffold and offline controller proof. No live dispatch entry point.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {types} from 'node:util';
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
function inputSnapshot(value,seen=new Set(),depth=0){
  if(value===null||['string','boolean'].includes(typeof value))return value;
  if(typeof value==='number'&&Number.isSafeInteger(value))return value;
  if(!value||typeof value!=='object'||types.isProxy(value)||depth>12||seen.has(value))throw Error('Invalid schema-probe input data');
  seen.add(value);
  try{
    if(Array.isArray(value)){
      if(Object.getPrototypeOf(value)!==Array.prototype)throw Error('Inherited schema-probe array denied');
      const fields=Object.getOwnPropertyDescriptors(value),length=fields.length?.value;
      if(!Number.isSafeInteger(length)||length<0||length>2048||Reflect.ownKeys(fields).length!==length+1)throw Error('Invalid schema-probe array fields');
      const result=[];
      for(let i=0;i<length;i++){const field=fields[String(i)];if(!field||!Object.hasOwn(field,'value'))throw Error('Accessor schema-probe array denied');result.push(inputSnapshot(field.value,seen,depth+1));}
      return freeze(result);
    }
    const fields=ownData(value),result={};
    if(Object.keys(fields).length>128)throw Error('Schema-probe input bound');
    for(const [key,field]of Object.entries(fields))Object.defineProperty(result,key,{value:inputSnapshot(field.value,seen,depth+1),enumerable:true});
    return freeze(result);
  }finally{seen.delete(value);}
}
function inputKeys(value,names){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!==[...names].sort().join())throw Error('Invalid schema-probe input fields');}
export function schemaProbeActivation(scaffold,args){
  const cleanScaffold=inputSnapshot(scaffold),cleanArgs=inputSnapshot(args);
  inputKeys(cleanArgs,['reviewedHead','currentHead','reviews']);
  const {reviewedHead,currentHead,reviews}=cleanArgs;
  validateScaffold(cleanScaffold);
  if(typeof reviewedHead!=='string'||typeof currentHead!=='string'||!/^[a-f0-9]{40}$/.test(reviewedHead)||reviewedHead!==currentHead)throw Error('Exact reviewed schema-probe head required');
  if(!Array.isArray(reviews)||reviews.length!==2)throw Error('Two schema-probe reviews required');
  const digests=new Set();
  for(const [i,model]of ['gpt-6.1-sol','gpt-6-astra'].entries()){
    const r=reviews[i];
    if(!r||Object.keys(r).sort().join()!==['model','effort','status','head','receiptDigest'].sort().join()||['model','effort','status','head','receiptDigest'].some(key=>typeof r[key]!=='string')||r.model!==model||r.effort!=='high'||r.status!=='READY'||r.head!==reviewedHead||!/^[a-f0-9]{64}$/.test(r.receiptDigest)||digests.has(r.receiptDigest))throw Error('Schema-probe review stale or invalid');
    digests.add(r.receiptDigest);
  }
  return freeze({...createSchemaProbeScaffold(),activation:{reviewedHead,reviews,scaffoldDigest:hash(cleanScaffold)},executionWindow:null,paidRequests:0});
}
function safeBytes(file){let at=path.parse(file).root;for(const part of file.slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw Error('Schema-probe symlink denied');}const st=fs.statSync(file);if(!st.isFile()||st.size>1000000)throw Error('Schema-probe evidence bound');return fs.readFileSync(file);}
export function verifySchemaProbePredecessor(){for(const [relative,digest]of Object.entries(SCHEMA_PROBE_ORIGIN))if(sha(safeBytes(path.join(repo,relative)))!==digest)throw Error('Frozen schema-probe predecessor changed');return true;}
function sourceSnapshot(reviewedHead){
  const currentHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
  if(typeof reviewedHead!=='string'||currentHead!==reviewedHead)throw Error('Schema-probe reviewed HEAD changed');
  execFileSync('git',['merge-base','--is-ancestor',SCHEMA_PROBE_POLICY.sourceBase,currentHead],{cwd:repo,stdio:'ignore',windowsHide:true});
  const dirty=execFileSync('git',['status','--porcelain','--untracked-files=all'],{cwd:repo,encoding:'utf8',windowsHide:true}).split(/\r?\n/).filter(l=>l&&!l.slice(3).startsWith('.claude/')&&!l.slice(3).startsWith('scripts/evaluation/runtime/')&&!l.slice(3).startsWith('apps/skill-registry/.evaluation/'));
  if(dirty.length)throw Error('Schema-probe reviewed source changed');
  verifySchemaProbePredecessor();
  const afterHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
  if(afterHead!==currentHead||afterHead!==reviewedHead)throw Error('Schema-probe source snapshot changed');
  return currentHead;
}
// Mandatory for any future execution integration. Marker presence never grants
// execution: every read binds both records and rechecks current stable source.
export function readSchemaProbeClaim(){
  const claim=path.join(repo,SCHEMA_PROBE_POLICY.claim);
  for(const suffix of ['.lock','.next','.blocked.json'])if(fs.existsSync(claim+suffix))throw Error('Schema-probe publication unfinished or held');
  const raw=safeBytes(claim),record=inputSnapshot(JSON.parse(raw)),attempt=inputSnapshot(JSON.parse(safeBytes(claim+'.attempt.json'))),published=inputSnapshot(JSON.parse(safeBytes(claim+'.published.json')));
  inputKeys(record,['activation','sha256']);inputKeys(attempt,['schemaVersion','claimDigest']);inputKeys(published,['schemaVersion','claimDigest','reviewedHead']);
  const value=record.activation;inputKeys(value,['policy','predecessorDigests','activation','executionWindow','paidRequests']);inputKeys(value.activation,['reviewedHead','reviews','scaffoldDigest']);
  const head=sourceSnapshot(published.reviewedHead),validated=schemaProbeActivation(createSchemaProbeScaffold(),{reviewedHead:head,currentHead:head,reviews:value.activation.reviews});
  if(typeof record.sha256!=='string'||attempt.schemaVersion!==1||published.schemaVersion!==1||attempt.claimDigest!==sha(raw)||published.claimDigest!==sha(raw)||record.sha256!==hash(validated)||!equal(value,validated))throw Error('Schema-probe publication binding changed');
  sourceSnapshot(head);
  return validated;
}
// Publishing creates only an immutable claim. It cannot start a window or a count.
// A paid execution path must be separately implemented, reviewed and authorized.
export function publishSchemaProbeClaim(args){
  const cleanArgs=inputSnapshot(args);inputKeys(cleanArgs,['initialize','reviewedHead','reviews']);
  const {initialize,reviewedHead,reviews}=cleanArgs;
  if(initialize!==true)throw Error('Explicit schema-probe claim initialization required');
  const currentHead=sourceSnapshot(reviewedHead);
  verifySchemaProbePredecessor();
  const activation=schemaProbeActivation(createSchemaProbeScaffold(),{reviewedHead,currentHead,reviews});
  const claim=path.join(repo,SCHEMA_PROBE_POLICY.claim),workspace=path.join(repo,SCHEMA_PROBE_POLICY.workspace),marker=claim+'.attempt.json',published=claim+'.published.json',blocked=claim+'.blocked.json';
  // Parent directories must exist and be unlinked; publication never creates runtime.
  fs.realpathSync(path.dirname(claim));safeBytes(path.join(repo,predecessor+'pilot-budget.json'));
  for(const file of [claim,marker,published,blocked,claim+'.lock',claim+'.next',workspace])if(fs.existsSync(file))throw Error('Schema-probe claim already attempted; replay denied');
  let lock,output,attempt,ownsAttempt=false;
  const serialized=JSON.stringify({activation,sha256:hash(activation)})+'\n';
  try{
    lock=fs.openSync(claim+'.lock','wx',0o600);
    // The durable marker is never removed, even after a torn publication. A stale
    // contender that passed prechecks cannot become a second publisher.
    attempt=fs.openSync(marker,'wx',0o600);
    ownsAttempt=true;
    fs.writeFileSync(attempt,JSON.stringify({schemaVersion:1,claimDigest:sha(serialized)})+'\n');fs.fsyncSync(attempt);fs.closeSync(attempt);attempt=undefined;
    for(const file of [claim,claim+'.next',workspace])if(fs.existsSync(file))throw Error('Schema-probe publication torn; replay denied');
    verifySchemaProbePredecessor();
    const innerHead=sourceSnapshot(reviewedHead),innerActivation=schemaProbeActivation(createSchemaProbeScaffold(),{reviewedHead,currentHead:innerHead,reviews});
    const innerSerialized=JSON.stringify({activation:innerActivation,sha256:hash(innerActivation)})+'\n';
    if(innerSerialized!==serialized)throw Error('Schema-probe activation snapshot changed');
    output=fs.openSync(claim+'.next','wx',0o600);fs.writeFileSync(output,innerSerialized);fs.fsyncSync(output);fs.closeSync(output);output=undefined;
    // Hard-link publication atomically refuses an existing destination; rename
    // would replace it on some platforms. A leftover .next also stays held.
    sourceSnapshot(reviewedHead);
    fs.linkSync(claim+'.next',claim);fs.unlinkSync(claim+'.next');
    // A mutation inside the link operation also fails closed. Claim bytes alone
    // are unverified; completion requires this separate durable publication mark.
    sourceSnapshot(reviewedHead);
    output=fs.openSync(published,'wx',0o600);fs.writeFileSync(output,JSON.stringify({schemaVersion:1,claimDigest:sha(innerSerialized),reviewedHead:innerHead})+'\n');fs.fsyncSync(output);fs.closeSync(output);output=undefined;
    const claimDigest=sha(safeBytes(claim));
    sourceSnapshot(reviewedHead);
    return {claimDigest,executionWindowStarted:false,paidRequests:0};
  }
  catch(error){
    if(ownsAttempt){const fd=fs.openSync(blocked,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify({schemaVersion:1,reason:'publication-failed'})+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
    throw error;
  }
  finally{if(attempt!==undefined)fs.closeSync(attempt);if(output!==undefined)fs.closeSync(output);if(lock!==undefined){fs.closeSync(lock);fs.unlinkSync(claim+'.lock');}}
}

const proofs=new WeakMap();
function ownData(value){
  if(!value||typeof value!=='object'||types.isProxy(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Invalid schema-probe generation evidence');
  const descriptors=Object.getOwnPropertyDescriptors(value);
  if(Reflect.ownKeys(descriptors).some(key=>typeof key!=='string'||!Object.hasOwn(descriptors[key],'value')))throw Error('Accessor schema-probe evidence denied');
  return descriptors;
}
function snapshotGenerationUsage(result){
  // Reject accessors and proxies without reading their properties. Descriptor
  // values are then copied exactly once into an inert, frozen primitive record.
  const envelope=ownData(result);
  if(!Object.hasOwn(envelope,'usage')||Object.keys(envelope).some(key=>!['usage','text'].includes(key))||envelope.text&&envelope.text.value!==null&&typeof envelope.text.value!=='string')throw Error('Invalid schema-probe generation envelope');
  const fields=ownData(envelope.usage.value),names=['input','cachedInput','cacheWrite','output','reasoning','fees'];
  if(Object.keys(fields).sort().join()!==names.sort().join())throw Error('Invalid schema-probe usage fields');
  const usage={};
  for(const name of names){const value=fields[name].value;if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid schema-probe usage counter');usage[name]=value;}
  return freeze(usage);
}
// Fake adapters are never accepted by a live ledger and this token is process-local.
export function offlineSchemaProbeStore(){const state={kind:'synthetic-schema-probe-proof',status:'scaffold',executionWindow:null,lastTime:null,newCountCalls:0,consumedCountCalls:5,newGenerations:0,newTrialSlots:0,consumedTrialSlots:4,consumedSlotHistory:structuredClone(SCHEMA_PROBE_POLICY.consumedSlotHistory),reservation:0,cost:null,held:361646,known:10929,exposure:372575,carriedCountCalls:5,carriedTrialSlots:4};const store=Object.freeze({read:()=>structuredClone(proofs.get(store))});proofs.set(store,state);return store;}
export async function runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow=false,prompt,clock=Date.now}){
  if(!proofs.has(store)||provider?.kind!=='fake'||authorizeSyntheticWindow!==true||typeof prompt!=='string')throw Error('Synthetic schema-probe authorization required; live unavailable');
  let s=store.read();if(s.status!=='scaffold')throw Error('Schema-probe already attempted; no replay or reset');
  // Claim the private store before invoking any supplied callback, including the
  // clock. Nested calls cannot read scaffold and overwrite this invocation.
  s.status='authorizing';proofs.set(store,structuredClone(s));
  const sampleClock=()=>{
    const sample=clock();
    if(!Number.isSafeInteger(sample)||sample<0||s.lastTime!==null&&sample<s.lastTime)throw Error('Invalid or regressed schema-probe clock');
    s.lastTime=sample;
    if(s.executionWindow&&sample>=s.executionWindow.deadline)throw Error('Schema-probe clock expired');
    return sample;
  };
  let now;
  try{now=sampleClock();if(!Number.isSafeInteger(now+60000))throw Error('Schema-probe deadline overflow');}
  catch(error){s.status='stopped';proofs.set(store,structuredClone(s));throw error;}
  s.status='count-pending';s.executionWindow={startedAt:now,deadline:now+60000};s.newCountCalls=1;s.consumedCountCalls+=1;s.newTrialSlots=1;s.consumedTrialSlots+=1;s.consumedSlotHistory.push({segment:SCHEMA_PROBE_POLICY.campaignId,trial:SCHEMA_PROBE_POLICY.trial,slots:1});proofs.set(store,structuredClone(s));
  const p=SCHEMA_PROBE_POLICY,packet=freeze({model:p.model,effort:p.effort,prompt,maxOutputTokens:p.maxOutputTokens,maxToolCalls:0,retries:0,diagnosticProjectionVersion:2,financialContractVersion:3});
  try{
    const certificate=freeze(structuredClone(await provider.count(packet)));
    sampleClock();
    if(!certificate||Object.keys(certificate).sort().join()!==['payloadHash','inputTokens'].sort().join()||certificate.payloadHash!==hash(packet)||!Number.isSafeInteger(certificate.inputTokens)||certificate.inputTokens<0||certificate.inputTokens>32000)throw Error('Exact schema-probe count required');
    const rate=apiConfig().models[p.model],reservation=maximumCost(rate,certificate.inputTokens,p.maxOutputTokens);
    if(reservation>p.trialCap||s.exposure+reservation>p.totalCap)throw Error('Schema-probe cap exhausted');
    s.status='generation-pending';s.newGenerations=1;s.reservation=reservation;s.held+=reservation;s.exposure+=reservation;proofs.set(store,structuredClone(s));
    const result=await provider.send(packet,certificate);
    sampleClock();
    const usage=snapshotGenerationUsage(result);
    if(usage.input>certificate.inputTokens||usage.output>p.maxOutputTokens)throw Error('Unresolved schema-probe generation');
    const cost=actualCost(rate,usage),known=s.known+cost,exposure=s.exposure-reservation+cost,held=s.held-reservation;
    if([cost,known,exposure,held].some(value=>!Number.isSafeInteger(value)||value<0)||cost>reservation||cost>p.trialCap||exposure>p.totalCap||known<p.carry.known||held<p.carry.held||known+held!==exposure)throw Error('Unbounded schema-probe settlement');
    s.cost=cost;s.known=known;s.exposure=exposure;s.held=held;
  }catch{/* Missing evidence retains the reservation; no retry or second generation. */}
  finally{s.status='stopped';proofs.set(store,structuredClone(s));}
  return freeze(store.read());
}
