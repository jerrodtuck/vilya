import {createHash} from 'node:crypto';
import {CONTRACT4_REASON_CODES,inspectContract4,projectContract4,validateContract4Projection} from './financial-contract4.mjs';
// Prospective contract 3 admits only the documented optional message phase.
export const FINANCIAL_CONTRACT_VERSION=3;
const RESPONSE_KEYS = new Set(['id','object','created_at','completed_at','status','error','incomplete_details','instructions','max_output_tokens','max_tool_calls','model','output','parallel_tool_calls','previous_response_id','reasoning','store','temperature','text','tool_choice','tools','top_p','truncation','usage','user','metadata','service_tier','safety_identifier','prompt_cache_key','prompt_cache_options','prompt_cache_retention','background','conversation','top_logprobs','personality','access_programs','moderation','prompt','prompt_cache_diagnostics']);
const LEGACY_REASON_CODES=Object.freeze(['envelope-shape','envelope-extras','status','model','tier','optional-null-scope','background-scope','conversation-scope','access-programs-scope','tool-choice-scope','parallel-tools-scope','text-shape','text-extras','text-verbosity','text-format','provider-error','incomplete-details','tools-scope','previous-response-scope','usage-shape','usage-extras','input-details-shape','output-details-shape','input-details-extras','output-details-extras','counter-missing','counter-invalid','counter-total','input-bound','output-bound','cache-subsets','reasoning-subset','output-shape','output-kind','reasoning-extras','reasoning-content','message-shape','content-kind','content-extras','annotations-scope','logprobs-scope']);
export const FINANCIAL_REASON_CODES=Object.freeze([...LEGACY_REASON_CODES,'message-phase']);
const reasonCodes=version=>{if(version===2)return LEGACY_REASON_CODES;if(version===3)return FINANCIAL_REASON_CODES;if(version===4)return [...FINANCIAL_REASON_CODES,...CONTRACT4_REASON_CODES];throw Error('Invalid financial contract version');};
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const uint=value=>Number.isSafeInteger(value)&&value>=0;
const extras=(value,keys)=>Object.keys(value).some(key=>!keys.includes(key));
const bucket=(value,expected)=>value===undefined?'absent':value===null?'null':expected(value)?'expected':'other';
const empty=value=>Array.isArray(value)&&value.length===0;
const standardProgram=value=>record(value)&&Object.keys(value).join('|')==='cyber'&&value.cyber==='standard';
export const FINANCIAL_SHAPE_KEYS=Object.freeze(['envelope','status','model','tier','moderation','prompt','promptCacheDiagnostics','background','conversation','accessPrograms','toolChoice','parallelTools','previousResponse','error','incompleteDetails','text','textFormat','textVerbosity','usage','inputDetails','outputDetails','inputTokens','cachedTokens','cacheWriteTokens','outputTokens','reasoningTokens','totalTokens','tools','output']);
export const FINANCIAL_OUTPUT_TYPES=Object.freeze(['message','reasoning','OTHER']);
export const FINANCIAL_CONTENT_TYPES=Object.freeze(['output_text','refusal','summary_text','reasoning_text','OTHER']);
export function inspectFinancialResponse(data,request,inputBound,contractVersion=FINANCIAL_CONTRACT_VERSION){
 if(contractVersion===4)return inspectContract4(data,request,inputBound,inspectFinancialResponse);
 const codes=reasonCodes(contractVersion);
 const failures=new Set(),add=(code,failed)=>{if(failed)failures.add(code);};
 const d=record(data)?data:{},usage=record(d.usage)?d.usage:{},input=record(usage.input_tokens_details)?usage.input_tokens_details:{},output=record(usage.output_tokens_details)?usage.output_tokens_details:{};
 add('envelope-shape',!record(data));add('envelope-extras',record(data)&&Object.keys(data).some(key=>!RESPONSE_KEYS.has(key)));
 add('status',!['completed','incomplete'].includes(d.status));add('model',request==null||d.model!==request.model);add('tier',d.service_tier!=='default');
 add('optional-null-scope',['moderation','prompt','prompt_cache_diagnostics'].some(key=>d[key]!=null));add('background-scope',d.background!=null&&d.background!==false);add('conversation-scope',d.conversation!=null);add('access-programs-scope',d.access_programs!=null&&!standardProgram(d.access_programs));
 add('tool-choice-scope',d.tool_choice!=null&&d.tool_choice!=='none');add('parallel-tools-scope',d.parallel_tool_calls!==false);
 if(d.text!=null){add('text-shape',!record(d.text));if(record(d.text)){add('text-extras',extras(d.text,['format','verbosity']));add('text-verbosity',d.text.verbosity!=null&&!['low','medium','high'].includes(d.text.verbosity));add('text-format',!record(d.text.format)||extras(d.text.format,['type'])||d.text.format.type!=='text');}}
 add('provider-error',d.error!=null);add('incomplete-details',d.status==='completed'?d.incomplete_details!=null:!record(d.incomplete_details)||Object.keys(d.incomplete_details).join('|')!=='reason'||d.incomplete_details.reason!=='max_output_tokens');
 add('tools-scope',!empty(d.tools));add('previous-response-scope',d.previous_response_id!=null);
 add('usage-shape',!record(d.usage));add('usage-extras',record(d.usage)&&extras(d.usage,['input_tokens','output_tokens','total_tokens','input_tokens_details','output_tokens_details']));
 add('input-details-shape',!record(usage.input_tokens_details));add('output-details-shape',!record(usage.output_tokens_details));add('input-details-extras',record(usage.input_tokens_details)&&extras(input,['cached_tokens','cache_write_tokens']));add('output-details-extras',record(usage.output_tokens_details)&&extras(output,['reasoning_tokens']));
 const counters=[usage.input_tokens,input.cached_tokens,input.cache_write_tokens,usage.output_tokens,output.reasoning_tokens,usage.total_tokens];
 const validCounters=counters.every(uint);
 add('counter-missing',counters.some(value=>value===undefined));add('counter-invalid',counters.some(value=>!uint(value)));add('counter-total',validCounters&&usage.total_tokens!==usage.input_tokens+usage.output_tokens);
 if(validCounters){try{add('input-bound',usage.input_tokens>inputBound);}catch{add('input-bound',true);}try{add('output-bound',usage.output_tokens>request?.maxOutputTokens);}catch{add('output-bound',true);}add('cache-subsets',input.cached_tokens+input.cache_write_tokens>usage.input_tokens);add('reasoning-subset',output.reasoning_tokens>usage.output_tokens);}
 add('output-shape',!Array.isArray(d.output));const itemTypes=new Set(),contentTypes=new Set();
 for(const item of Array.isArray(d.output)?d.output:[]){
  itemTypes.add(record(item)&&['message','reasoning'].includes(item.type)?item.type:'OTHER');
  if(!record(item)||!['reasoning','message'].includes(item.type)){add('output-kind',true);continue;}
  if(item.type==='reasoning'){
   add('reasoning-extras',extras(item,['id','type','summary','content','status','encrypted_content']));
   for(const key of ['summary','content'])if(item[key]!=null){add('reasoning-content',!Array.isArray(item[key]));for(const c of Array.isArray(item[key])?item[key]:[]){contentTypes.add(record(c)&&FINANCIAL_CONTENT_TYPES.includes(c.type)?c.type:'OTHER');add('reasoning-content',!record(c)||!['summary_text','reasoning_text'].includes(c.type)||extras(c,['type','text']));}}
  }else{
   add('message-shape',extras(item,contractVersion===3?['id','type','role','status','content','phase']:['id','type','role','status','content'])||!Array.isArray(item.content));
   if(contractVersion===3)add('message-phase',item.phase!=null&&!['commentary','final_answer'].includes(item.phase));
   for(const c of Array.isArray(item.content)?item.content:[]){
    contentTypes.add(record(c)&&FINANCIAL_CONTENT_TYPES.includes(c.type)?c.type:'OTHER');
    if(!record(c)||!['output_text','refusal'].includes(c.type)){add('content-kind',true);continue;}
    add('content-extras',extras(c,c.type==='refusal'?['type','refusal']:['type','text','annotations','logprobs']));add('annotations-scope',c.annotations!=null&&!empty(c.annotations));add('logprobs-scope',c.logprobs!=null&&!empty(c.logprobs));
   }
  }
 }
 const values=[data,d.status,d.model,d.service_tier,d.moderation,d.prompt,d.prompt_cache_diagnostics,d.background,d.conversation,d.access_programs,d.tool_choice,d.parallel_tool_calls,d.previous_response_id,d.error,d.incomplete_details,d.text,d.text?.format,d.text?.verbosity,d.usage,usage.input_tokens_details,usage.output_tokens_details,usage.input_tokens,input.cached_tokens,input.cache_write_tokens,usage.output_tokens,output.reasoning_tokens,usage.total_tokens,d.tools,d.output];
 const expectations=[record,v=>['completed','incomplete'].includes(v),v=>v===request?.model,v=>v==='default',()=>false,()=>false,()=>false,v=>v===false,()=>false,standardProgram,v=>v==='none',v=>v===false,()=>false,()=>false,v=>record(v)&&Object.keys(v).join('|')==='reason'&&v.reason==='max_output_tokens',record,v=>record(v)&&!extras(v,['type'])&&v.type==='text',v=>['low','medium','high'].includes(v),record,record,record,uint,uint,uint,uint,uint,uint,empty,Array.isArray];
 const controlledShape=Object.fromEntries(FINANCIAL_SHAPE_KEYS.map((key,index)=>[key,bucket(values[index],expectations[index])]));controlledShape.outputTypes=FINANCIAL_OUTPUT_TYPES.filter(type=>itemTypes.has(type));controlledShape.contentTypes=FINANCIAL_CONTENT_TYPES.filter(type=>contentTypes.has(type));
 const fixedReasonCodes=codes.filter(code=>failures.has(code));return {validated:fixedReasonCodes.length===0,fixedReasonCodes,controlledShape};
}
export function validateFinancialInspection(value,contractVersion=FINANCIAL_CONTRACT_VERSION){
 const codes=reasonCodes(contractVersion);
 if(!record(value)||Object.keys(value).sort().join('|')!==['validated','fixedReasonCodes','controlledShape'].sort().join('|')||typeof value.validated!=='boolean'||!Array.isArray(value.fixedReasonCodes)||JSON.stringify(value.fixedReasonCodes)!==JSON.stringify(codes.filter(code=>value.fixedReasonCodes.includes(code)))||value.validated!==(value.fixedReasonCodes.length===0))throw Error('Invalid controlled financial inspection');
 const shape=value.controlledShape;if(!record(shape)||Object.keys(shape).sort().join('|')!==[...FINANCIAL_SHAPE_KEYS,'outputTypes','contentTypes'].sort().join('|')||FINANCIAL_SHAPE_KEYS.some(key=>!['absent','null','expected','other'].includes(shape[key])))throw Error('Invalid controlled financial shape');
 for(const [key,types] of [['outputTypes',FINANCIAL_OUTPUT_TYPES],['contentTypes',FINANCIAL_CONTENT_TYPES]])if(!Array.isArray(shape[key])||JSON.stringify(shape[key])!==JSON.stringify(types.filter(type=>shape[key].includes(type))))throw Error('Invalid controlled financial types');return true;
}
// Frozen projection 1 and prospective projection 2 never change financial admission.
export const FINANCIAL_DIAGNOSTIC_VERSION=2;
const LEGACY_DIAGNOSTIC_FIELDS=Object.freeze([...RESPONSE_KEYS]);
export const FINANCIAL_CANDIDATE_FIELDS=Object.freeze(['input','output_text','reasoning_effort','billing','context_management','output_modalities','seed','system_fingerprint']);
const DIAGNOSTIC_FIELDS=Object.freeze([...LEGACY_DIAGNOSTIC_FIELDS,...FINANCIAL_CANDIDATE_FIELDS]);
const LEGACY_MESSAGE_FIELDS=Object.freeze(['id','type','role','status','content']);
const MESSAGE_FIELDS=Object.freeze([...LEGACY_MESSAGE_FIELDS,'phase']);
const projectionFields=version=>{if(version===1)return {envelope:LEGACY_DIAGNOSTIC_FIELDS,message:LEGACY_MESSAGE_FIELDS};if(version===2||version===3)return {envelope:DIAGNOSTIC_FIELDS,message:MESSAGE_FIELDS};throw Error('Invalid bounded financial diagnostics version');};
const TYPE_BUCKETS=Object.freeze(['absent','null','boolean','number','string','array','object','OTHER']);
const CONTENT_SHAPES=Object.freeze(['absent','null','not-array','empty','array']);
const CONTENT_CAUSES=Object.freeze(['non-record','unknown-kind','extra-fields','annotations-scope','logprobs-scope']);
const own=(value,key)=>Object.hasOwn(value,key);
const typeBucket=(value,present=true)=>!present?'absent':value===null?'null':Array.isArray(value)?'array':['boolean','number','string','object'].includes(typeof value)?typeof value:'OTHER';
const extraProjection=count=>({count:Math.min(count,64),identities:count?['OTHER']:[]});
// Prospective identities are digests, never an open plaintext vocabulary.
const structuralName=name=>typeof name==='string'&&/^[a-z][a-z_]{0,39}$/.test(name)&&!/(?:key|secret|private|password|credential|auth|bearer|prompt|text|content|token|session|cookie|email|address|name|identifier)|^(?:sk_|req_|resp_|api_)/.test(name);
const PAYER_ENUM=Object.freeze(['developer','openai','OTHER']);
function structuralFields(value,keys,credential){
 const descriptors=Object.getOwnPropertyDescriptors(value),safe=[],redacted=[];
 for(const name of keys){const descriptor=descriptors[name];if(!structuralName(name)||credential&&name.includes(credential)||!descriptor||!Object.hasOwn(descriptor,'value'))redacted.push(name);else safe.push({nameHash:createHash('sha256').update(name,'utf8').digest('hex'),type:typeBucket(descriptor.value)});}
 safe.sort((a,b)=>a.nameHash<b.nameHash?-1:a.nameHash>b.nameHash?1:0);
 return {fields:safe.slice(0,8),redactedCount:Math.min(64,redacted.length),overflowCount:Math.min(64,Math.max(0,safe.length-8))};
}
export function projectFinancialDiagnostics(data,version=FINANCIAL_DIAGNOSTIC_VERSION,{credential=null}={}){
 if(version===4)return projectContract4(data,{credential});
 const fields=projectionFields(version);
 const envelope=record(data)?data:{};
 const envelopeFields=Object.fromEntries(fields.envelope.map(key=>[key,typeBucket(envelope[key],own(envelope,key))]));
 const messageSets=Object.fromEntries(fields.message.map(key=>[key,new Set()])),shapes=new Set(),causes=new Set();let messageExtras=0;
 for(const item of Array.isArray(envelope.output)?envelope.output:[]){
  if(!record(item)||item.type!=='message')continue;
  for(const key of fields.message)messageSets[key].add(typeBucket(item[key],own(item,key)));
  messageExtras=Math.min(64,messageExtras+Object.keys(item).filter(key=>!fields.message.includes(key)).length);
  const content=item.content;
  shapes.add(!own(item,'content')?'absent':content===null?'null':!Array.isArray(content)?'not-array':content.length?'array':'empty');
  for(const c of Array.isArray(content)?content:[]){
   if(!record(c)){causes.add('non-record');continue;}
   if(!['output_text','refusal'].includes(c.type)){causes.add('unknown-kind');continue;}
   if(extras(c,c.type==='refusal'?['type','refusal']:['type','text','annotations','logprobs']))causes.add('extra-fields');
   if(c.annotations!=null&&!empty(c.annotations))causes.add('annotations-scope');
   if(c.logprobs!=null&&!empty(c.logprobs))causes.add('logprobs-scope');
  }
 }
 const prospective=version===3?{unknownEnvelope:structuralFields(envelope,Object.keys(envelope).filter(key=>!fields.envelope.includes(key)),credential),billing:{type:typeBucket(envelope.billing,own(envelope,'billing')),...structuralFields(record(envelope.billing)?envelope.billing:{},record(envelope.billing)?Object.keys(envelope.billing):[],credential),payer:!record(envelope.billing)||!own(envelope.billing,'payer')?'absent':['developer','openai'].includes(envelope.billing.payer)?envelope.billing.payer:'OTHER'}}:{};
 return {version,...(version>=2?{recognizedRejectedFields:FINANCIAL_CANDIDATE_FIELDS.filter(key=>own(envelope,key))}:{}),...prospective,envelopeFields,envelopeExtras:extraProjection(Object.keys(envelope).filter(key=>!fields.envelope.includes(key)).length),messageFields:Object.fromEntries(fields.message.map(key=>[key,TYPE_BUCKETS.filter(type=>messageSets[key].has(type))])),messageExtras:extraProjection(messageExtras),messageContentShapes:CONTENT_SHAPES.filter(shape=>shapes.has(shape)),messageContentCauses:CONTENT_CAUSES.filter(cause=>causes.has(cause))};
}
export function validateFinancialDiagnostics(value,expectedVersion=value?.version){
 if(expectedVersion===4)return validateContract4Projection(value);
 const fields=projectionFields(expectedVersion);
 const invalid=()=>{throw Error('Invalid bounded financial diagnostics');};
 const exact=(obj,keys)=>record(obj)&&Object.keys(obj).sort().join('|')===[...keys].sort().join('|');
 const ordered=(values,allowed)=>Array.isArray(values)&&JSON.stringify(values)===JSON.stringify(allowed.filter(value=>values.includes(value)));
 if(!exact(value,['version','envelopeFields','envelopeExtras','messageFields','messageExtras','messageContentShapes','messageContentCauses',...(expectedVersion>=2?['recognizedRejectedFields']:[]),...(expectedVersion===3?['unknownEnvelope','billing']:[])])||value.version!==expectedVersion)invalid();
 if(!exact(value.envelopeFields,fields.envelope)||fields.envelope.some(key=>!TYPE_BUCKETS.includes(value.envelopeFields[key])))invalid();
 if(!exact(value.messageFields,fields.message)||fields.message.some(key=>!ordered(value.messageFields[key],TYPE_BUCKETS)))invalid();
 for(const key of ['envelopeExtras','messageExtras']){const extra=value[key];if(!exact(extra,['count','identities'])||!uint(extra.count)||extra.count>64||JSON.stringify(extra.identities)!==JSON.stringify(extra.count?['OTHER']:[]))invalid();}
 if(expectedVersion>=2&&(!ordered(value.recognizedRejectedFields,FINANCIAL_CANDIDATE_FIELDS)||JSON.stringify(value.recognizedRejectedFields)!==JSON.stringify(FINANCIAL_CANDIDATE_FIELDS.filter(key=>value.envelopeFields[key]!=='absent'))))invalid();
 if(expectedVersion===3){for(const [key,extra]of [['unknownEnvelope',[]],['billing',['type','payer']]]){const part=value[key];if(!exact(part,['fields','redactedCount','overflowCount',...extra])||!Array.isArray(part.fields)||part.fields.length>8||!uint(part.redactedCount)||part.redactedCount>64||!uint(part.overflowCount)||part.overflowCount>64)invalid();let prior='';for(const field of part.fields){if(!exact(field,['nameHash','type'])||typeof field.nameHash!=='string'||!/^[a-f0-9]{64}$/.test(field.nameHash)||field.nameHash<=prior||!TYPE_BUCKETS.includes(field.type)||field.type==='absent')invalid();prior=field.nameHash;}}if(!TYPE_BUCKETS.includes(value.billing.type)||!['absent',...PAYER_ENUM].includes(value.billing.payer))invalid();}
 if(!ordered(value.messageContentShapes,CONTENT_SHAPES)||!ordered(value.messageContentCauses,CONTENT_CAUSES))invalid();return true;
}
