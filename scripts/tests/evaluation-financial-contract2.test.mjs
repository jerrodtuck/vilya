import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {inspectFinancialResponse} from '../evaluation/financial-inspector.mjs';
import {validateFinancialResponse,parseResponse,createOpenAITransport,OFFLINE_FIXTURE_KEY} from '../evaluation/openai-transport.mjs';
import {validateFinancialResponse as frozen} from './fixtures/financial-validator-94bc.mjs';
import {diagnosticEvent,validateDiagnostic,recordDiagnostic} from '../evaluation/diagnostics.mjs';
import {projectDiagnosticObservations} from '../evaluation/diagnostic-observations.mjs';
import {apiConfig,actualCost} from '../evaluation/money.mjs';import {BudgetLedger} from '../evaluation/ledger.mjs';import {generate} from '../evaluation/generation.mjs';
const request={model:'gpt-6.1-sol',effort:'medium',prompt:'PRIVATE_PROMPT',maxOutputTokens:32,maxToolCalls:0,retries:0};
// Sanitized shape derived from the official create response schema, not a recovered body.
const body=()=>({id:'resp_sanitized',object:'response',created_at:1,completed_at:2,status:'completed',model:request.model,service_tier:'default',access_programs:{cyber:'standard'},background:false,parallel_tool_calls:false,tools:[],tool_choice:'none',text:{format:{type:'text'}},error:null,incomplete_details:null,output:[{type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:'PRIVATE_OUTPUT',annotations:[],logprobs:[]}]}],usage:{input_tokens:20,input_tokens_details:{cached_tokens:3,cache_write_tokens:4},output_tokens:10,output_tokens_details:{reasoning_tokens:2},total_tokens:30}});
const valid=d=>inspectFinancialResponse(d,request,20).validated;
const checked=d=>{try{return {accepted:true,usage:validateFinancialResponse(d,request,20)};}catch{return {accepted:false};}};
const old=d=>{try{return {accepted:true,usage:frozen(d,request,20)};}catch{return {accepted:false};}};

