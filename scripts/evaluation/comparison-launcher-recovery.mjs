// One-time pre-execution source-head recovery for the comparison launcher.
// The original claim and user authorization remain immutable and authoritative.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {COMPARISON_POLICY as P} from './comparison-campaign.mjs';

const productionRoot=fileURLToPath(new URL('../..',import.meta.url));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const exactKeys=(value,keys,label)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join('|')!==[...keys].sort().join('|'))throw Error('Invalid '+label);};

export const COMPARISON_LAUNCHER_RECOVERY_ORIGIN=freeze({
 reviewedHead:'3aeb888d47ab9c630c9bbf8be287fe6c4cd76fd0',
 claimSha256:'ea8b49dbb1a0c87e17cf991e0fae0fa0fb87b087a6ddb191072a51bb6aa4058d',
 claimAttemptSha256:'441c07163f849047eb7ec97672c6e197e62af00537b795b0c7af775033f3829a',
 claimPublishedSha256:'90aa42004976fbabfbd989b15809398d8dffec329de04e61f22808dbd63ae61d',
 authorizationSha256:'00d803bc2b60f05bf7d9a5c5c61b9e17fb43d6188523d1067a84ad1dfa2ed7c9'
});

export function comparisonLauncherRecoveryPaths(root=productionRoot){
 const runtime=path.join(root,'scripts/evaluation/runtime'),file=path.join(runtime,'comparison-357-1.launcher-recovery.json'),workspace=path.join(root,P.workspace);
 return freeze({root:path.resolve(root),runtime,file,attempt:file+'.attempt.json',published:file+'.published.json',next:file+'.next',guard:path.join(root,P.claim+'.guard'),claim:path.join(root,P.claim),claimAttempt:path.join(root,P.claim+'.attempt.json'),claimPublished:path.join(root,P.claim+'.published.json'),authorization:path.join(root,P.authorization),solReview:path.join(runtime,'comparison-357-1.launcher-recovery.sol-review.json'),astraReview:path.join(runtime,'comparison-357-1.launcher-recovery.astra-review.json'),workspace,ledger:path.join(workspace,'pilot-budget.json'),executionWindow:path.join(workspace,'execution-window.json'),halt:path.join(runtime,'comparison-357-1.halt.json')});
}

function safeBytes(file,limit=8000000){
 let at=path.parse(file).root;
 for(const part of file.slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw Error('Comparison recovery symlink denied');}
 const stat=fs.statSync(file);if(!stat.isFile()||stat.nlink!==1||stat.size<1||stat.size>limit)throw Error('Comparison recovery evidence bound');return fs.readFileSync(file);
}
function record(file){try{return {exists:true,bytes:safeBytes(file).toString('base64')};}catch(error){if(error.code==='ENOENT')return {exists:false,bytes:null};throw error;}}
function parse(raw,label){let value;try{value=JSON.parse(raw);}catch{throw Error('Invalid '+label);}return value;}

function originEvidence(paths){
 const raw={claim:safeBytes(paths.claim),claimAttempt:safeBytes(paths.claimAttempt),claimPublished:safeBytes(paths.claimPublished),authorization:safeBytes(paths.authorization)};
 for(const [key,digest]of [['claim','claimSha256'],['claimAttempt','claimAttemptSha256'],['claimPublished','claimPublishedSha256'],['authorization','authorizationSha256']])if(sha(raw[key])!==COMPARISON_LAUNCHER_RECOVERY_ORIGIN[digest])throw Error('Original comparison '+key+' changed');
 const claim=parse(raw.claim,'original comparison claim'),attempt=parse(raw.claimAttempt,'original comparison claim attempt'),published=parse(raw.claimPublished,'original comparison claim publication'),authorization=parse(raw.authorization,'original comparison authorization');
 exactKeys(claim,['activation','sha256'],'original comparison claim');exactKeys(attempt,['schemaVersion','claimDigest'],'original comparison claim attempt');exactKeys(published,['schemaVersion','claimDigest','reviewedHead'],'original comparison claim publication');
 const activation=claim.activation;exactKeys(activation,['policy','predecessorDigests','activation','executionWindow','paidRequests'],'original comparison activation');exactKeys(activation.activation,['reviewedHead','reviews','scaffoldDigest'],'original comparison reviews');
 const expectedAuthorization={schemaVersion:1,campaignId:P.campaignId,reviewedHead:COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead,windowMinutes:180,newTrialSlots:12,userAuthorized:true};
 if(attempt.schemaVersion!==1||published.schemaVersion!==1||attempt.claimDigest!==COMPARISON_LAUNCHER_RECOVERY_ORIGIN.claimSha256||published.claimDigest!==COMPARISON_LAUNCHER_RECOVERY_ORIGIN.claimSha256||published.reviewedHead!==COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead||activation.activation.reviewedHead!==COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead||activation.executionWindow!==null||activation.paidRequests!==0||!same(authorization,expectedAuthorization))throw Error('Original comparison authorization binding changed');
 return raw;
}

