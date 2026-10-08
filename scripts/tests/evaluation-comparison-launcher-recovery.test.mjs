import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {comparisonLauncherRecoveryPaths,publishComparisonLauncherRecovery,readComparisonLauncherRecovery,COMPARISON_LAUNCHER_RECOVERY_ORIGIN} from '../evaluation/comparison-launcher-recovery.mjs';

const sourceRoot=fileURLToPath(new URL('../..',import.meta.url));
const originNames=['comparison-357-1.claim.json','comparison-357-1.claim.json.attempt.json','comparison-357-1.claim.json.published.json','comparison-357-1.authorization.json'];
const git=(root,args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
const gitEnvironmentNames=()=>Object.keys(process.env).filter(key=>key.toUpperCase().startsWith('GIT_CONFIG')||['GIT_DIR','GIT_COMMON_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_SHALLOW_FILE','GIT_REPLACE_REF_BASE'].includes(key.toUpperCase()));
function withoutGitOverrides(operation){const saved=Object.fromEntries(gitEnvironmentNames().map(key=>[key,process.env[key]]));for(const key of Object.keys(saved))delete process.env[key];try{return operation();}finally{Object.assign(process.env,saved);}}
function writeReview(file,head,model,changed={}){fs.writeFileSync(file,JSON.stringify({head,model,effort:'high',status:'READY',findings:[],...changed})+'\n');}
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'comparison-launcher-recovery-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const runtime=path.join(root,'scripts/evaluation/runtime');fs.mkdirSync(runtime,{recursive:true});
 for(const name of originNames)fs.copyFileSync(path.join(sourceRoot,'scripts/evaluation/runtime',name),path.join(runtime,name));
 fs.writeFileSync(path.join(root,'reviewed.txt'),'reviewed source\n');git(root,['init','--quiet']);git(root,['config','core.autocrlf','false']);git(root,['add','reviewed.txt']);git(root,['-c','user.name=Recovery test','-c','user.email=recovery@example.invalid','commit','--quiet','-m','Reviewed recovery source']);
 const head=git(root,['rev-parse','HEAD']),paths=comparisonLauncherRecoveryPaths(root);writeReview(paths.solReview,head,'gpt-6.1-sol');writeReview(paths.astraReview,head,'gpt-6-astra');return {root,runtime,head,paths};
}
function publish(f){return withoutGitOverrides(()=>publishComparisonLauncherRecovery({recover:true,reviewedHead:f.head,root:f.root}));}

test('one-time recovery preserves origin bytes and publishes an exact effective head without execution',t=>{
 const f=fixture(t),before=originNames.map(name=>fs.readFileSync(path.join(f.runtime,name)));const result=publish(f),identity=readComparisonLauncherRecovery({root:f.root,currentHead:f.head});
 assert.equal(result.reviewedHead,f.head);assert.equal(result.originHead,COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead);assert.match(result.recoveryDigest,/^[a-f0-9]{64}$/);assert.equal(result.executionWindowStarted,false);assert.equal(result.paidRequests,0);assert.deepEqual(identity.reviews.map(review=>review.model),['gpt-6.1-sol','gpt-6-astra']);assert.equal(fs.existsSync(f.paths.workspace),false);assert.equal(fs.existsSync(f.paths.guard),false);assert.ok(fs.existsSync(f.paths.attempt));assert.ok(fs.existsSync(f.paths.published));assert.throws(()=>publish(f),/already attempted|replay/);
 originNames.forEach((name,index)=>assert.deepEqual(fs.readFileSync(path.join(f.runtime,name)),before[index]));
});