test('schema-derived standard program, optional background and mandatory false parallel accept at identical cost',()=>{
 for(const model of ['gpt-6.1-sol','gpt-6-astra'])for(const program of [undefined,null,{cyber:'standard'}])for(const background of [undefined,null,false]){
  const d=body();d.model=model;d.access_programs=program;d.background=background;const r={...request,model};const usage=validateFinancialResponse(d,r,20),previous=frozen({...d,access_programs:null},r,20);assert.deepEqual(usage,previous);assert.equal(actualCost(apiConfig().models[model],usage),actualCost(apiConfig().models[model],previous));assert.equal(parseResponse(d,r,20).text,'PRIVATE_OUTPUT');
 }
});
test('exhaustive program and boolean rejection catches malformed, extra and non-standard scope',()=>{
 for(const program of [false,true,0,1,'standard',[],{},['standard'],{cyber:null},{cyber:false},{cyber:0},{cyber:'daybreak_blue'},{cyber:'daybreak_red'},{cyber:'STANDARD'},{cyber:'standard',extra:null},{other:'standard'},{cyber:{value:'standard'}}]){const d=body();d.access_programs=program;assert.equal(valid(d),false);assert.ok(inspectFinancialResponse(d,request,20).fixedReasonCodes.includes('access-programs-scope'));}
 for(const background of [true,0,1,'false','true',{},[]]){const d=body();d.background=background;assert.equal(valid(d),false);}
 for(const parallel of [undefined,null,true,0,1,'false','true',{},[]]){const d=body();d.parallel_tool_calls=parallel;assert.equal(valid(d),false);}
});
test('frozen94bc oracle unchanged outside exactly three deltas, including overlapping unsafe scope',()=>{
 const base=body();base.access_programs=null;assert.deepEqual(checked(base),old(base));
 const changes=[d=>d.service_tier='priority',d=>d.moderation={},d=>d.prompt={},d=>d.prompt_cache_diagnostics={},d=>d.conversation={},d=>d.tools=[{type:'web_search'}],d=>d.previous_response_id='resp_prior',d=>d.tool_choice='auto',d=>d.unknown_charge=0,d=>d.status='failed',d=>d.model='unknown',d=>d.text={format:{type:'json_object'}},d=>d.error={},d=>d.usage.output_tokens=-1,d=>d.usage.total_tokens++,d=>d.usage.input_tokens=21,d=>d.usage.output_tokens=33,d=>d.usage.input_tokens_details.cache_write_tokens=99,d=>d.usage.output_tokens_details.reasoning_tokens=99,d=>d.output=[{type:'function_call'}]];
 for(const change of changes){const d=structuredClone(base);change(d);assert.deepEqual(checked(d),old(d));d.access_programs={cyber:'standard'};assert.equal(checked(d).accepted,false);}
 assert.equal(old(body()).accepted,false);assert.equal(checked(body()).accepted,true);
 for(const field of ['parallel_tool_calls','background'])for(const value of [0,'false',{}]){const d=structuredClone(base);d[field]=value;assert.equal(old(d).accepted,true);assert.equal(checked(d).accepted,false);}
 const missing=structuredClone(base);delete missing.parallel_tool_calls;assert.equal(old(missing).accepted,true);assert.equal(checked(missing).accepted,false);
});
function diagnostic(d,stage='body-observed',version=4){const financialInspection=inspectFinancialResponse(d,request,20);return diagnosticEvent({requestId:'prospective',kind:'generation',stage,clock:()=>1003,httpStatus:stage==='body-observed'?200:null,providerRequestId:'req_sanitized',data:d,billingValidated:financialInspection.validated,billingFailureCode:financialInspection.validated?null:'unsupported-financial-scope',financialInspection,...(version===4?{financialContractVersion:2}:{})});}
test('v4 requires fixed contract2, exact keys, finite inspection and billing equality while unflagged calls retain v3',()=>{
 const d=body();d.access_programs={cyber:'PRIVATE_PROGRAM'};const v4=diagnostic(d);assert.equal(v4.schemaVersion,4);assert.equal(v4.financialContractVersion,2);assert.equal(v4.financialInspection.controlledShape.accessPrograms,'other');assert.doesNotMatch(JSON.stringify(v4),/PRIVATE_|standard|cyber|PROMPT|OUTPUT/);const v3=diagnostic(d,'body-observed',3);assert.equal(v3.schemaVersion,3);assert.equal(Object.hasOwn(v3,'financialContractVersion'),false);
 for(const e of [v3,v4]){const bytes=JSON.stringify(e);validateDiagnostic(JSON.parse(bytes));assert.equal(JSON.stringify(e),bytes);}
 for(const change of [e=>delete e.financialContractVersion,e=>e.financialContractVersion=1,e=>e.financialContractVersion='2',e=>e.financialInspection.controlledShape.accessPrograms='PRIVATE',e=>e.billingValidated=true,e=>e.billingFailureCode=null,e=>e.stage='send-start',e=>e.kind='count',e=>e.rawBody='PRIVATE',e=>e.financialInspection.fixedReasonCodes=['PRIVATE']]){const e=structuredClone(v4);change(e);assert.throws(()=>validateDiagnostic(e));}
});
function chain(){const d=body();d.access_programs={cyber:'PRIVATE_PROGRAM'};return [diagnosticEvent({requestId:'prospective',kind:'generation',stage:'send-start',clock:()=>1001}),diagnosticEvent({requestId:'prospective',kind:'generation',stage:'http-received',clock:()=>1002,httpStatus:200,providerRequestId:'req_sanitized'}),diagnostic(d),{...diagnostic(d,'schema-rejected'),observedAt:1004}];}
function state(){return {requests:[{id:'prospective',trial:null,phase:'setup',start:1000,model:request.model,effort:'medium',status:'unknown',cost:null,usage:null,inputBound:20,outputBound:32}],overheadStart:{setup:1000},trialStart:null,preflights:[{id:'prospective_count',requestId:'prospective',trial:null,phase:'setup',status:'complete',model:request.model,effort:'medium',serviceTier:'default',pricingDate:'2026-10-06',billingInterpretation:'published-pricing-count-zero-2026-10-06',payloadHash:'a'.repeat(64),inputTokens:20,start:999}]};}
test('v4 projection requires matching inspection and contract across body/rejection without raw diagnostics export',()=>{
 const events=chain(),s=state(),bytes=JSON.stringify(s),projected=projectDiagnosticObservations(s,events,apiConfig());assert.equal(projected.prospective.usage.totalTokens,30);assert.equal(JSON.stringify(s),bytes);assert.doesNotMatch(JSON.stringify(projected),/PRIVATE_|financialInspection|financialContractVersion|providerRequestId/);
 for(const change of [r=>r[3].financialContractVersion=1,r=>delete r[3].financialContractVersion,r=>r[3].financialInspection.controlledShape.accessPrograms='expected',r=>{r[3].schemaVersion=3;delete r[3].financialContractVersion;},r=>r[3].financialInspection.fixedReasonCodes=['background-scope']]){const rows=structuredClone(events);change(rows);assert.throws(()=>projectDiagnosticObservations(s,rows,apiConfig()));}
});
test('offline content rejection reconciles valid finance; unknown scope preserves hold and restart emits zero sends',async()=>{
 for(const mode of ['ready','refusal','incomplete','unknown']){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-contract2-')),config={...apiConfig(),mode:'offline'},ledger=new BudgetLedger(path.join(root,'ledger.json'),config);ledger.initialize();let sends=0;
  const provider=createOpenAITransport({offlineFixture:true,liveEnabled:true,env:{OPENAI_API_KEY:OFFLINE_FIXTURE_KEY},inputTokensForFixture:()=>20,diagnosticGuard:e=>recordDiagnostic(ledger,e),reservationGuard:r=>ledger.read().requests.find(v=>v.id===r.reservation.id),fetchImpl:async url=>{sends++;const d=body();if(mode==='refusal')d.output[0].content=[{type:'refusal',refusal:'PRIVATE_REFUSAL'}];if(mode==='incomplete'){d.status='incomplete';d.incomplete_details={reason:'max_output_tokens'};}if(mode==='unknown')d.access_programs={cyber:'daybreak_red'};return {ok:true,status:200,url,headers:{get:()=> 'req_sanitized'},json:async()=>d};}});
  const phase={...request,requestId:'prospective',phase:'setup'};if(mode==='ready')assert.equal(await generate(ledger,provider,phase),'PRIVATE_OUTPUT');else await assert.rejects(generate(ledger,provider,phase),mode==='unknown'?/unresolved/:/Content rejected/);
  const s=ledger.read(),rows=fs.readFileSync(ledger.file+'.diagnostics.jsonl','utf8').trim().split('\n').map(JSON.parse);assert.equal(s.requests[0].status,mode==='unknown'?'unknown':'complete');const observed=rows.find(e=>e.stage==='body-observed');assert.equal(observed.schemaVersion,5);assert.equal(observed.financialContractVersion,2);assert.doesNotMatch(JSON.stringify(rows),/PRIVATE_|daybreak|cyber/);
  if(mode!=='ready'){const rejected=rows.find(e=>e.stage==='schema-rejected');assert.equal(rejected.schemaVersion,5);assert.deepEqual(rejected.financialInspection,observed.financialInspection);assert.deepEqual(rejected.diagnosticProjection,observed.diagnosticProjection);}
  if(mode==='unknown'){assert.equal(s.requests[0].cost,null);assert.equal(s.requests[0].usage,null);assert.equal(s.blocked,true);const bytes=fs.readFileSync(ledger.file);await assert.rejects(generate(new BudgetLedger(ledger.file,config),provider,{...phase,requestId:'forbidden_restart'}));assert.equal(sends,1);assert.deepEqual(fs.readFileSync(ledger.file),bytes);}
 }
});