function pristineEvidence(paths){
 if(fs.existsSync(paths.workspace)||fs.existsSync(paths.ledger)||fs.existsSync(paths.executionWindow)||fs.existsSync(paths.halt))throw Error('Comparison execution evidence already exists');
 return freeze({workspace:P.workspace,workspaceAbsent:true,ledger:P.workspace+'/pilot-budget.json',ledgerAbsent:true,executionWindow:'claim-null-and-workspace-absent',paidRequests:'claim-zero-and-workspace-absent',halt:'scripts/evaluation/runtime/comparison-357-1.halt.json',haltAbsent:true,nativePackets:'workspace-absent'});
}

function reviewEvidence(paths,reviewedHead){
 const digests=new Set();
 return freeze([['gpt-6.1-sol',paths.solReview],['gpt-6-astra',paths.astraReview]].map(([model,file])=>{
  const raw=safeBytes(file,100000),value=parse(raw,'comparison recovery review');exactKeys(value,['head','model','effort','status','findings'],'comparison recovery review');
  const digest=sha(raw);if(value.head!==reviewedHead||value.model!==model||value.effort!=='high'||value.status!=='READY'||!Array.isArray(value.findings)||value.findings.length||digests.has(digest))throw Error('Exact independent READY recovery reviews required');digests.add(digest);
  return {model,effort:'high',status:'READY',head:reviewedHead,receiptDigest:digest};
 }));
}

const identityEnv=['GIT_DIR','GIT_COMMON_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_SHALLOW_FILE','GIT_REPLACE_REF_BASE'];
function gitRead(root,args){
 if(Object.keys(process.env).some(key=>key.toUpperCase().startsWith('GIT_CONFIG')||identityEnv.includes(key.toUpperCase())))throw Error('Comparison recovery Git environment override denied');
 const nullFile=process.platform==='win32'?'NUL':'/dev/null',env={GIT_NO_REPLACE_OBJECTS:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_SYSTEM:nullFile,GIT_CONFIG_GLOBAL:nullFile,GIT_ATTR_NOSYSTEM:'1',GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_COUNT:'5',GIT_CONFIG_KEY_0:'core.fsmonitor',GIT_CONFIG_VALUE_0:'false',GIT_CONFIG_KEY_1:'core.hooksPath',GIT_CONFIG_VALUE_1:nullFile,GIT_CONFIG_KEY_2:'core.excludesFile',GIT_CONFIG_VALUE_2:nullFile,GIT_CONFIG_KEY_3:'core.attributesFile',GIT_CONFIG_VALUE_3:nullFile,GIT_CONFIG_KEY_4:'safe.directory',GIT_CONFIG_VALUE_4:path.resolve(root)};
 for(const key of ['PATH','Path','SystemRoot','SYSTEMROOT','WINDIR','PATHEXT','TEMP','TMP'])if(process.env[key]!==undefined)env[key]=process.env[key];
 return execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,env});
}
function currentReviewedHead(paths,expected){
 const top=gitRead(paths.root,['rev-parse','--show-toplevel']).trim(),head=gitRead(paths.root,['rev-parse','HEAD']).trim(),status=gitRead(paths.root,['status','--porcelain','--untracked-files=all']);
 if(path.resolve(top)!==paths.root||!/^[a-f0-9]{40}$/.test(head)||head!==expected||head===COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead||status.split(/\r?\n/).some(line=>line&&!line.slice(3).startsWith('.claude/')&&!line.slice(3).startsWith('scripts/evaluation/runtime/')))throw Error('Exact clean current recovery head required');return head;
}

function recoveryValue(paths,reviewedHead){
 originEvidence(paths);const current=currentReviewedHead(paths,reviewedHead),reviews=reviewEvidence(paths,current),preExecution=pristineEvidence(paths);
 return freeze({schemaVersion:1,campaignId:P.campaignId,scope:'pre-execution-launcher-host-compatibility-only',origin:structuredClone(COMPARISON_LAUNCHER_RECOVERY_ORIGIN),reviewedHead:current,reviews,preExecution,authorizationReused:true,resetsAllowed:false,replayAllowed:false});
}

