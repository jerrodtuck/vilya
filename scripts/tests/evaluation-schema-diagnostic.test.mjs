import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {projectFinancialDiagnostics,validateFinancialDiagnostics,inspectFinancialResponse} from '../evaluation/financial-inspector.mjs';
import {diagnosticEvent,validateDiagnostic} from '../evaluation/diagnostics.mjs';
import {SCHEMA_DIAGNOSTIC_POLICY as policy,SCHEMA_DIAGNOSTIC_ORIGIN as origin,createSchemaDiagnosticScaffold,validateSchemaDiagnosticScaffold,verifySchemaDiagnosticPredecessor,offlineSchemaDiagnosticStore,runOfflineSchemaDiagnostic} from '../evaluation/schema-diagnostic-campaign.mjs';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('projection3 discovers bounded structural types without arbitrary values or sensitive names',()=>{
 const data={billing:{payer:'openai',amount:987654321,note:'PRIVATE_VALUE',secret_key:'PRIVATE_KEY',nested:{text:'PRIVATE_TEXT'}},allocation:{private:'PRIVATE_NESTED'},speed:123456789,mode:'PRIVATE_MODE',secret_key:'PRIVATE_KEY','bad-name':'PRIVATE_NAME',prompt_echo:'PRIVATE_PROMPT',sk_live_credentials:'PRIVATE_CREDENTIAL'};
 const before=JSON.stringify(data),projection=projectFinancialDiagnostics(data,3);validateFinancialDiagnostics(projection,3);assert.equal(JSON.stringify(data),before);
 assert.deepEqual(projection.unknownEnvelope.fields,[{name:'allocation',type:'object'},{name:'mode',type:'string'},{name:'speed',type:'number'}]);assert.equal(projection.unknownEnvelope.redactedCount,4);assert.equal(projection.billing.payer,'openai');
 const serialized=JSON.stringify(projection);assert.doesNotMatch(serialized,/PRIVATE|987654321|123456789|secret_key|bad-name|prompt_echo|sk_live_credentials/);
 for(const value of ['developer','openai','PRIVATE_KEY',null,77,true,{},[]]){const p=projectFinancialDiagnostics({billing:{payer:value}},3);assert.equal(p.billing.payer,['developer','openai'].includes(value)?value:'OTHER');validateFinancialDiagnostics(p);}
 assert.equal(projectFinancialDiagnostics({},3).billing.payer,'absent');
 const credentialProjection=projectFinancialDiagnostics({safecredential:'PRIVATE'},3,{credential:'credential'});assert.deepEqual(credentialProjection.unknownEnvelope.fields,[]);
});
test('projection3 bounds names, sorts deterministically and validates its closed output grammar',()=>{
 const data=Object.fromEntries(Array.from({length:80},(_,i)=>['field_'+String.fromCharCode(97+Math.floor(i/26))+String.fromCharCode(97+i%26),'PRIVATE']));
 const p=projectFinancialDiagnostics(data,3);validateFinancialDiagnostics(p);assert.equal(p.unknownEnvelope.fields.length,8);assert.equal(p.unknownEnvelope.overflowCount,64);assert.deepEqual(projectFinancialDiagnostics(Object.fromEntries(Object.entries(data).reverse()),3),p);
 for(const mutate of [v=>v.billing.payer='PRIVATE',v=>v.unknownEnvelope.fields[0].name='secret_key',v=>v.unknownEnvelope.fields[0].value='PRIVATE',v=>v.unknownEnvelope.fields.reverse(),v=>v.unknownEnvelope.redactedCount=65]){const bad=structuredClone(p);mutate(bad);assert.throws(()=>validateFinancialDiagnostics(bad));}
 assert.equal(projectFinancialDiagnostics(data).version,2);assert.equal(projectFinancialDiagnostics(data,1).version,1);assert.equal('unknownEnvelope' in projectFinancialDiagnostics(data,2),false);
});
test('projection3 diagnostic schema8 preserves contract3 refusal of unknown billing',()=>{
 const data={billing:{payer:'developer'},extra_scope:true},inspection=inspectFinancialResponse(data,{model:'gpt-6.1-sol',maxOutputTokens:4000},20,3);assert.equal(inspection.validated,false);
 const event=diagnosticEvent({requestId:'diag1_safe',kind:'generation',stage:'body-observed',data,clock:()=>1,billingValidated:false,billingFailureCode:'unsupported-financial-scope',financialInspection:inspection,financialContractVersion:3,diagnosticProjection:projectFinancialDiagnostics(data,3)});assert.equal(event.schemaVersion,8);validateDiagnostic(event);
});
test('prospective scaffold binds immutable evidence and preserves the predecessor namespace',()=>{
 const s=createSchemaDiagnosticScaffold();validateSchemaDiagnosticScaffold(s);assert.equal(s.activation,null);assert.equal(s.executionWindow,null);assert.equal(s.paidRequests,0);assert.ok(Object.isFrozen(s.policy.carry));assert.deepEqual(s.policy.carry,{known:10929,held:401694,exposure:412623,countCalls:6,consumedTrialSlots:5});assert.equal(policy.carry.known+policy.carry.held,policy.carry.exposure);assert.equal(policy.consumedSlotHistory.reduce((sum,row)=>sum+row.slots,0),5);
 assert.equal(origin['scripts/evaluation/runtime/campaign-schema-probe-1/pilot-budget.json'],'9d4ebb544fad739d401d5cad553849a22e1fde62576ce59d96d132f6030ad27b');assert.equal(policy.priorReviewedHead,'ea86666cf1ee81664eedf38415883ecc6d8bc351');assert.equal(policy.schemaSource.revision,'506aff0a8099581b50e119b87f8f2692cdad043f');
 const changed=structuredClone(s);changed.policy.carry.held--;assert.throws(()=>validateSchemaDiagnosticScaffold(changed));assert.throws(()=>verifySchemaDiagnosticPredecessor({}));const bytes=Object.fromEntries(Object.keys(origin).map(file=>[file,Buffer.from('synthetic')])),before=Object.values(bytes).map(b=>b.toString());assert.throws(()=>verifySchemaDiagnosticPredecessor(bytes));assert.deepEqual(Object.values(bytes).map(b=>b.toString()),before);
});
test('fake-only single slot carries once, holds unknown and never retries/replays',async()=>{
 for(const outcome of ['success','unknown','count-failure']){const store=offlineSchemaDiagnosticStore(),initial=store.read();let counts=0,sends=0;assert.equal(initial.executionWindow,null);const provider={kind:'fake',count:async packet=>{counts++;if(outcome==='count-failure')throw Error('synthetic');return {payloadHash:hash(packet),inputTokens:20};},send:async packet=>{sends++;assert.equal(packet.diagnosticProjectionVersion,3);if(outcome==='unknown')throw Error('synthetic');return {usage:{input:20,cachedInput:0,cacheWrite:0,output:10,reasoning:0,fees:0}};}};
 const result=await runOfflineSchemaDiagnostic({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>100});assert.equal(result.status,'stopped');assert.equal(counts,1);assert.equal(sends,outcome==='count-failure'?0:1);assert.equal(result.countCalls,7);assert.equal(result.consumedTrialSlots,6);assert.equal(result.newTrialSlots,1);assert.equal(result.consumedSlotHistory.length,5);assert.equal(result.known+result.held,result.exposure);assert.ok(result.held>=401694);if(outcome==='unknown')assert.equal(result.held,401694+result.reservation);if(outcome==='success')assert.equal(result.held,401694);assert.equal(result.executionWindow.deadline,5400100);assert.equal(result.executionWindow.dispatchDeadline,5040100);
 const stopped=store.read();await assert.rejects(runOfflineSchemaDiagnostic({store,provider,authorizeSyntheticWindow:true,prompt:'synthetic'}));assert.deepEqual(store.read(),stopped);assert.equal(counts,1);
 }
 const store=offlineSchemaDiagnosticStore();let calls=0;await assert.rejects(runOfflineSchemaDiagnostic({store,provider:{kind:'live',count(){calls++;}},authorizeSyntheticWindow:true,prompt:'synthetic'}));assert.equal(calls,0);assert.equal(store.read().status,'scaffold');
});
test('deadline, malformed count and reentry deny any second provider action',async()=>{
 for(const mode of ['deadline','bad-count','reentry']){const store=offlineSchemaDiagnosticStore();let clockCalls=0,sends=0,counts=0;const options={store,authorizeSyntheticWindow:true,prompt:'synthetic',clock:()=>mode==='deadline'&&clockCalls++?5040000:0};options.provider={kind:'fake',count:async packet=>{counts++;if(mode==='reentry')await assert.rejects(runOfflineSchemaDiagnostic(options));return {payloadHash:mode==='bad-count'?'wrong':hash(packet),inputTokens:20};},send:async()=>{sends++;throw Error('synthetic unknown');}};const result=await runOfflineSchemaDiagnostic(options);assert.equal(result.status,'stopped');assert.equal(counts,1);assert.equal(sends,mode==='reentry'?1:0);assert.equal(result.newTrialSlots,1);assert.equal(result.countCalls,7);}
 const store=offlineSchemaDiagnosticStore();let actions=0;await assert.rejects(runOfflineSchemaDiagnostic({store:{read:store.read},provider:{kind:'fake',count(){actions++;}},authorizeSyntheticWindow:true,prompt:'synthetic'}));assert.equal(actions,0);
});
