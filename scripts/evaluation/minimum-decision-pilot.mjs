import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const ROOT=path.resolve(import.meta.dirname,'../..');
const ENV_FILE=process.env.VILYA_ENV_FILE||'C:/Users/repo/vilya/.env.local';
const OUT=path.join(import.meta.dirname,'runtime','minimum-decision-pilot.json');
const TOTAL_CAP=25;
const CALL_CAP=2;
const prices={
  'gpt-6.1-sol':{input:2/1e6,cached:0.1/1e6,cacheWrite:2.5/1e6,output:10/1e6},
  'gpt-6-astra':{input:10/1e6,cached:1/1e6,cacheWrite:12.5/1e6,output:50/1e6},
};
const sha=value=>createHash('sha256').update(value).digest('hex');
const readKey=()=>{
  const rows=fs.readFileSync(ENV_FILE,'utf8').split(/\r?\n/).filter(row=>row.trim()&&!row.trimStart().startsWith('#'));
  const values=rows.map(row=>/^OPENAI_API_KEY=(.*)$/.exec(row)).filter(Boolean);
  if(values.length!==1)throw Error('Expected exactly one OPENAI_API_KEY');
  let key=values[0][1].trim();
  if((key.startsWith('"')&&key.endsWith('"'))||(key.startsWith("'")&&key.endsWith("'")))key=key.slice(1,-1);
  if(!key||/\s/.test(key))throw Error('Invalid API credential');
  return key;
};
const manifest=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'fixtures','migration.json'),'utf8'));
const source=manifest.fileOwnership.map(file=>({file,content:execFileSync('git',['show',`${manifest.seed}:${file}`],{cwd:ROOT,encoding:'utf8',maxBuffer:2_000_000})}));
const priorAttempt=fs.existsSync(OUT)?JSON.parse(fs.readFileSync(OUT,'utf8')):null;
const completedAttempt=value=>({startedAt:value.startedAt,endedAt:value.endedAt,status:value.status,failure:value.failure,confirmedCostUsd:value.calls.reduce((sum,call)=>sum+call.costUsd,0),unresolvedCallHoldUsd:value.unresolvedHoldUsd??0,calls:value.calls});
const priorAttempts=priorAttempt?[...(priorAttempt.priorAttempts??[]),completedAttempt(priorAttempt)]:[];
const evidence={schemaVersion:1,startedAt:new Date().toISOString(),fixture:{name:manifest.name,seed:manifest.seed,task:manifest.taskPrompt,rubric:manifest.rubric,sourceDigest:sha(JSON.stringify(source))},limits:{totalUsd:TOTAL_CAP,perCallUsd:CALL_CAP,automaticRetries:0},priorAttempts,calls:[],flows:{},judgments:[],observedCostUsd:0,unresolvedHoldUsd:0,status:'running'};
let spent=priorAttempts.reduce((sum,attempt)=>sum+attempt.confirmedCostUsd+attempt.unresolvedCallHoldUsd,0);
const checkpoint=()=>{fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(evidence,null,2)+'\n');};
function textFrom(data){return data.output?.flatMap(item=>item.type==='message'?item.content??[]:[]).filter(item=>item.type==='output_text').map(item=>item.text).join('')?.trim();}
function cost(model,usage){
  const p=prices[model],cached=usage.input_tokens_details?.cached_tokens??0,written=usage.input_tokens_details?.cache_write_tokens??0,ordinary=Math.max(0,usage.input_tokens-cached-written);
  return ordinary*p.input+cached*p.cached+written*p.cacheWrite+usage.output_tokens*p.output;
}
async function call({id,model,effort,prompt,maxOutput=2500}){
  const worst=Buffer.byteLength(prompt)*prices[model].input+maxOutput*prices[model].output;
  if(worst>CALL_CAP||spent+worst>TOTAL_CAP)throw Error(`Budget reservation rejected for ${id}`);
  const started=Date.now();
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`,'x-client-request-id':`vilya-357-${id}`},body:JSON.stringify({model,input:prompt,reasoning:{effort},max_output_tokens:maxOutput,text:{format:{type:'text'}},tools:[],tool_choice:'none',parallel_tool_calls:false,service_tier:'default',store:false,stream:false,background:false,truncation:'disabled'})});
  if(!response.ok)throw Error(`${id} failed with HTTP ${response.status}`);
  const data=await response.json(),text=textFrom(data),usd=cost(model,data.usage);spent+=usd;evidence.observedCostUsd+=usd;
  if(usd>CALL_CAP||spent>TOTAL_CAP)throw Error(`Observed budget exceeded at ${id}`);
  evidence.calls.push({id,model,effort,status:data.status,textAvailable:Boolean(text),startedAt:new Date(started).toISOString(),endedAt:new Date().toISOString(),elapsedMs:Date.now()-started,usage:{inputTokens:data.usage.input_tokens,cachedInputTokens:data.usage.input_tokens_details?.cached_tokens??0,cacheWriteTokens:data.usage.input_tokens_details?.cache_write_tokens??0,outputTokens:data.usage.output_tokens,reasoningTokens:data.usage.output_tokens_details?.reasoning_tokens??0,totalTokens:data.usage.total_tokens},costUsd:usd,inputDigest:sha(prompt),outputDigest:text?sha(text):null});checkpoint();
  if(data.status!=='completed'||!text)throw Error(`${id} returned no completed text`);
  return text;
}
const common=JSON.stringify({task:manifest.taskPrompt,rubric:manifest.rubric,source});
const planPrompt=`Produce a complete implementation plan for this fixed task. Resolve exact parsing and generation semantics, edge cases, owned files, and verification. Do not write code. Return concise plain text.\n${common}`;
const consultQuestion='Settle literal pipe and ordinary backslash roundtrip semantics while preserving legacy configuration. Migration tool, command and status must preserve literal pipes, ordinary backslashes and Windows paths, inline code and links through repeated parse-generate-parse. Escaped table pipes decode as literal pipes; generation escapes table delimiters without changing ordinary backslashes. Blank clearing stays blank; legacy and non-Drizzle behavior remain. No dependency or database execution.';
const key=readKey();
try{
  const a=await call({id:'flow-a-sol-plan',model:'gpt-6.1-sol',effort:'medium',prompt:planPrompt});
  const draft=await call({id:'flow-b-sol-draft',model:'gpt-6.1-sol',effort:'medium',prompt:planPrompt.replace('complete implementation plan','implementation draft')});
  const consultation=await call({id:'flow-b-astra-consult',model:'gpt-6-astra',effort:'high',maxOutput:3500,prompt:`Answer only the declared consequential question. Identify any defect or missing semantic decision in the draft, then give the precise resolution.\nQUESTION:\n${consultQuestion}\nDRAFT:\n${draft}\nTASK AND RUBRIC:\n${common}`});
  const b=await call({id:'flow-b-sol-synthesis',model:'gpt-6.1-sol',effort:'medium',prompt:`Produce the final complete implementation plan. Reconcile the draft with the consultation. Do not mention the evaluation or models.\nDRAFT:\n${draft}\nCONSULTATION:\n${consultation}\nTASK AND RUBRIC:\n${common}`});
  evidence.flows={A:{label:'Sol-only',plan:a},B:{label:'Sol + bounded Astra consultation + Sol synthesis',draft,consultation,plan:b}};
  const judgePrompt=(first,second)=>`Blindly compare two implementation plans for the fixed task. Score each from 0-4 on every rubric item, then select A, B, or tie. Penalize invented scope and missing edge cases. Return strict JSON with keys winner, planA, planB, rationale; planA and planB must contain scores (array of four integers) and total (integer).\nTASK:${manifest.taskPrompt}\nRUBRIC:${JSON.stringify(manifest.rubric)}\nPLAN A:\n${first}\nPLAN B:\n${second}`;
  const j1=await call({id:'judge-sol',model:'gpt-6.1-sol',effort:'high',maxOutput:1200,prompt:judgePrompt(a,b)});
  const j2=await call({id:'judge-astra-reversed',model:'gpt-6-astra',effort:'high',maxOutput:2500,prompt:judgePrompt(b,a)});
  evidence.judgments=[{judge:'gpt-6.1-sol',order:['A','B'],raw:j1},{judge:'gpt-6-astra',order:['B','A'],raw:j2}];
  evidence.totalAccountedExposureUsd=spent;evidence.endedAt=new Date().toISOString();evidence.status='complete';
}catch(error){evidence.totalAccountedExposureUsd=spent;evidence.endedAt=new Date().toISOString();evidence.status='failed';evidence.failure=String(error?.message??error);throw error;
}finally{checkpoint();}
console.log(JSON.stringify({status:evidence.status,totalAccountedExposureUsd:evidence.totalAccountedExposureUsd,calls:evidence.calls.map(({id,model,costUsd,elapsedMs,usage})=>({id,model,costUsd,elapsedMs,usage})),output:OUT},null,2));
