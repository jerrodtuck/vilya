import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
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
  assert.throws(()=>publishSchemaProbeClaim({initialize:false,reviewedHead:head,reviews}),/Explicit/);
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
  return {root,args,fixture,before,git,claimFile:path.join(root,fixture.SCHEMA_PROBE_POLICY.claim)};
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
  const published=JSON.parse(fs.readFileSync(claimFile+'.published.json'));assert.equal(published.claimDigest,marker.claimDigest);assert.equal(published.reviewedHead,args.reviewedHead);
  assert.deepEqual(fixture.readSchemaProbeClaim().activation.reviews,args.reviews);
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
test('clock callback reentrancy is fenced before any count or generation',async()=>{
  const store=offlineSchemaProbeStore(),provider=fake();let nested,entered=false;
  const clock=()=>{
    if(!entered){entered=true;assert.equal(store.read().status,'authorizing');nested=runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'nested',clock:()=>1000});}
    return 1000;
  };
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'outer',clock});
  await assert.rejects(nested,/no replay/);assert.deepEqual(provider.calls.map(c=>c[0]),['count','generation']);
  assert.equal(result.newCountCalls,1);assert.equal(result.newGenerations,1);assert.equal(result.consumedTrialSlots,5);assert.equal(result.consumedCountCalls,6);
});
test('count and generation callback reentrancy cannot overwrite authoritative pending state',async()=>{
  for(const callback of ['count','send']){
    const store=offlineSchemaProbeStore(),provider=fake(),original=provider[callback];
    provider[callback]=async(...args)=>{
      assert.equal(store.read().status,callback==='count'?'count-pending':'generation-pending');
      await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'nested',clock:()=>1000}),/no replay/);
      return original(...args);
    };
    const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'outer',clock:()=>1000});
    assert.deepEqual(provider.calls.map(c=>c[0]),['count','generation']);assert.equal(result.newGenerations,1);assert.equal(result.consumedTrialSlots,5);assert.equal(result.consumedCountCalls,6);
  }
});
test('invalid or throwing clock leaves a stopped fence and cannot replay',async()=>{
  for(const clock of [()=>-1,()=>{throw Error('synthetic clock failure');}]){
    const store=offlineSchemaProbeStore(),provider=fake();
    await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock}));
    assert.equal(store.read().status,'stopped');assert.equal(provider.calls.length,0);assert.equal(store.read().consumedTrialSlots,4);assert.equal(store.read().consumedCountCalls,5);
    await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000}),/no replay/);
  }
});
test('initial clock rejects invalid samples and unsafe deadline addition before any adapter',async()=>{
  for(const value of [NaN,undefined,Infinity,-Infinity,1.5,-1,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER-59999]){
    const store=offlineSchemaProbeStore(),provider=fake();let samples=0;
    await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>{samples++;return value;}}));
    assert.equal(samples,1);assert.equal(provider.calls.length,0);assert.equal(store.read().status,'stopped');assert.equal(store.read().held,361646);assert.equal(store.read().newTrialSlots,0);
  }
});
test('each count-boundary clock sample is checked once; invalid, expired and rollback samples never send',async()=>{
  for(const value of [NaN,undefined,Infinity,-Infinity,1000.5,-1,Number.MAX_SAFE_INTEGER,61000,999]){
    const store=offlineSchemaProbeStore(),provider=fake(),sequence=[1000,value,1000];let samples=0;
    const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>sequence[samples++]});
    assert.equal(samples,2);assert.deepEqual(provider.calls.map(c=>c[0]),['count']);assert.equal(result.status,'stopped');assert.equal(result.newGenerations,0);assert.equal(result.reservation,0);assert.equal(result.held,361646);assert.equal(result.exposure,372575);assert.equal(result.cost,null);
  }
});
test('each settlement clock sample is checked once; invalid, expired and rollback samples hold the full reservation',async()=>{
  for(const value of [NaN,undefined,Infinity,-Infinity,1001.5,-1,Number.MAX_SAFE_INTEGER,61000,1000]){
    const store=offlineSchemaProbeStore(),provider=fake(),sequence=[1000,1001,value,1002];let samples=0;
    const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>sequence[samples++]});
    assert.equal(samples,3);assert.deepEqual(provider.calls.map(c=>c[0]),['count','generation']);assert.equal(result.status,'stopped');assert.equal(result.newGenerations,1);assert.ok(result.reservation>0);assert.equal(result.held,361646+result.reservation);assert.equal(result.exposure,372575+result.reservation);assert.equal(result.known,10929);assert.equal(result.cost,null);
  }
});
test('valid checkpoints record monotonically increasing lastTime with exactly three samples',async()=>{
  const store=offlineSchemaProbeStore(),provider=fake(),sequence=[1000,1001,1002];let samples=0;
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>sequence[samples++]});
  assert.equal(samples,3);assert.equal(result.lastTime,1002);assert.notEqual(result.cost,null);assert.equal(result.held,361646);
});
test('accessor, proxy and malformed generation evidence cannot release reservation or erase carry',async()=>{
  const good=()=>({input:128,cachedInput:0,cacheWrite:0,output:40,reasoning:10,fees:0});
  let getterReads=0,proxyReads=0;
  const badResults=[
    ()=>Object.defineProperty({},'usage',{get(){getterReads++;return getterReads===1?good():{...good(),output:-1000000};},enumerable:true}),
    ()=>({usage:Object.defineProperty(good(),'input',{get(){getterReads++;throw Error('malicious getter');},enumerable:true})}),
    ()=>new Proxy({usage:good()},{get(target,key){if(key==='then')return undefined;proxyReads++;throw Error('malicious proxy');},ownKeys(){proxyReads++;throw Error('malicious proxy');}}),
    ()=>({usage:new Proxy(good(),{get(){proxyReads++;throw Error('malicious usage proxy');}})}),
    ()=>({usage:{...good(),output:-1}}),()=>({usage:{...good(),input:Number.MAX_SAFE_INTEGER+1}}),
    ()=>({usage:{...good(),output:1.5}}),()=>({usage:{...good(),fees:NaN}}),()=>({usage:{...good(),fees:Infinity}}),
    ()=>({usage:{...good(),extra:0}}),()=>({usage:good(),extra:0}),
    ()=>({usage:Object.assign(Object.create({input:128}),{cachedInput:0,cacheWrite:0,output:40,reasoning:10,fees:0})})
  ];
  for(const create of badResults){
    const store=offlineSchemaProbeStore(),provider=fake();provider.send=async()=>create();
    const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
    assert.equal(result.status,'stopped');assert.equal(result.cost,null);assert.ok(result.reservation>0);assert.equal(result.known,10929);assert.equal(result.held,361646+result.reservation);assert.equal(result.exposure,372575+result.reservation);assert.equal(result.known+result.held,result.exposure);
    await assert.rejects(runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic'}),/replay/);
  }
  assert.equal(getterReads,0);assert.equal(proxyReads,0);
});
test('settlement uses a frozen data snapshot and ignores later mutation of the returned usage object',async()=>{
  const store=offlineSchemaProbeStore(),provider=fake(),usage={input:128,cachedInput:0,cacheWrite:0,output:40,reasoning:10,fees:0};
  provider.send=async()=>{setTimeout(()=>{usage.output=-1000000;},0);return {usage};};
  const result=await runOfflineSchemaProbe({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>1000});
  await new Promise(resolve=>setTimeout(resolve,5));assert.equal(usage.output,-1000000);assert.ok(Number.isSafeInteger(result.cost));assert.ok(result.cost>=0);assert.ok(result.cost<=result.reservation);assert.equal(result.known,10929+result.cost);assert.equal(result.held,361646);assert.equal(result.exposure,372575+result.cost);
});
test('activation snapshots reject accessors and proxies at every caller-controlled layer without invoking getters',()=>{
  let reads=0;
  const accessor=(object,key)=>Object.defineProperty(object,key,{get(){reads++;throw Error('malicious input accessor');},enumerable:true,configurable:true});
  const basic=()=>({scaffold:structuredClone(createSchemaProbeScaffold()),args:{reviewedHead:head,currentHead:head,reviews:structuredClone(reviews)}});
  const bad=[
    v=>accessor(v.scaffold,'activation'),v=>accessor(v.scaffold,'policy'),v=>accessor(v.scaffold.policy,'nativeEnabled'),v=>accessor(v.scaffold.policy,'retries'),
    v=>accessor(v.scaffold.policy,'carry'),v=>accessor(v.scaffold.policy.carry,'known'),v=>accessor(v.scaffold,'predecessorDigests'),
    v=>accessor(v.scaffold.predecessorDigests,Object.keys(v.scaffold.predecessorDigests)[0]),
    v=>accessor(v.scaffold.policy.consumedSlotHistory,'0'),v=>accessor(v.scaffold.policy.consumedSlotHistory[0],'slots'),
    v=>accessor(v.args,'reviews'),v=>accessor(v.args.reviews,'0'),v=>accessor(v.args,'reviewedHead'),v=>accessor(v.args,'currentHead'),
    ...['head','receiptDigest','model','effort','status'].map(key=>v=>accessor(v.args.reviews[0],key)),
    v=>{v.scaffold=new Proxy(v.scaffold,{});},v=>{v.scaffold.policy=new Proxy(v.scaffold.policy,{});},v=>{v.scaffold.policy.carry=new Proxy(v.scaffold.policy.carry,{});},
    v=>{v.scaffold.predecessorDigests=new Proxy(v.scaffold.predecessorDigests,{});},v=>{v.args=new Proxy(v.args,{});},v=>{v.args.reviews=new Proxy(v.args.reviews,{});},v=>{v.args.reviews[0]=new Proxy(v.args.reviews[0],{});},
    v=>{v.args.reviews[0]=Object.assign(Object.create({extra:true}),v.args.reviews[0]);},v=>{v.scaffold.policy.carry.extra=0;},v=>{v.args.reviews[0].extra=0;},
    v=>{v.args.reviews.extra=0;},v=>{delete v.args.reviews[0];},v=>{v.args.extra=0;},v=>{v.scaffold.extra=0;}
  ];
  for(const mutate of bad){const value=basic();mutate(value);assert.throws(()=>schemaProbeActivation(value.scaffold,value.args));}
  assert.equal(reads,0);
});
test('validated activation retains inert reviews and reconstructed policy despite later caller mutation',()=>{
  const scaffold=structuredClone(createSchemaProbeScaffold()),args={reviewedHead:head,currentHead:head,reviews:structuredClone(reviews)};
  const activated=schemaProbeActivation(scaffold,args);
  scaffold.policy.nativeEnabled=true;scaffold.policy.retries=999;scaffold.policy.carry.held=0;scaffold.predecessorDigests[Object.keys(scaffold.predecessorDigests)[0]]='0'.repeat(64);
  for(const field of ['head','receiptDigest','model','effort','status'])args.reviews[0][field]='changed';
  assert.deepEqual(activated.policy,SCHEMA_PROBE_POLICY);assert.deepEqual(activated.predecessorDigests,SCHEMA_PROBE_ORIGIN);assert.deepEqual(activated.activation.reviews,reviews);assert.throws(()=>{activated.activation.reviews[0].head='changed';},TypeError);
});
test('publisher rejects malformed own-data inputs before creating any publication attempt',()=>{
  let reads=0;
  for(const field of ['initialize','reviewedHead','reviews']){const args={initialize:true,reviewedHead:head,reviews:structuredClone(reviews)};Object.defineProperty(args,field,{get(){reads++;throw Error('malicious publisher getter');},enumerable:true});assert.throws(()=>publishSchemaProbeClaim(args));}
  for(const field of ['head','receiptDigest','model','effort','status']){const args={initialize:true,reviewedHead:head,reviews:structuredClone(reviews)};Object.defineProperty(args.reviews[0],field,{get(){reads++;return 'changing';},enumerable:true});assert.throws(()=>publishSchemaProbeClaim(args));}
  assert.throws(()=>publishSchemaProbeClaim(new Proxy({initialize:true,reviewedHead:head,reviews},{})));assert.equal(reads,0);
});
test('publisher claim uses its validated snapshot if caller reviews mutate during publication',async t=>{
  const {args,fixture,claimFile}=await publicationFixture(t),original=fs.openSync,expected=structuredClone(args.reviews);
  fs.openSync=function(file,...rest){if(file===claimFile+'.lock'){args.initialize=false;args.reviewedHead='changed';for(const field of ['head','receiptDigest','model','effort','status'])args.reviews[0][field]='changed';}return original.call(fs,file,...rest);};
  try{fixture.publishSchemaProbeClaim(args);}finally{fs.openSync=original;}
  const claim=JSON.parse(fs.readFileSync(claimFile));assert.deepEqual(claim.activation.activation.reviews,expected);assert.equal(claim.activation.policy.nativeEnabled,false);assert.equal(claim.activation.policy.retries,0);
});
test('activation requires primitive strings before regex matching or receipt deduplication',()=>{
  const scaffold=createSchemaProbeScaffold(),digest='a'.repeat(64),args=()=>({reviewedHead:head,currentHead:head,reviews:structuredClone(reviews)});
  for(const value of [[digest],[[digest]],new String(digest),Symbol(digest)]){
    const changed=args();changed.reviews[1].receiptDigest=value;assert.throws(()=>schemaProbeActivation(scaffold,changed));
  }
  for(const values of [[digest,[digest]],[[digest],[digest]],[[[digest]],[[digest]]],[digest,digest]]){
    const changed=args();changed.reviews[0].receiptDigest=values[0];changed.reviews[1].receiptDigest=values[1];assert.throws(()=>schemaProbeActivation(scaffold,changed));
  }
  for(const field of ['reviewedHead','currentHead'])for(const value of [[head],[[head]],new String(head),Symbol(head)]){const changed=args();changed[field]=value;assert.throws(()=>schemaProbeActivation(scaffold,changed));}
  for(const field of ['model','effort','status','head']){
    for(const wrap of [value=>[value],value=>[[value]],value=>new String(value),value=>Symbol(value)]){const changed=args();changed.reviews[0][field]=wrap(changed.reviews[0][field]);assert.throws(()=>schemaProbeActivation(scaffold,changed));}
  }
  const valid=schemaProbeActivation(scaffold,args());assert.equal(typeof valid.activation.reviews[0].receiptDigest,'string');assert.notEqual(valid.activation.reviews[0].receiptDigest,valid.activation.reviews[1].receiptDigest);
});
test('Git head, source and ancestry changes at lock acquisition or linking leave publication held',async t=>{
  for(const checkpoint of ['lock','link'])for(const change of ['head','dirty','ancestry']){
    const {root,args,fixture,git,claimFile}=await publicationFixture(t),originalOpen=fs.openSync,originalLink=fs.linkSync;
    let changed=false;
    const mutate=()=>{
      changed=true;
      if(change==='head')git(['-c','user.name=Synthetic probe','-c','user.email=offline@example.invalid','commit','--quiet','--allow-empty','-m','Unreviewed source head']);
      else if(change==='dirty')fs.appendFileSync(path.join(root,'fixture.txt'),'unreviewed source edit');
      else git(['replace','--graft',args.reviewedHead]);
    };
    if(checkpoint==='lock')fs.openSync=function(file,...rest){if(file===claimFile+'.lock'&&!changed)mutate();return originalOpen.call(fs,file,...rest);};
    else fs.linkSync=function(from,to){if(to===claimFile&&!changed)mutate();return originalLink.call(fs,from,to);};
    try{assert.throws(()=>fixture.publishSchemaProbeClaim(args));}finally{fs.openSync=originalOpen;fs.linkSync=originalLink;}
    assert.equal(changed,true,checkpoint+' '+change);assert.equal(fs.existsSync(claimFile+'.attempt.json'),true);assert.equal(fs.existsSync(claimFile+'.published.json'),false);
    assert.throws(()=>fixture.publishSchemaProbeClaim(args));
    if(checkpoint==='lock')assert.equal(fs.existsSync(claimFile),false);
    else assert.equal(fs.existsSync(claimFile),true); // Frozen bytes exist, but no completion marker authorizes them.
  }
});
test('mutations during completion marker open, write, fsync or close cannot return publication success',async t=>{
  for(const checkpoint of ['openSync','writeFileSync','fsyncSync','closeSync']){
    const {args,fixture,git,claimFile}=await publicationFixture(t),originals=Object.fromEntries(['openSync','writeFileSync','fsyncSync','closeSync'].map(key=>[key,fs[key]]));
    let markerFd,changed=false;
    const mutate=()=>{changed=true;git(['-c','user.name=Synthetic probe','-c','user.email=offline@example.invalid','commit','--quiet','--allow-empty','-m','Marker source mutation']);};
    fs.openSync=function(file,...rest){const fd=originals.openSync.call(fs,file,...rest);if(file===claimFile+'.published.json'){markerFd=fd;if(checkpoint==='openSync')mutate();}return fd;};
    for(const key of ['writeFileSync','fsyncSync','closeSync'])fs[key]=function(fd,...rest){const result=originals[key].call(fs,fd,...rest);if(fd===markerFd&&key===checkpoint&&!changed)mutate();return result;};
    try{assert.throws(()=>fixture.publishSchemaProbeClaim(args));}finally{Object.assign(fs,originals);}
    assert.equal(changed,true);assert.equal(fs.existsSync(claimFile+'.attempt.json'),true);assert.equal(fs.existsSync(claimFile),true);
    assert.equal(fs.existsSync(claimFile+'.blocked.json'),true);
    assert.throws(()=>fixture.readSchemaProbeClaim());assert.throws(()=>fixture.publishSchemaProbeClaim(args));
    git(['reset','--hard',args.reviewedHead]);assert.throws(()=>fixture.readSchemaProbeClaim(),/held/);
  }
});
test('stable source snapshots reject mutation inside every Git checkpoint and future reads recheck source',async t=>{
  for(const command of [1,2,3,4]){
    const {args,fixture,git,claimFile}=await publicationFixture(t),originalOpen=fs.openSync,originalClose=fs.closeSync,originalExec=childProcess.execFileSync;
    let markerFd,armed=false,commands=0,changed=false;
    fs.openSync=function(file,...rest){const fd=originalOpen.call(fs,file,...rest);if(file===claimFile+'.published.json')markerFd=fd;return fd;};
    fs.closeSync=function(fd,...rest){const result=originalClose.call(fs,fd,...rest);if(fd===markerFd)armed=true;return result;};
    childProcess.execFileSync=function(binary,argv,...rest){
      if(armed&&binary==='git'&&++commands===command&&!changed){changed=true;armed=false;git(['-c','user.name=Synthetic probe','-c','user.email=offline@example.invalid','commit','--quiet','--allow-empty','-m','Git checkpoint mutation']);}
      return originalExec.call(childProcess,binary,argv,...rest);
    };syncBuiltinESMExports();
    try{assert.throws(()=>fixture.publishSchemaProbeClaim(args));}finally{fs.openSync=originalOpen;fs.closeSync=originalClose;childProcess.execFileSync=originalExec;syncBuiltinESMExports();}
    assert.equal(changed,true);assert.throws(()=>fixture.readSchemaProbeClaim());
  }
  const {args,fixture,git}=await publicationFixture(t);fixture.publishSchemaProbeClaim(args);fixture.readSchemaProbeClaim();
  git(['-c','user.name=Synthetic probe','-c','user.email=offline@example.invalid','commit','--quiet','--allow-empty','-m','After final snapshot mutation']);assert.throws(()=>fixture.readSchemaProbeClaim());
});
test('claim reader rejects missing, tampered or unfinished paired publication evidence',async t=>{
  const {args,fixture,claimFile}=await publicationFixture(t);fixture.publishSchemaProbeClaim(args);
  for(const suffix of ['','.attempt.json','.published.json']){
    const file=claimFile+suffix,raw=fs.readFileSync(file);fs.unlinkSync(file);assert.throws(()=>fixture.readSchemaProbeClaim());
    fs.writeFileSync(file,'{}');assert.throws(()=>fixture.readSchemaProbeClaim());fs.writeFileSync(file,raw);
  }
  for(const suffix of ['.lock','.next','.blocked.json']){fs.writeFileSync(claimFile+suffix,'held');assert.throws(()=>fixture.readSchemaProbeClaim());fs.unlinkSync(claimFile+suffix);}
  fixture.readSchemaProbeClaim();
});
test('complete vectors catch dirty source and ancestry changes during every predecessor read without a HEAD change',async t=>{
  const {root,args,fixture,git}=await publicationFixture(t);fixture.publishSchemaProbeClaim(args);
  const originalRead=fs.readFileSync,sourceFile=path.join(root,'fixture.txt'),sourceBytes=originalRead(sourceFile);
  for(const relative of Object.keys(SCHEMA_PROBE_ORIGIN))for(const change of ['dirty','ancestry']){
    let changed=false;
    fs.readFileSync=function(file,...rest){const raw=originalRead.call(fs,file,...rest);if(file===path.join(root,relative)&&!changed){changed=true;if(change==='dirty')fs.appendFileSync(sourceFile,'dirty without new HEAD');else git(['replace','--graft',args.reviewedHead]);}return raw;};
    try{assert.throws(()=>fixture.readSchemaProbeClaim(),/vector|source|binding/);}finally{fs.readFileSync=originalRead;fs.writeFileSync(sourceFile,sourceBytes);if(change==='ancestry')git(['replace','--delete',args.reviewedHead]);}
    assert.equal(changed,true);assert.equal(git(['rev-parse','HEAD']),args.reviewedHead);
  }
  fixture.readSchemaProbeClaim();
});
test('complete vectors catch late hold insertion and replacement of every paired record',async t=>{
  const {args,fixture,claimFile}=await publicationFixture(t);fixture.publishSchemaProbeClaim(args);
  const originalStat=fs.lstatSync,originalRead=fs.readFileSync;
  for(const suffix of ['.blocked.json','.lock','.next']){
    const file=claimFile+suffix;let changed=false;
    fs.lstatSync=function(target,...rest){try{return originalStat.call(fs,target,...rest);}catch(error){if(target===file&&!changed&&error.code==='ENOENT'){changed=true;fs.writeFileSync(file,'late hold');}throw error;}};
    try{assert.throws(()=>fixture.readSchemaProbeClaim(),/vector|held/);}finally{fs.lstatSync=originalStat;fs.unlinkSync(file);}
    assert.equal(changed,true);
  }
  for(const suffix of ['','.attempt.json','.published.json']){
    const file=claimFile+suffix,original=originalRead(file);let changed=false;
    fs.readFileSync=function(target,...rest){const raw=originalRead.call(fs,target,...rest);if(target===file&&!changed){changed=true;fs.writeFileSync(file,Buffer.concat([original,Buffer.from(' ')]));}return raw;};
    try{assert.throws(()=>fixture.readSchemaProbeClaim(),/vector/);}finally{fs.readFileSync=originalRead;fs.writeFileSync(file,original);}
    assert.equal(changed,true);
  }
  fixture.readSchemaProbeClaim();
});
test('publisher final vector detects dirty edits and hold insertion during final predecessor hashing',async t=>{
  for(const change of ['dirty','.blocked.json','.lock','.next']){
    const {root,args,fixture,claimFile}=await publicationFixture(t),originalRead=fs.readFileSync,originalOpen=fs.openSync,originalClose=fs.closeSync;
    let markerFd,armed=false,changed=false;
    fs.openSync=function(file,...rest){const fd=originalOpen.call(fs,file,...rest);if(file===claimFile+'.published.json')markerFd=fd;return fd;};
    fs.closeSync=function(fd,...rest){const result=originalClose.call(fs,fd,...rest);if(fd===markerFd)armed=true;return result;};
    const target=path.join(root,Object.keys(SCHEMA_PROBE_ORIGIN)[0]);
    fs.readFileSync=function(file,...rest){const raw=originalRead.call(fs,file,...rest);if(file===target&&armed&&!changed){changed=true;if(change==='dirty')fs.appendFileSync(path.join(root,'fixture.txt'),'late dirty source');else fs.writeFileSync(claimFile+change,'late hold');}return raw;};
    try{assert.throws(()=>fixture.publishSchemaProbeClaim(args));}finally{fs.readFileSync=originalRead;fs.openSync=originalOpen;fs.closeSync=originalClose;}
    assert.equal(changed,true);assert.throws(()=>fixture.readSchemaProbeClaim());
  }
});
