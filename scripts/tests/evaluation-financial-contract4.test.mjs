import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {inspectFinancialResponse,validateFinancialInspection,projectFinancialDiagnostics,validateFinancialDiagnostics} from '../evaluation/financial-inspector.mjs';
import {inspectToolUsage} from '../evaluation/financial-contract4.mjs';
import {diagnosticEvent,validateDiagnostic} from '../evaluation/diagnostics.mjs';
const request=()=>({model:'gpt-6.1-sol',maxOutputTokens:16,maxToolCalls:0,tools:[]});
const body=()=>({status:'completed',model:'gpt-6.1-sol',service_tier:'default',parallel_tool_calls:false,tools:[],output:[{type:'message',role:'assistant',status:'completed',phase:'final_answer',content:[{type:'output_text',text:'PRIVATE_RESPONSE',annotations:[]}]}],usage:{input_tokens:17,output_tokens:7,total_tokens:24,input_tokens_details:{cached_tokens:0,cache_write_tokens:0},output_tokens_details:{reasoning_tokens:0}},billing:{payer:'developer'},frequency_penalty:0,presence_penalty:0,tool_usage:{web:{calls:0},compute:{units:0}}});
const inspect=(data=body(),r=request())=>{const result=inspectFinancialResponse(data,r,17,4);validateFinancialInspection(result,4);return result;};
test('contract4 accepts exactly documented additions with developer/openai payer and no tools',()=>{
 for(const payer of ['developer','openai']){const d=body();d.billing.payer=payer;assert.equal(inspect(d).validated,true);const p=projectFinancialDiagnostics(d,4);validateFinancialDiagnostics(p,4);assert.equal(p.billingPayer,payer);assert.equal(p.toolUsage.allZero,true);assert.equal(p.toolUsage.nodeCount,5);assert.equal(p.toolUsage.leafCount,2);assert.equal(p.frequencyPenalty,'zero');}
 const legacy=body();for(const field of ['billing','frequency_penalty','presence_penalty','tool_usage'])delete legacy[field];assert.equal(inspect(legacy).validated,true);
});
test('billing exact shape, zero penalties and zero-only tool trees reject every malformed variant',()=>{
 const variants=[undefined,null,[],{},false,true,'0',0,-0,1,-1,NaN,Infinity,{payer:'OTHER'},{payer:'developer',extra:0}];
 for(const value of variants){const d=body();d.billing=value;assert.equal(inspect(d).validated,false);}
 for(const field of ['frequency_penalty','presence_penalty'])for(const value of [-0,NaN,Infinity,1,-1,'0',null,[],{},false,undefined]){const d=body();d[field]=value;assert.equal(inspect(d).validated,false);}
 for(const value of [-0,NaN,Infinity,1,-1,'0',null,[],{},false,undefined]){const d=body();d.tool_usage={nested:value};assert.equal(inspect(d).validated,false);validateFinancialDiagnostics(projectFinancialDiagnostics(d,4));}
 for(const value of [null,[],{},0,'0']){const d=body();d.tool_usage=value;assert.equal(inspect(d).validated,false);}
 const unknown=body();unknown.extra_scope=0;assert.ok(inspect(unknown).fixedReasonCodes.includes('envelope-extras'));
});
test('getters proxies symbols nonplain records and cycles reject without invoking user code',()=>{
 let traps=0;const getter={};Object.defineProperty(getter,'calls',{enumerable:true,get(){traps++;return 0;}});const proxy=new Proxy({calls:0},{get(){traps++;return 0;},ownKeys(){traps++;return ['calls'];}}),symbol={calls:0,[Symbol('PRIVATE_SYMBOL')]:0},cycle={calls:0};cycle.loop=cycle;
 for(const value of [getter,proxy,symbol,cycle,Object.assign(Object.create({}),{calls:0})]){const d=body();d.tool_usage=value;assert.equal(inspect(d).validated,false);validateFinancialDiagnostics(projectFinancialDiagnostics(d,4));}
 for(const field of ['billing','tool_usage']){const d=body();Object.defineProperty(d,field,{enumerable:true,get(){traps++;return {payer:'developer'};}});assert.equal(inspect(d).validated,false);validateFinancialDiagnostics(projectFinancialDiagnostics(d,4));}
 assert.equal(inspect(new Proxy(body(),{get(){traps++;},ownKeys(){traps++;return [];}})).validated,false);assert.equal(traps,0);
});
test('tool tree depth keys nodes and key bytes are tightly bounded',()=>{
 assert.equal(inspectToolUsage({a:{b:{c:0}}}).allZero,true);assert.equal(inspectToolUsage({a:{b:{c:{d:0}}}}).allZero,false);
 assert.equal(inspectToolUsage(Object.fromEntries(Array.from({length:9},(_,i)=>['k'+i,0]))).allZero,false);assert.equal(inspectToolUsage({['a'.repeat(65)]:0}).allZero,false);
 const boundary=Object.fromEntries(Array.from({length:7},(_,i)=>['group'+i,Object.fromEntries(Array.from({length:8},(_,j)=>['leaf'+j,0]))]));const accepted=inspectToolUsage(boundary);assert.equal(accepted.nodeCount,64);assert.equal(accepted.allZero,true);assert.equal(accepted.paths.length,8);
 boundary.extra={leaf:0};assert.equal(inspectToolUsage(boundary).allZero,false);const d=body();d.tool_usage=boundary;assert.equal(inspect(d).validated,false);validateFinancialDiagnostics(projectFinancialDiagnostics(d,4));
});
test('hidden tool output and any enabled request or response tool scope reject',()=>{
 for(const change of [d=>d.tools=[{type:'web_search'}],d=>d.output.push({type:'function_call',name:'PRIVATE_NAME'}),d=>d.output[0].content.push({type:'tool_output',text:'PRIVATE_TEXT'}),d=>Object.defineProperty(d.output[0],'hidden_tool',{value:true})]){const d=body();change(d);assert.equal(inspect(d).validated,false);}
 for(const change of [r=>r.tools=[{}],r=>delete r.tools,r=>r.maxToolCalls=1,r=>r.maxToolCalls=-0,r=>delete r.maxToolCalls]){const r=request();change(r);assert.equal(inspect(body(),r).validated,false);}
});
test('projection4 serializes only fixed enums buckets counts and hashed paths',()=>{
 const d=body();d.billing={payer:'PRIVATE_PAYER'};d.frequency_penalty=987654321;d.tool_usage={private_prompt_name:{secret_arbitrary_name:123456789},private_text:'PRIVATE_VALUE'};const p=projectFinancialDiagnostics(d,4);validateFinancialDiagnostics(p);const serialized=JSON.stringify(p);assert.doesNotMatch(serialized,/PRIVATE|private_prompt_name|secret_arbitrary_name|private_text|987654321|123456789/);assert.equal(p.frequencyPenalty,'nonzero');assert.equal(p.toolUsage.allZero,false);for(const entry of p.toolUsage.paths)assert.match(entry.pathHash,/^[a-f0-9]{64}$/);
 const credential='secret_arbitrary_name',protectedP=projectFinancialDiagnostics(d,4,{credential});assert.equal(protectedP.toolUsage.paths.length,1);assert.equal(protectedP.toolUsage.paths[0].type,'string');assert.equal(protectedP.toolUsage.paths[0].zero,'OTHER');
 for(const mutate of [value=>value.billingPayer='PRIVATE',value=>value.toolUsage.paths[0].pathHash='bad',value=>value.toolUsage.paths[0].value='PRIVATE',value=>value.toolUsage.nodeCount=65,value=>value.toolUsage.paths.reverse()]){const bad=structuredClone(projectFinancialDiagnostics(body(),4));mutate(bad);assert.throws(()=>validateFinancialDiagnostics(bad));}
 const inspection=inspect();const event=diagnosticEvent({requestId:'compare1_safe',kind:'generation',stage:'body-observed',data:body(),clock:()=>1,billingValidated:true,billingFailureCode:null,financialInspection:inspection,financialContractVersion:4,diagnosticProjection:projectFinancialDiagnostics(body(),4)});assert.equal(event.schemaVersion,9);validateDiagnostic(event);
});
test('prior contract2/3 and projection1/2/3 retain exact serialized behavior',async()=>{
 const source=execFileSync('git',['show','fbfc25ec6502ee3f7a9007bd7f67bf5847df930e:scripts/evaluation/financial-inspector.mjs'],{encoding:'utf8',windowsHide:true,env:{...process.env,GIT_NO_REPLACE_OBJECTS:'1'}});const prior=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const cases=[body(),null,{billing:{payer:'developer'},frequency_penalty:0}];const baseline=body();delete baseline.billing;delete baseline.frequency_penalty;delete baseline.presence_penalty;delete baseline.tool_usage;cases.push(baseline);
 for(const d of cases){for(const version of [2,3])assert.equal(JSON.stringify(inspectFinancialResponse(d,request(),17,version)),JSON.stringify(prior.inspectFinancialResponse(d,request(),17,version)));for(const version of [1,2,3])assert.equal(JSON.stringify(projectFinancialDiagnostics(d,version)),JSON.stringify(prior.projectFinancialDiagnostics(d,version)));}
 assert.throws(()=>inspectFinancialResponse(baseline,request(),17,1));assert.throws(()=>prior.inspectFinancialResponse(baseline,request(),17,1));
});
