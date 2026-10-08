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
  const before=canonicalSource();verifySchemaProbePredecessor();const after=canonicalSource();
  if(!equal(before,after))throw Error('Schema-probe source snapshot changed');
  validateSource(after,reviewedHead);return after.head.trim();
}
const identityEnv=['GIT_DIR','GIT_COMMON_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_SHALLOW_FILE','GIT_REPLACE_REF_BASE'];
function gitRead(args){
  if(Object.keys(process.env).some(key=>key.toUpperCase().startsWith('GIT_CONFIG')||identityEnv.includes(key.toUpperCase())))throw Error('Schema-probe Git environment override denied');
  const nullFile=process.platform==='win32'?'NUL':'/dev/null';
  const env={GIT_NO_REPLACE_OBJECTS:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_SYSTEM:nullFile,GIT_CONFIG_GLOBAL:nullFile,GIT_ATTR_NOSYSTEM:'1',GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_COUNT:'4',GIT_CONFIG_KEY_0:'core.fsmonitor',GIT_CONFIG_VALUE_0:'false',GIT_CONFIG_KEY_1:'core.hooksPath',GIT_CONFIG_VALUE_1:nullFile,GIT_CONFIG_KEY_2:'core.excludesFile',GIT_CONFIG_VALUE_2:nullFile,GIT_CONFIG_KEY_3:'core.attributesFile',GIT_CONFIG_VALUE_3:nullFile};
  for(const key of ['PATH','Path','SystemRoot','SYSTEMROOT','WINDIR','PATHEXT','TEMP','TMP'])if(process.env[key]!==undefined)env[key]=process.env[key];
  return execFileSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true,env});
}
function expectedGitDir(){const entry=path.join(repo,'.git'),st=fs.lstatSync(entry);if(st.isSymbolicLink())throw Error('Schema-probe Git symlink denied');if(st.isDirectory())return fs.realpathSync(entry);const match=/^gitdir: ([^\r\n]+)\r?\n?$/.exec(safeBytes(entry).toString('utf8'));if(!match)throw Error('Invalid schema-probe Git entry');return fs.realpathSync(path.resolve(repo,match[1]));}
function fileRecord(file){try{fs.lstatSync(file);}catch(error){if(error.code!=='ENOENT')throw error;return {exists:false,bytes:null};}return {exists:true,bytes:safeBytes(file).toString('base64')};}
function canonicalSource(){
  const top=gitRead(['rev-parse','--show-toplevel']).trim(),gitDir=gitRead(['rev-parse','--absolute-git-dir']).trim();
  if(path.resolve(top)!==path.resolve(repo)||path.resolve(gitDir)!==expectedGitDir())throw Error('Schema-probe repository location changed');
  const identity=gitRead(['rev-parse','--path-format=absolute','HEAD','HEAD^{tree}','--git-common-dir','--git-dir']).trim().split(/\r?\n/),head=identity[0]+'\n',tree=identity[1]+'\n',roots=identity.slice(2),status=gitRead(['status','--porcelain','--untracked-files=all']);
  if(identity.length!==4||!/^[a-f0-9]{40}$/.test(identity[0])||!/^[a-f0-9]{40}$/.test(identity[1]))throw Error('Invalid schema-probe Git identity');
  const index=gitRead(['ls-files','--stage','-v','-z']),indexFlags=index;
  const staged=gitRead(['diff','--cached','--raw','--no-ext-diff','--no-textconv','-z','HEAD']),worktree=gitRead(['diff','--raw','--no-ext-diff','--no-textconv','-z']);
  const replaceRefs=gitRead(['for-each-ref','refs/replace','--format=%(refname) %(objectname)']),parents=gitRead(['show','--no-patch','--format=%P','HEAD']);
  const overrides={};
  for(const root of new Set(roots))for(const relative of ['info/grafts','shallow','objects/info/alternates']){const file=path.resolve(repo,root,relative);overrides[file]=fileRecord(file);}
  if(replaceRefs.trim()||Object.values(overrides).some(record=>record.exists))throw Error('Schema-probe source Git identity override denied');
  let ancestor;try{gitRead(['merge-base','--is-ancestor',SCHEMA_PROBE_POLICY.sourceBase,head.trim()]);ancestor=true;}catch(error){if(error.status!==1)throw error;ancestor=false;}
  const source={top,gitDir,head,tree,status,index,indexFlags,staged,worktree,ancestry:{base:SCHEMA_PROBE_POLICY.sourceBase,ancestor,replaceRefs,parents,overrides}};
  validateSource(source);return source;
}
function validateSource(source,expectedHead=null){
  if(expectedHead!==null&&source.head.trim()!==expectedHead||!source.ancestry.ancestor||source.ancestry.replaceRefs.trim()||Object.values(source.ancestry.overrides).some(record=>record.exists)||source.staged||source.worktree||source.indexFlags.split('\0').some(line=>line&&(line[0]==='S'||line[0]===line[0].toLowerCase()))||source.status.split(/\r?\n/).some(l=>l&&!l.slice(3).startsWith('.claude/')&&!l.slice(3).startsWith('scripts/evaluation/runtime/')&&!l.slice(3).startsWith('apps/skill-registry/.evaluation/')))throw Error('Schema-probe reviewed source or Git identity changed');
}
function claimRecords(){const records={},claim=path.join(repo,SCHEMA_PROBE_POLICY.claim);for(const suffix of ['', '.attempt.json','.published.json','.blocked.json','.lock','.next'])records[suffix]=fileRecord(claim+suffix);return records;}
function canonicalBoundary(){
  const before=canonicalSource(),records=claimRecords(),after=canonicalSource();
  if(!equal(before,after))throw Error('Schema-probe source changed across record trailer');
  const finalRecords=claimRecords();if(!equal(records,finalRecords))throw Error('Schema-probe records changed across source trailer');
  return {source:after,records:finalRecords};
}
// Mandatory for any future execution integration. Marker presence never grants
// execution: repeat this complete stable vector immediately before any network.
function captureClaimEvidence(){
  const start=canonicalBoundary();
  const predecessors={};
  for(const relative of Object.keys(SCHEMA_PROBE_ORIGIN)){const raw=safeBytes(path.join(repo,relative));predecessors[relative]={bytes:raw.toString('base64'),sha256:sha(raw)};}
  const records=claimRecords(),end=canonicalBoundary();
  if(!equal(start,end)||!equal(records,end.records))throw Error('Schema-probe evidence capture changed across trailer');
  // The final trailer is the bounded linearization point. Writers must cooperate
  // with the same publication/dispatch lock. Non-cooperating filesystem mutation
  // after this trailer is outside the scaffold guarantee. The live controller
  // must repeat this same bracketed capture under its dispatch lock immediately
  // before network. No claim authorizes a network operation on its own.
  return {...end.source,predecessors,records:end.records};
}
function stableClaimEvidence(expectedHead=null,expectedClaimDigest=null,ownPublicationLock=false){
  const first=captureClaimEvidence(),second=captureClaimEvidence();
  if(!equal(first,second))throw Error('Schema-probe evidence vector changed');
  const vector=first;
  validateSource(vector,expectedHead);
  for(const [relative,digest]of Object.entries(SCHEMA_PROBE_ORIGIN))if(vector.predecessors[relative].sha256!==digest)throw Error('Frozen schema-probe predecessor changed');
  for(const suffix of ['.next','.blocked.json'])if(vector.records[suffix].exists)throw Error('Schema-probe publication unfinished or held');
  if(ownPublicationLock?!vector.records['.lock'].exists||vector.records['.lock'].bytes!=='':vector.records['.lock'].exists)throw Error('Schema-probe publication lock changed or held');
  for(const suffix of ['','.attempt.json','.published.json'])if(!vector.records[suffix].exists)throw Error('Schema-probe publication missing');
  const raw=Buffer.from(vector.records[''].bytes,'base64'),record=inputSnapshot(JSON.parse(raw)),attempt=inputSnapshot(JSON.parse(Buffer.from(vector.records['.attempt.json'].bytes,'base64'))),published=inputSnapshot(JSON.parse(Buffer.from(vector.records['.published.json'].bytes,'base64')));
  inputKeys(record,['activation','sha256']);inputKeys(attempt,['schemaVersion','claimDigest']);inputKeys(published,['schemaVersion','claimDigest','reviewedHead']);
  const value=record.activation;inputKeys(value,['policy','predecessorDigests','activation','executionWindow','paidRequests']);inputKeys(value.activation,['reviewedHead','reviews','scaffoldDigest']);
  const head=vector.head.trim(),claimDigest=sha(raw),validated=schemaProbeActivation(createSchemaProbeScaffold(),{reviewedHead:published.reviewedHead,currentHead:head,reviews:value.activation.reviews});
  if(expectedHead!==null&&head!==expectedHead||expectedClaimDigest!==null&&claimDigest!==expectedClaimDigest||typeof record.sha256!=='string'||attempt.schemaVersion!==1||published.schemaVersion!==1||attempt.claimDigest!==claimDigest||published.claimDigest!==claimDigest||record.sha256!==hash(validated)||!equal(value,validated))throw Error('Schema-probe publication binding changed');
  return {activation:validated,claimDigest};
}
// All cooperative source/evidence writers, publication, readers and future live
// dispatch MUST hold this one fixed guard. A crash leaves it held; no recovery or
// stale-lock deletion is provided. The owner releases only its unchanged inode.
// Future execution must repeat the bracketed capture immediately before network
// while holding this guard through dispatch. Post-trailer non-cooperating writes
// remain outside this bounded scaffold guarantee.
export function withSchemaProbeGuard(operation){
  if(typeof operation!=='function')throw Error('Schema-probe guarded operation required');
  const file=path.join(repo,SCHEMA_PROBE_POLICY.claim+'.guard');let at=path.parse(file).root;
  for(const part of path.dirname(file).slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.lstatSync(at).isSymbolicLink())throw Error('Schema-probe guard symlink denied');}
  const fd=fs.openSync(file,'wx',0o600),owner=fs.fstatSync(fd);let release=true;
  try{
    fs.fsyncSync(fd);const result=operation();
    if(result!==null&&['object','function'].includes(typeof result)){
      // Fence before inspection. Native Promise branding works across realms
      // and cannot be hidden by an own `then`. Never invoke a then accessor or
      // proxy trap; suspicious results and any inspection failure retain guard.
      release=false;
      if(types.isPromise(result)||types.isProxy(result)||typeof result==='function')throw Error('Schema-probe asynchronous guard result denied; retained');
      let depth=0;
      for(let at=result;at!==null;at=Object.getPrototypeOf(at)){
        if(++depth>12||types.isProxy(at)||Object.hasOwn(Object.getOwnPropertyDescriptors(at),'then'))throw Error('Schema-probe thenable guard result denied; retained');
      }
      const snapshot=inputSnapshot(result);release=true;return snapshot;
    }
    return result;
  }
  finally{fs.closeSync(fd);if(release){const current=fs.lstatSync(file);if(current.dev!==owner.dev||current.ino!==owner.ino||current.size!==0||current.isSymbolicLink())throw Error('Schema-probe guard ownership changed; retained');fs.unlinkSync(file);}}
}
export function readSchemaProbeClaim(){return withSchemaProbeGuard(()=>stableClaimEvidence().activation);}
// Publishing creates only an immutable claim. It cannot start a window or a count.
// A paid execution path must be separately implemented, reviewed and authorized.
export function publishSchemaProbeClaim(args){
  const clean=inputSnapshot(args);inputKeys(clean,['initialize','reviewedHead','reviews']);
  if(clean.initialize!==true)throw Error('Explicit schema-probe claim initialization required');
  return withSchemaProbeGuard(()=>publishGuardedSchemaProbeClaim(clean));
}
function publishGuardedSchemaProbeClaim(args){
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
    const {claimDigest}=stableClaimEvidence(reviewedHead,sha(innerSerialized),true);
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