test('workspace, ledger, execution window, paid request, halt, or native packet evidence blocks recovery',t=>{
 const cases=[
  ['workspace',f=>fs.mkdirSync(f.paths.workspace,{recursive:true})],
  ['ledger',f=>{fs.mkdirSync(f.paths.workspace,{recursive:true});fs.writeFileSync(f.paths.ledger,'{}');}],
  ['window',f=>{fs.mkdirSync(f.paths.workspace,{recursive:true});fs.writeFileSync(f.paths.executionWindow,'{}');}],
  ['paid request',f=>{fs.mkdirSync(f.paths.workspace,{recursive:true});fs.writeFileSync(path.join(f.paths.workspace,'compare1_api_behavior_A.count-attempt.json'),'{}');}],
  ['halt',f=>fs.writeFileSync(f.paths.halt,'{}')],
  ['native packet',f=>{fs.mkdirSync(f.paths.workspace,{recursive:true});fs.writeFileSync(path.join(f.paths.workspace,'compare1_native_behavior_B.native-state.json'),'{}');}]
 ];
 for(const [label,create]of cases){const f=fixture(t);create(f);assert.throws(()=>publish(f),/execution evidence/,label);assert.equal(fs.existsSync(f.paths.attempt),false,label);assert.equal(fs.existsSync(f.paths.file),false,label);}
});

test('altered original claim, publication markers, or authorization block recovery',t=>{
 for(const name of originNames){const f=fixture(t),file=path.join(f.runtime,name);fs.appendFileSync(file,' ');assert.throws(()=>publish(f),/Original comparison|authorization binding/,name);assert.equal(fs.existsSync(f.paths.attempt),false,name);}
});

test('stale head and stale, missing, malformed, or non-independent reviews cannot recover',t=>{
 {const f=fixture(t);assert.throws(()=>withoutGitOverrides(()=>publishComparisonLauncherRecovery({recover:true,reviewedHead:'0'.repeat(40),root:f.root})),/current recovery head/);}
 for(const mutate of [
  f=>writeReview(f.paths.solReview,COMPARISON_LAUNCHER_RECOVERY_ORIGIN.reviewedHead,'gpt-6.1-sol'),
  f=>writeReview(f.paths.astraReview,f.head,'gpt-6-astra',{status:'BLOCKED'}),
  f=>writeReview(f.paths.astraReview,f.head,'gpt-6.1-sol'),
  f=>fs.unlinkSync(f.paths.solReview),
  f=>fs.appendFileSync(f.paths.astraReview,'{}')
 ]){const f=fixture(t);mutate(f);assert.throws(()=>publish(f));assert.equal(fs.existsSync(f.paths.file),false);}
});

test('durable attempt, torn next, missing publication, tamper, and later-head replay all fail closed',t=>{
 {const f=fixture(t);fs.writeFileSync(f.paths.attempt,'{}\n');assert.throws(()=>readComparisonLauncherRecovery({root:f.root,currentHead:f.head}),/incomplete/);assert.throws(()=>publish(f),/already attempted|replay/);}
 {const f=fixture(t);fs.writeFileSync(f.paths.next,'{}\n');assert.throws(()=>readComparisonLauncherRecovery({root:f.root,currentHead:f.head}),/incomplete/);assert.throws(()=>publish(f),/already attempted|replay/);}
 {const f=fixture(t);publish(f);const marker=fs.readFileSync(f.paths.published);fs.unlinkSync(f.paths.published);assert.throws(()=>readComparisonLauncherRecovery({root:f.root,currentHead:f.head}),/incomplete/);assert.throws(()=>publish(f),/already attempted|replay/);fs.writeFileSync(f.paths.published,marker);fs.appendFileSync(f.paths.file,' ');assert.throws(()=>readComparisonLauncherRecovery({root:f.root,currentHead:f.head}));}
 {const f=fixture(t);publish(f);fs.writeFileSync(path.join(f.root,'later.txt'),'later\n');git(f.root,['add','later.txt']);git(f.root,['-c','user.name=Recovery test','-c','user.email=recovery@example.invalid','commit','--quiet','-m','Later source']);const later=git(f.root,['rev-parse','HEAD']);assert.notEqual(later,f.head);assert.throws(()=>readComparisonLauncherRecovery({root:f.root,currentHead:later}),/binding changed/);}
});

test('an existing common guard is never removed or treated as stale',t=>{
 const f=fixture(t);fs.writeFileSync(f.paths.guard,'');assert.throws(()=>publish(f));assert.equal(fs.existsSync(f.paths.guard),true);assert.equal(fs.existsSync(f.paths.attempt),false);
});
