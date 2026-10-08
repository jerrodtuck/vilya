import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createSchemaProbeScaffold,schemaProbeActivation,SCHEMA_PROBE_POLICY,SCHEMA_PROBE_ORIGIN,offlineSchemaProbeStore,runOfflineSchemaProbe,publishSchemaProbeClaim} from '../evaluation/schema-probe-campaign.mjs';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const head='1'.repeat(40),reviews=['gpt-6.1-sol','gpt-6-astra'].map((model,i)=>({model,effort:'high',status:'READY',head,receiptDigest:String(i+1).repeat(64)}));
function fake({lost=false,badCount=false,rejectedContent=false}={}){const calls=[];return {kind:'fake',calls,async count(packet){calls.push(['count',packet]);return {inputTokens:128,payloadHash:badCount?'0'.repeat(64):hash(packet)};},async send(packet){calls.push(['generation',packet]);if(lost)throw Error('fake unresolved schema');return {text:rejectedContent?null:'fake',usage:{input:128,cachedInput:0,cacheWrite:0,output:40,reasoning:10,fees:0}};}};}
test('fresh immutable scaffold binds final predecessor and carries exposure once without starting',()=>{
  const scaffold=createSchemaProbeScaffold(),p=scaffold.policy;
  assert.equal(scaffold.executionWindow,null);assert.equal(scaffold.activation,null);assert.equal(scaffold.paidRequests,0);
  assert.equal(p.carry.known+p.carry.held,p.carry.exposure);assert.equal(p.carry.exposure,372575);assert.equal(p.carry.countCalls,5);assert.equal(p.carry.consumedTrialSlots,4);
  assert.equal(p.consumedSlotHistory.reduce((n,h)=>n+h.slots,0),4);assert.equal(Object.keys(SCHEMA_PROBE_ORIGIN).length,7);
  assert.equal(p.maximumGenerations,1);assert.equal(p.maximumNewCountCalls,1);assert.equal(p.nativeEnabled,false);assert.equal(p.retries,0);
  assert.equal(p.diagnosticProjectionVersion,2);assert.equal(p.financialContractVersion,3);assert.equal(p.trialCap,2000000);assert.equal(p.totalCap,25000000);
  assert.throws(()=>{p.carry.exposure=0;},TypeError);assert.equal(createSchemaProbeScaffold().policy.carry.exposure,372575);
});
test('activation requires two distinct exact-head READY reviews and leaves the window null',()=>{
  const scaffold=createSchemaProbeScaffold(),args={reviewedHead:head,currentHead:head,reviews};
  const activated=schemaProbeActivation(scaffold,args);assert.equal(activated.executionWindow,null);assert.equal(activated.paidRequests,0);
  assert.throws(()=>schemaProbeActivation(scaffold,{...args,currentHead:'2'.repeat(40)}));
  assert.throws(()=>schemaProbeActivation(scaffold,{...args,reviews:reviews.slice(0,1)}));
  for(const key of ['head','status','model','receiptDigest']){const changed=structuredClone(reviews);changed[1][key]=changed[0][key];if(key==='head'||key==='status')changed[1][key]='stale';assert.throws(()=>schemaProbeActivation(scaffold,{...args,reviews:changed}));}
  const changed=structuredClone(scaffold);changed.policy.carry.held+=1;assert.throws(()=>schemaProbeActivation(changed,args));
  assert.throws(()=>publishSchemaProbeClaim({initialize:false}),/Explicit/);
});
test('fake proof makes one exact count and one generation then stops with no replay',async()=>{
  const store=offlineSchemaProbeStore(),provider=fake();
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
  assert.deepEqual(provider.calls.map(c=>c[0]),['count','generation']);assert.equal(result.status,'stopped');assert.equal(result.newCountCalls,1);assert.equal(result.newGenerations,1);
  assert.equal(result.exposure,372575+result.cost);assert.equal(result.known,10929+result.cost);assert.equal(result.held,361646);assert.equal(result.known+result.held,result.exposure);
  assert.equal(result.carriedCountCalls,5);assert.equal(result.carriedTrialSlots,4);
  assert.equal(result.consumedCountCalls,6);assert.equal(result.newTrialSlots,1);assert.equal(result.consumedTrialSlots,5);assert.equal(result.consumedSlotHistory.reduce((n,h)=>n+h.slots,0),5);
  assert.deepEqual(provider.calls[0][1],provider.calls[1][1]);assert.equal(provider.calls[0][1].maxToolCalls,0);
  await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic'}),/no replay/);
  const reset=store.read();reset.status='scaffold';assert.equal(store.read().status,'stopped');assert.equal(store.write,undefined);
  assert.equal(provider.calls.length,2);assert.equal(SCHEMA_PROBE_POLICY.carry.exposure,372575);
});
test('unknown generation holds its full reservation and a count mismatch never sends',async()=>{
  for(const badCount of [false,true]){
    const store=offlineSchemaProbeStore(),provider=fake({lost:true,badCount});
    const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
    assert.equal(result.status,'stopped');assert.equal(result.cost,null);assert.equal(result.known,10929);
    assert.equal(result.exposure,372575+result.reservation);assert.equal(result.held,361646+result.reservation);assert.equal(result.known+result.held,result.exposure);
    assert.equal(result.newGenerations,badCount?0:1);assert.equal(provider.calls.length,badCount?1:2);
    assert.equal(result.newTrialSlots,1);assert.equal(result.consumedTrialSlots,5);assert.equal(result.consumedCountCalls,6);
    await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'again'}));
  }
});
test('every result stops, and scaffold initialization cannot authorize any count or live transport',async()=>{
  const store=offlineSchemaProbeStore(),provider=fake({rejectedContent:true});
  await assert.rejects(runOfflineSchemaProbe({store,provider,prompt:'synthetic'}),/authorization/);assert.equal(store.read().executionWindow,null);assert.equal(provider.calls.length,0);
  await assert.rejects(runOfflineSchemaProbe({store,provider:{...provider,kind:'live'},authorizeSyntheticWindow:true,prompt:'synthetic'}),/live unavailable/);assert.equal(provider.calls.length,0);
  await assert.rejects(runOfflineSchemaProbe({store:{read:store.read,write:store.write},provider,authorizeSyntheticWindow:true,prompt:'synthetic'}));
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
  assert.equal(result.status,'stopped');assert.notEqual(result.cost,null);assert.equal(result.newGenerations,1);
});
test('persisted pending fence forbids reentrant dispatch and expired count never sends',async()=>{
  const store=offlineSchemaProbeStore(),provider=fake();let now=1000;
  provider.count=async packet=>{assert.equal(store.read().status,'count-pending');await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'reentrant'}),/no replay/);now=61000;return {payloadHash:hash(packet),inputTokens:128};};
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>now});
  assert.equal(result.status,'stopped');assert.equal(result.newGenerations,0);assert.equal(result.exposure,372575);
});
async function publicationFixture(t){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'schema-probe-fake-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
  git(['init','--quiet']);fs.writeFileSync(path.join(root,'fixture.txt'),'synthetic');git(['add','.']);
  const commit=()=>git(['-c','user.name=Synthetic probe','-c','user.email=offline@example.invalid','commit','--quiet','-m','Synthetic offline fixture']);
  commit();const base=git(['rev-parse','HEAD']),digests={},before={};
  for(const relative of Object.keys(SCHEMA_PROBE_ORIGIN)){
    const file=path.join(root,relative),raw=Buffer.from('synthetic frozen '+relative);
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,raw);before[file]=raw;digests[relative]=crypto.createHash('sha256').update(raw).digest('hex');
  }
  const source=fileURLToPath(new URL('../evaluation/schema-probe-campaign.mjs',import.meta.url));
  const moduleFile=path.join(root,'scripts/evaluation/schema-probe-campaign.mjs');
  const money=pathToFileURL(fileURLToPath(new URL('../evaluation/money.mjs',import.meta.url))).href;
  fs.writeFileSync(moduleFile,fs.readFileSync(source,'utf8')
    .replace("from './money.mjs'",'from '+JSON.stringify(money))
    .replace(/export const SCHEMA_PROBE_ORIGIN=freeze\(\{[\s\S]*?\n\}\);/,'export const SCHEMA_PROBE_ORIGIN=freeze('+JSON.stringify(digests)+');')
    .replace('1901738149a5833063e3759ebfbc3721254d0e1c',base));
  git(['add','scripts/evaluation/schema-probe-campaign.mjs']);commit();
  const current=git(['rev-parse','HEAD']),args={initialize:true,reviewedHead:current,reviews:reviews.map(r=>({...r,head:current}))};
  const fixture=await import(pathToFileURL(moduleFile).href);
  return {root,args,fixture,before,claimFile:path.join(root,fixture.SCHEMA_PROBE_POLICY.claim)};
}
test('disposable fake publication writes only one claim, preserves predecessor bytes and never starts a window',async t=>{
  const {root,args,fixture,before,claimFile}=await publicationFixture(t);
  const evidenceFile=Object.keys(before)[0];fs.appendFileSync(evidenceFile,'changed');assert.throws(()=>fixture.publishSchemaProbeClaim(args),/predecessor/);fs.writeFileSync(evidenceFile,before[evidenceFile]);
  const result=fixture.publishSchemaProbeClaim(args);assert.equal(result.executionWindowStarted,false);assert.equal(result.paidRequests,0);
  const claim=JSON.parse(fs.readFileSync(path.join(root,fixture.SCHEMA_PROBE_POLICY.claim)));
  assert.equal(claim.activation.executionWindow,null);assert.equal(claim.activation.paidRequests,0);
  assert.equal(fs.existsSync(path.join(root,fixture.SCHEMA_PROBE_POLICY.workspace)),false);
  assert.throws(()=>fixture.publishSchemaProbeClaim(args),/replay/);
  for(const [file,raw]of Object.entries(before))assert.deepEqual(fs.readFileSync(file),raw);
  const marker=JSON.parse(fs.readFileSync(claimFile+'.attempt.json'));assert.equal(marker.claimDigest,crypto.createHash('sha256').update(fs.readFileSync(claimFile)).digest('hex'));
});
test('stale concurrent contender cannot replace the winning claim after passing prechecks',async t=>{
  const {args,fixture,claimFile}=await publicationFixture(t),original=fs.openSync;
  const winnerArgs={...args,reviews:args.reviews.map((r,i)=>({...r,receiptDigest:String(i+3).repeat(64)}))};
  let winner,winningBytes,interleaved=false;
  fs.openSync=function(file,...rest){
    if(file===claimFile+'.lock'&&!interleaved){
      interleaved=true;fs.openSync=original;
      winner=fixture.publishSchemaProbeClaim(winnerArgs);winningBytes=fs.readFileSync(claimFile);
    }
    return original.call(fs,file,...rest);
  };
  try{assert.throws(()=>fixture.publishSchemaProbeClaim(args),/EEXIST|attempted|replay/);}finally{fs.openSync=original;}
  assert.equal(interleaved,true);assert.equal(winner.paidRequests,0);assert.deepEqual(fs.readFileSync(claimFile),winningBytes);
  assert.equal(JSON.parse(winningBytes).activation.activation.reviews[0].receiptDigest,'3'.repeat(64));
  assert.throws(()=>fixture.publishSchemaProbeClaim(args),/replay/);
});
test('torn marker, claim and interrupted publication remain held without overwriting evidence',async t=>{
  for(const suffix of ['.attempt.json','','.next']){
    const {args,fixture,claimFile}=await publicationFixture(t),file=claimFile+suffix;
    fs.writeFileSync(file,'torn synthetic evidence');assert.throws(()=>fixture.publishSchemaProbeClaim(args),/replay/);
    assert.equal(fs.readFileSync(file,'utf8'),'torn synthetic evidence');
  }
  const {args,fixture,claimFile}=await publicationFixture(t),original=fs.linkSync;
  fs.linkSync=()=>{throw Error('synthetic publication interruption');};
  try{assert.throws(()=>fixture.publishSchemaProbeClaim(args),/interruption/);}finally{fs.linkSync=original;}
  assert.equal(fs.existsSync(claimFile),false);assert.equal(fs.existsSync(claimFile+'.attempt.json'),true);assert.equal(fs.existsSync(claimFile+'.next'),true);
  const marker=fs.readFileSync(claimFile+'.attempt.json'),next=fs.readFileSync(claimFile+'.next');
  assert.throws(()=>fixture.publishSchemaProbeClaim(args),/replay/);assert.deepEqual(fs.readFileSync(claimFile+'.attempt.json'),marker);assert.deepEqual(fs.readFileSync(claimFile+'.next'),next);
});
test('count and generation adapters cannot mutate the counted packet or certificate',async()=>{
  for(const [key,value]of [['model','gpt-6-astra'],['maxToolCalls',1],['retries',2]]){
    const store=offlineSchemaProbeStore(),provider=fake();provider.count=async packet=>{packet[key]=value;return {inputTokens:128,payloadHash:hash(packet)};};
    const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
    assert.equal(result.newGenerations,0);assert.equal(provider.calls.length,0);assert.equal(result.consumedTrialSlots,5);
  }
  const store=offlineSchemaProbeStore(),provider=fake();let returned;
  provider.count=async packet=>{returned={inputTokens:128,payloadHash:hash(packet)};return returned;};
  provider.send=async(packet,certificate)=>{
    returned.inputTokens=99999;assert.equal(certificate.inputTokens,128);assert.throws(()=>{certificate.inputTokens=99999;},TypeError);assert.throws(()=>{packet.retries=2;},TypeError);
    return {usage:{input:128,cachedInput:0,cacheWrite:0,output:40,reasoning:10,fees:0}};
  };
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
  assert.equal(result.newGenerations,1);assert.notEqual(result.cost,null);
  const copy=store.read();copy.status='scaffold';copy.consumedTrialSlots=4;
  await assert.rejects(runOfflineSchemaProbe({store:{read:()=>copy},provider,authorizeSyntheticWindow:true,prompt:'synthetic'}));
  await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic'}),/replay/);assert.equal(store.read().consumedTrialSlots,5);assert.equal(store.read().consumedCountCalls,6);
});