function recoveryRecords(paths){return {file:record(paths.file),attempt:record(paths.attempt),published:record(paths.published),next:record(paths.next)};}
function recoverySnapshot(paths,currentHead,originHead,originClaimDigest){
 originEvidence(paths);const records=recoveryRecords(paths),present=Object.values(records).some(item=>item.exists);if(!present)return null;
 if(records.next.exists||!records.file.exists||!records.attempt.exists||!records.published.exists)throw Error('Comparison recovery publication incomplete');
 const raw=Buffer.from(records.file.bytes,'base64'),envelope=parse(raw,'comparison recovery'),attempt=parse(Buffer.from(records.attempt.bytes,'base64'),'comparison recovery attempt'),published=parse(Buffer.from(records.published.bytes,'base64'),'comparison recovery publication');
 exactKeys(envelope,['recovery','sha256'],'comparison recovery');exactKeys(attempt,['schemaVersion','recoveryDigest','reviewedHead'],'comparison recovery attempt');exactKeys(published,['schemaVersion','recoveryDigest','reviewedHead','originClaimDigest'],'comparison recovery publication');
 const value=envelope.recovery;exactKeys(value,['schemaVersion','campaignId','scope','origin','reviewedHead','reviews','preExecution','authorizationReused','resetsAllowed','replayAllowed'],'comparison recovery value');
 const expectedPreExecution=freeze({workspace:P.workspace,workspaceAbsent:true,ledger:P.workspace+'/pilot-budget.json',ledgerAbsent:true,executionWindow:'claim-null-and-workspace-absent',paidRequests:'claim-zero-and-workspace-absent',halt:'scripts/evaluation/runtime/comparison-357-1.halt.json',haltAbsent:true,nativePackets:'workspace-absent'}),digest=sha(raw);
 if(value.schemaVersion!==1||value.campaignId!==P.campaignId||value.scope!=='pre-execution-launcher-host-compatibility-only'||!same(value.origin,COMPARISON_LAUNCHER_RECOVERY_ORIGIN)||value.reviewedHead!==currentHead||value.reviewedHead===value.origin.reviewedHead||value.origin.reviewedHead!==originHead||value.origin.claimSha256!==originClaimDigest||!same(value.preExecution,expectedPreExecution)||value.authorizationReused!==true||value.resetsAllowed!==false||value.replayAllowed!==false||envelope.sha256!==hash(value)||attempt.schemaVersion!==1||published.schemaVersion!==1||attempt.recoveryDigest!==digest||published.recoveryDigest!==digest||attempt.reviewedHead!==value.reviewedHead||published.reviewedHead!==value.reviewedHead||published.originClaimDigest!==originClaimDigest)throw Error('Comparison recovery binding changed');
 const actualReviews=reviewEvidence(paths,currentHead);if(!same(value.reviews,actualReviews))throw Error('Comparison recovery reviews changed');
 return freeze({reviewedHead:value.reviewedHead,originHead:value.origin.reviewedHead,recoveryDigest:digest,reviews:structuredClone(value.reviews)});
}

export function readComparisonLauncherRecovery({root=productionRoot,currentHead,originHead=COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead,originClaimDigest=COMPARISON_LAUNCHER_RECOVERY_ORIGIN.claimSha256}={}){
 const paths=comparisonLauncherRecoveryPaths(root),head=currentHead??currentReviewedHead(paths,gitRead(paths.root,['rev-parse','HEAD']).trim()),first=recoverySnapshot(paths,head,originHead,originClaimDigest),second=recoverySnapshot(paths,head,originHead,originClaimDigest);if(!same(first,second))throw Error('Comparison recovery evidence changed across read');return first;
}

function withRecoveryGuard(paths,operation){
 let at=path.parse(paths.guard).root;for(const part of path.dirname(paths.guard).slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.lstatSync(at).isSymbolicLink())throw Error('Comparison recovery guard symlink denied');}
 const fd=fs.openSync(paths.guard,'wx',0o600),owner=fs.fstatSync(fd);try{fs.fsyncSync(fd);return operation();}finally{fs.closeSync(fd);const current=fs.lstatSync(paths.guard);if(current.dev!==owner.dev||current.ino!==owner.ino||current.size!==0||current.isSymbolicLink())throw Error('Comparison recovery guard ownership changed; retained');fs.unlinkSync(paths.guard);}
}

export function publishComparisonLauncherRecovery({recover,reviewedHead,root=productionRoot}){
 if(recover!==true||!/^[a-f0-9]{40}$/.test(reviewedHead??''))throw Error('Explicit exact comparison launcher recovery required');const paths=comparisonLauncherRecoveryPaths(root);
 return withRecoveryGuard(paths,()=>{
  if(Object.values(recoveryRecords(paths)).some(item=>item.exists))throw Error('Comparison launcher recovery already attempted; replay denied');
  const value=recoveryValue(paths,reviewedHead),serialized=JSON.stringify({recovery:value,sha256:hash(value)})+'\n',digest=sha(serialized);let fd;
  try{
   fd=fs.openSync(paths.attempt,'wx',0o600);fs.writeFileSync(fd,JSON.stringify({schemaVersion:1,recoveryDigest:digest,reviewedHead})+'\n');fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
   const repeated=recoveryValue(paths,reviewedHead),repeatedSerialized=JSON.stringify({recovery:repeated,sha256:hash(repeated)})+'\n';if(repeatedSerialized!==serialized)throw Error('Comparison recovery evidence changed before publication');
   fd=fs.openSync(paths.next,'wx',0o600);fs.writeFileSync(fd,serialized);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
   recoveryValue(paths,reviewedHead);fs.linkSync(paths.next,paths.file);fs.unlinkSync(paths.next);recoveryValue(paths,reviewedHead);
   fd=fs.openSync(paths.published,'wx',0o600);fs.writeFileSync(fd,JSON.stringify({schemaVersion:1,recoveryDigest:digest,reviewedHead,originClaimDigest:COMPARISON_LAUNCHER_RECOVERY_ORIGIN.claimSha256})+'\n');fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
   const identity=readComparisonLauncherRecovery({root:paths.root,currentHead:reviewedHead});return {...identity,executionWindowStarted:false,paidRequests:0};
  }finally{if(fd!==undefined)fs.closeSync(fd);}
 });
}
