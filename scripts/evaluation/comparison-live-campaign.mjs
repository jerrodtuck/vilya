// Immutable claim publication and separate activation; neither starts the execution clock.
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
import {COMPARISON_ORIGIN,COMPARISON_POLICY,createComparisonScaffold} from './comparison-campaign.mjs';
export {COMPARISON_ORIGIN,COMPARISON_POLICY,createComparisonScaffold};
const predecessor='scripts/evaluation/runtime/campaign-schema-diagnostic-1/';
function validateScaffold(value){if(!equal(value,createComparisonScaffold()))throw Error('Immutable comparison scaffold changed');}
function inputSnapshot(value,seen=new Set(),depth=0){
  if(value===null||['string','boolean'].includes(typeof value))return value;
  if(typeof value==='number'&&Number.isSafeInteger(value))return value;
  if(!value||typeof value!=='object'||types.isProxy(value)||depth>12||seen.has(value))throw Error('Invalid comparison input data');
  seen.add(value);
  try{
    if(Array.isArray(value)){
      if(Object.getPrototypeOf(value)!==Array.prototype)throw Error('Inherited comparison array denied');
      const fields=Object.getOwnPropertyDescriptors(value),length=fields.length?.value;
      if(!Number.isSafeInteger(length)||length<0||length>2048||Reflect.ownKeys(fields).length!==length+1)throw Error('Invalid comparison array fields');
      const result=[];
      for(let i=0;i<length;i++){const field=fields[String(i)];if(!field||!Object.hasOwn(field,'value'))throw Error('Accessor comparison array denied');result.push(inputSnapshot(field.value,seen,depth+1));}
      return freeze(result);
    }
    const fields=ownData(value),result={};
    if(Object.keys(fields).length>128)throw Error('Comparison input bound');
    for(const [key,field]of Object.entries(fields))Object.defineProperty(result,key,{value:inputSnapshot(field.value,seen,depth+1),enumerable:true});
    return freeze(result);
  }finally{seen.delete(value);}
}
function inputKeys(value,names){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!==[...names].sort().join())throw Error('Invalid comparison input fields');}
export function comparisonActivation(scaffold,args){
  const cleanScaffold=inputSnapshot(scaffold),cleanArgs=inputSnapshot(args);
  inputKeys(cleanArgs,['reviewedHead','currentHead','reviews']);
  const {reviewedHead,currentHead,reviews}=cleanArgs;
  validateScaffold(cleanScaffold);
  if(typeof reviewedHead!=='string'||typeof currentHead!=='string'||!/^[a-f0-9]{40}$/.test(reviewedHead)||reviewedHead!==currentHead)throw Error('Exact reviewed comparison head required');
  if(!Array.isArray(reviews)||reviews.length!==2)throw Error('Two comparison reviews required');
  const digests=new Set();
  for(const [i,model]of ['gpt-6.1-sol','gpt-6-astra'].entries()){
    const r=reviews[i];
    if(!r||Object.keys(r).sort().join()!==['model','effort','status','head','receiptDigest'].sort().join()||['model','effort','status','head','receiptDigest'].some(key=>typeof r[key]!=='string')||r.model!==model||r.effort!=='high'||r.status!=='READY'||r.head!==reviewedHead||!/^[a-f0-9]{64}$/.test(r.receiptDigest)||digests.has(r.receiptDigest))throw Error('Comparison review stale or invalid');
    digests.add(r.receiptDigest);
  }
  return freeze({...createComparisonScaffold(),activation:{reviewedHead,reviews,scaffoldDigest:hash(cleanScaffold)},executionWindow:null,paidRequests:0});
}
function safeBytes(file){let at=path.parse(file).root;for(const part of file.slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw Error('Comparison symlink denied');}const st=fs.statSync(file);if(!st.isFile()||st.nlink!==1||st.size>8000000)throw Error('Comparison evidence bound');return fs.readFileSync(file);}
export function verifyComparisonPredecessor(){for(const [relative,digest]of Object.entries(COMPARISON_ORIGIN))if(sha(safeBytes(path.join(repo,relative)))!==digest)throw Error('Frozen comparison predecessor changed');return true;}
function sourceSnapshot(reviewedHead){
  const before=canonicalSource();verifyComparisonPredecessor();const after=canonicalSource();
  if(!equal(before,after))throw Error('Comparison source snapshot changed');
  validateSource(after,reviewedHead);return after.head.trim();
}
const identityEnv=['GIT_DIR','GIT_COMMON_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_SHALLOW_FILE','GIT_REPLACE_REF_BASE'];
function gitRead(args){
  if(Object.keys(process.env).some(key=>key.toUpperCase().startsWith('GIT_CONFIG')||identityEnv.includes(key.toUpperCase())))throw Error('Comparison Git environment override denied');
  const nullFile=process.platform==='win32'?'NUL':'/dev/null';
  const env={GIT_NO_REPLACE_OBJECTS:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_SYSTEM:nullFile,GIT_CONFIG_GLOBAL:nullFile,GIT_ATTR_NOSYSTEM:'1',GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_COUNT:'4',GIT_CONFIG_KEY_0:'core.fsmonitor',GIT_CONFIG_VALUE_0:'false',GIT_CONFIG_KEY_1:'core.hooksPath',GIT_CONFIG_VALUE_1:nullFile,GIT_CONFIG_KEY_2:'core.excludesFile',GIT_CONFIG_VALUE_2:nullFile,GIT_CONFIG_KEY_3:'core.attributesFile',GIT_CONFIG_VALUE_3:nullFile};
  for(const key of ['PATH','Path','SystemRoot','SYSTEMROOT','WINDIR','PATHEXT','TEMP','TMP'])if(process.env[key]!==undefined)env[key]=process.env[key];
  return execFileSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true,env});
}
function expectedGitDir(){const entry=path.join(repo,'.git'),st=fs.lstatSync(entry);if(st.isSymbolicLink())throw Error('Comparison Git symlink denied');if(st.isDirectory())return fs.realpathSync(entry);const match=/^gitdir: ([^\r\n]+)\r?\n?$/.exec(safeBytes(entry).toString('utf8'));if(!match)throw Error('Invalid comparison Git entry');return fs.realpathSync(path.resolve(repo,match[1]));}
function fileRecord(file){try{fs.lstatSync(file);}catch(error){if(error.code!=='ENOENT')throw error;return {exists:false,bytes:null};}return {exists:true,bytes:safeBytes(file).toString('base64')};}
function canonicalSource(){
  const top=gitRead(['rev-parse','--show-toplevel']).trim(),gitDir=gitRead(['rev-parse','--absolute-git-dir']).trim();
  if(path.resolve(top)!==path.resolve(repo)||path.resolve(gitDir)!==expectedGitDir())throw Error('Comparison repository location changed');
  const identity=gitRead(['rev-parse','--path-format=absolute','HEAD','HEAD^{tree}','--git-common-dir','--git-dir']).trim().split(/\r?\n/),head=identity[0]+'\n',tree=identity[1]+'\n',roots=identity.slice(2),status=gitRead(['status','--porcelain','--untracked-files=all']);
  if(identity.length!==4||!/^[a-f0-9]{40}$/.test(identity[0])||!/^[a-f0-9]{40}$/.test(identity[1]))throw Error('Invalid comparison Git identity');
  const index=gitRead(['ls-files','--stage','-v','-z']),indexFlags=index;
  const staged=gitRead(['diff','--cached','--raw','--no-ext-diff','--no-textconv','-z','HEAD']),worktree=gitRead(['diff','--raw','--no-ext-diff','--no-textconv','-z']);
  const replaceRefs=gitRead(['for-each-ref','refs/replace','--format=%(refname) %(objectname)']),parents=gitRead(['show','--no-patch','--format=%P','HEAD']);
  const overrides={};
  for(const root of new Set(roots))for(const relative of ['info/grafts','shallow','objects/info/alternates']){const file=path.resolve(repo,root,relative);overrides[file]=fileRecord(file);}
  if(replaceRefs.trim()||Object.values(overrides).some(record=>record.exists))throw Error('Comparison source Git identity override denied');
  let ancestor;try{gitRead(['merge-base','--is-ancestor',COMPARISON_POLICY.sourceBase,head.trim()]);ancestor=true;}catch(error){if(error.status!==1)throw error;ancestor=false;}
  const source={top,gitDir,head,tree,status,index,indexFlags,staged,worktree,ancestry:{base:COMPARISON_POLICY.sourceBase,ancestor,replaceRefs,parents,overrides}};
  validateSource(source);return source;
}
function validateSource(source,expectedHead=null){
  if(expectedHead!==null&&source.head.trim()!==expectedHead||!source.ancestry.ancestor||source.ancestry.replaceRefs.trim()||Object.values(source.ancestry.overrides).some(record=>record.exists)||source.staged||source.worktree||source.indexFlags.split('\0').some(line=>line&&(line[0]==='S'||line[0]===line[0].toLowerCase()))||source.status.split(/\r?\n/).some(l=>l&&!l.slice(3).startsWith('.claude/')&&!l.slice(3).startsWith('scripts/evaluation/runtime/')&&!l.slice(3).startsWith('apps/skill-registry/.evaluation/')))throw Error('Comparison reviewed source or Git identity changed');
}
function claimRecords(){const records={},claim=path.join(repo,COMPARISON_POLICY.claim);for(const suffix of ['', '.attempt.json','.published.json','.blocked.json','.lock','.next'])records[suffix]=fileRecord(claim+suffix);return records;}
function canonicalBoundary(){
  const before=canonicalSource(),records=claimRecords(),after=canonicalSource();
  if(!equal(before,after))throw Error('Comparison source changed across record trailer');
  const finalRecords=claimRecords();if(!equal(records,finalRecords))throw Error('Comparison records changed across source trailer');
  return {source:after,records:finalRecords};
}
// Mandatory for any future execution integration. Marker presence never grants
// execution: repeat this complete stable vector immediately before any network.
function captureClaimEvidence(){
  const start=canonicalBoundary();
  const predecessors={};
  for(const relative of Object.keys(COMPARISON_ORIGIN)){const raw=safeBytes(path.join(repo,relative));predecessors[relative]={bytes:raw.toString('base64'),sha256:sha(raw)};}
  const records=claimRecords(),end=canonicalBoundary();
  if(!equal(start,end)||!equal(records,end.records))throw Error('Comparison evidence capture changed across trailer');
  // The final trailer is the bounded linearization point. Writers must cooperate
  // with the same publication/dispatch lock. Non-cooperating filesystem mutation
  // after this trailer is outside the scaffold guarantee. The live controller
  // must repeat this same bracketed capture under its dispatch lock immediately
  // before network. No claim authorizes a network operation on its own.
  const reviews=Object.fromEntries(['sol','astra'].map(name=>{const raw=safeBytes(path.join(repo,'scripts/evaluation/runtime/comparison-357-1.'+name+'-review.json'));return [name,{sha256:sha(raw),value:JSON.parse(raw)}];}));
  return {...end.source,predecessors,records:end.records,reviews};
}
function stableClaimEvidence(expectedHead=null,expectedClaimDigest=null,ownPublicationLock=false){
  const first=captureClaimEvidence(),second=captureClaimEvidence();
  if(!equal(first,second))throw Error('Comparison evidence vector changed');
  const vector=first;
  validateSource(vector,expectedHead);
  for(const [relative,digest]of Object.entries(COMPARISON_ORIGIN))if(vector.predecessors[relative].sha256!==digest)throw Error('Frozen comparison predecessor changed');
  for(const suffix of ['.next','.blocked.json'])if(vector.records[suffix].exists)throw Error('Comparison publication unfinished or held');
  if(ownPublicationLock?!vector.records['.lock'].exists||vector.records['.lock'].bytes!=='':vector.records['.lock'].exists)throw Error('Comparison publication lock changed or held');
  for(const suffix of ['','.attempt.json','.published.json'])if(!vector.records[suffix].exists)throw Error('Comparison publication missing');
  const raw=Buffer.from(vector.records[''].bytes,'base64'),record=inputSnapshot(JSON.parse(raw)),attempt=inputSnapshot(JSON.parse(Buffer.from(vector.records['.attempt.json'].bytes,'base64'))),published=inputSnapshot(JSON.parse(Buffer.from(vector.records['.published.json'].bytes,'base64')));
  inputKeys(record,['activation','sha256']);inputKeys(attempt,['schemaVersion','claimDigest']);inputKeys(published,['schemaVersion','claimDigest','reviewedHead']);
  const value=record.activation;inputKeys(value,['policy','predecessorDigests','activation','executionWindow','paidRequests']);inputKeys(value.activation,['reviewedHead','reviews','scaffoldDigest']);
  const head=vector.head.trim(),claimDigest=sha(raw),validated=comparisonActivation(createComparisonScaffold(),{reviewedHead:published.reviewedHead,currentHead:head,reviews:value.activation.reviews});
  if(expectedHead!==null&&head!==expectedHead||expectedClaimDigest!==null&&claimDigest!==expectedClaimDigest||typeof record.sha256!=='string'||attempt.schemaVersion!==1||published.schemaVersion!==1||attempt.claimDigest!==claimDigest||published.claimDigest!==claimDigest||record.sha256!==hash(validated)||!equal(value,validated))throw Error('Comparison publication binding changed');
  for(const [i,name]of ['sol','astra'].entries()){const actual=vector.reviews[name],review=validated.activation.reviews[i];if(actual.sha256!==review.receiptDigest||actual.value.head!==review.head||actual.value.model!==review.model||actual.value.effort!=='high'||actual.value.status!=='READY'||!Array.isArray(actual.value.findings)||actual.value.findings.length)throw Error('Exact READY review receipt required');}
  return {activation:validated,claimDigest};
}
// All cooperative source/evidence writers, publication, readers and future live
// dispatch MUST hold this one fixed guard. A crash leaves it held; no recovery or
// stale-lock deletion is provided. The owner releases only its unchanged inode.
// Future execution must repeat the bracketed capture immediately before network
// while holding this guard through dispatch. Post-trailer non-cooperating writes
// remain outside this bounded scaffold guarantee.
export function withComparisonGuard(operation){
  if(typeof operation!=='function')throw Error('Comparison guarded operation required');
  const file=path.join(repo,COMPARISON_POLICY.claim+'.guard');let at=path.parse(file).root;
  for(const part of path.dirname(file).slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.lstatSync(at).isSymbolicLink())throw Error('Comparison guard symlink denied');}
  const fd=fs.openSync(file,'wx',0o600),owner=fs.fstatSync(fd);let release=true;
  try{
    fs.fsyncSync(fd);const result=operation();
    if(result!==null&&['object','function'].includes(typeof result)){
      // Fence before inspection. Native Promise branding works across realms
      // and cannot be hidden by an own `then`. Never invoke a then accessor or
      // proxy trap; suspicious results and any inspection failure retain guard.
      release=false;
      if(types.isPromise(result)||types.isProxy(result)||typeof result==='function')throw Error('Comparison asynchronous guard result denied; retained');
      let depth=0;
      for(let at=result;at!==null;at=Object.getPrototypeOf(at)){
        if(++depth>12||types.isProxy(at)||Object.hasOwn(Object.getOwnPropertyDescriptors(at),'then'))throw Error('Comparison thenable guard result denied; retained');
      }
      const snapshot=inputSnapshot(result);release=true;return snapshot;
    }
    return result;
  }
  finally{fs.closeSync(fd);if(release){const current=fs.lstatSync(file);if(current.dev!==owner.dev||current.ino!==owner.ino||current.size!==0||current.isSymbolicLink())throw Error('Comparison guard ownership changed; retained');fs.unlinkSync(file);}}
}
export function readComparisonClaim(){return withComparisonGuard(()=>stableClaimEvidence().activation);}
// A branded lease bridges the synchronous evidence boundary and async dispatch.
// No callback is accepted. Crash recovery never removes a retained guard.
const leases=new WeakMap();
export function acquireComparisonLease(){
  const file=path.join(repo,COMPARISON_POLICY.claim+'.guard');
  let at=path.parse(file).root;
  for(const part of path.dirname(file).slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.lstatSync(at).isSymbolicLink())throw Error('Comparison guard symlink denied');}
  const fd=fs.openSync(file,'wx',0o600),owner=fs.fstatSync(fd);
  fs.fsyncSync(fd);const token=Object.freeze({});leases.set(token,{file,fd,owner});return token;
}
function leaseOwner(token){
  const lease=leases.get(token);if(!lease)throw Error('Invalid comparison lease');
  const st=fs.lstatSync(lease.file);
  if(st.isSymbolicLink()||st.dev!==lease.owner.dev||st.ino!==lease.owner.ino||st.size!==0)throw Error('Comparison guard ownership changed; retained');
  return lease;
}
export function readComparisonClaimLocked(token){leaseOwner(token);const value=stableClaimEvidence().activation;leaseOwner(token);return value;}
export function closeComparisonLease(token){const lease=leaseOwner(token);leases.delete(token);fs.closeSync(lease.fd);fs.unlinkSync(lease.file);}
// Publishing creates only an immutable claim. It cannot start a window or a count.
// A paid execution path must be separately implemented, reviewed and authorized.
export function publishComparisonClaim(args){
  const clean=inputSnapshot(args);inputKeys(clean,['initialize','reviewedHead','reviews']);
  if(clean.initialize!==true)throw Error('Explicit comparison claim initialization required');
  return withComparisonGuard(()=>publishGuardedComparisonClaim(clean));
}
function publishGuardedComparisonClaim(args){
  const cleanArgs=inputSnapshot(args);inputKeys(cleanArgs,['initialize','reviewedHead','reviews']);
  const {initialize,reviewedHead,reviews}=cleanArgs;
  if(initialize!==true)throw Error('Explicit comparison claim initialization required');
  const currentHead=sourceSnapshot(reviewedHead);
  verifyComparisonPredecessor();
  const activation=comparisonActivation(createComparisonScaffold(),{reviewedHead,currentHead,reviews});
  const claim=path.join(repo,COMPARISON_POLICY.claim),workspace=path.join(repo,COMPARISON_POLICY.workspace),marker=claim+'.attempt.json',published=claim+'.published.json',blocked=claim+'.blocked.json';
  // Parent directories must exist and be unlinked; publication never creates runtime.
  fs.realpathSync(path.dirname(claim));safeBytes(path.join(repo,predecessor+'pilot-budget.json'));
  for(const file of [claim,marker,published,blocked,claim+'.lock',claim+'.next',workspace])if(fs.existsSync(file))throw Error('Comparison claim already attempted; replay denied');
  let lock,output,attempt,ownsAttempt=false;
  const serialized=JSON.stringify({activation,sha256:hash(activation)})+'\n';
  try{
    lock=fs.openSync(claim+'.lock','wx',0o600);
    // The durable marker is never removed, even after a torn publication. A stale
    // contender that passed prechecks cannot become a second publisher.
    attempt=fs.openSync(marker,'wx',0o600);
    ownsAttempt=true;
    fs.writeFileSync(attempt,JSON.stringify({schemaVersion:1,claimDigest:sha(serialized)})+'\n');fs.fsyncSync(attempt);fs.closeSync(attempt);attempt=undefined;
    for(const file of [claim,claim+'.next',workspace])if(fs.existsSync(file))throw Error('Comparison publication torn; replay denied');
    verifyComparisonPredecessor();
    const innerHead=sourceSnapshot(reviewedHead),innerActivation=comparisonActivation(createComparisonScaffold(),{reviewedHead,currentHead:innerHead,reviews});
    const innerSerialized=JSON.stringify({activation:innerActivation,sha256:hash(innerActivation)})+'\n';
    if(innerSerialized!==serialized)throw Error('Comparison activation snapshot changed');
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

function ownData(value){
  if(!value||typeof value!=='object'||types.isProxy(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Invalid comparison generation evidence');
  const descriptors=Object.getOwnPropertyDescriptors(value);
  if(Reflect.ownKeys(descriptors).some(key=>typeof key!=='string'||!Object.hasOwn(descriptors[key],'value')))throw Error('Accessor comparison evidence denied');
  return descriptors;
}

export function activateComparisonClaim({reviewedHead,userAuthorized,windowMinutes,newTrialSlots}) {
 if(userAuthorized!==true||windowMinutes!==180||newTrialSlots!==12)throw Error('Fixed comparison authorization required');
 return withComparisonGuard(()=>{const claim=stableClaimEvidence(reviewedHead);const file=path.join(repo,COMPARISON_POLICY.authorization),record={schemaVersion:1,campaignId:COMPARISON_POLICY.campaignId,reviewedHead,windowMinutes:180,newTrialSlots:12,userAuthorized:true};const fd=fs.openSync(file,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify(record)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}return {claimDigest:claim.claimDigest,authorizationDigest:sha(safeBytes(file)),executionWindowStarted:false,paidRequests:0};});
}
