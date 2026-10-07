// Diagnostic inspection only. These predicates preserve admission at 94bc1ff.
const RESPONSE_KEYS = new Set(['id','object','created_at','completed_at','status','error','incomplete_details','instructions','max_output_tokens','max_tool_calls','model','output','parallel_tool_calls','previous_response_id','reasoning','store','temperature','text','tool_choice','tools','top_p','truncation','usage','user','metadata','service_tier','safety_identifier','prompt_cache_key','prompt_cache_options','prompt_cache_retention','background','conversation','top_logprobs','personality','access_programs','moderation','prompt','prompt_cache_diagnostics']);
export const FINANCIAL_REASON_CODES=Object.freeze(['envelope-shape','envelope-extras','status','model','tier','optional-null-scope','background-scope','conversation-scope','access-programs-scope','tool-choice-scope','parallel-tools-scope','text-shape','text-extras','text-verbosity','text-format','provider-error','incomplete-details','tools-scope','previous-response-scope','usage-shape','usage-extras','input-details-shape','output-details-shape','input-details-extras','output-details-extras','counter-missing','counter-invalid','counter-total','input-bound','output-bound','cache-subsets','reasoning-subset','output-shape','output-kind','reasoning-extras','reasoning-content','message-shape','content-kind','content-extras','annotations-scope','logprobs-scope']);
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const uint=value=>Number.isSafeInteger(value)&&value>=0;
const extras=(value,keys)=>Object.keys(value).some(key=>!keys.includes(key));
const bucket=(value,expected)=>value===undefined?'absent':value===null?'null':expected(value)?'expected':'other';
const empty=value=>Array.isArray(value)&&value.length===0;
export const FINANCIAL_SHAPE_KEYS=Object.freeze(['envelope','status','model','tier','moderation','prompt','promptCacheDiagnostics','background','conversation','accessPrograms','toolChoice','parallelTools','previousResponse','error','incompleteDetails','text','textFormat','textVerbosity','usage','inputDetails','outputDetails','inputTokens','cachedTokens','cacheWriteTokens','outputTokens','reasoningTokens','totalTokens','tools','output']);
export const FINANCIAL_OUTPUT_TYPES=Object.freeze(['message','reasoning','OTHER']);
export const FINANCIAL_CONTENT_TYPES=Object.freeze(['output_text','refusal','summary_text','reasoning_text','OTHER']);
export function inspectFinancialResponse(data,request,inputBound){
 const failures=new Set(),add=(code,failed)=>{if(failed)failures.add(code);};
 const d=record(data)?data:{},usage=record(d.usage)?d.usage:{},input=record(usage.input_tokens_details)?usage.input_tokens_details:{},output=record(usage.output_tokens_details)?usage.output_tokens_details:{};
 add('envelope-shape',!record(data));add('envelope-extras',record(data)&&Object.keys(data).some(key=>!RESPONSE_KEYS.has(key)));
 add('status',!['completed','incomplete'].includes(d.status));add('model',request==null||d.model!==request.model);add('tier',d.service_tier!=='default');
 add('optional-null-scope',['moderation','prompt','prompt_cache_diagnostics'].some(key=>d[key]!=null));add('background-scope',d.background===true);add('conversation-scope',d.conversation!=null);add('access-programs-scope',d.access_programs!=null);
 add('tool-choice-scope',d.tool_choice!=null&&d.tool_choice!=='none');add('parallel-tools-scope',d.parallel_tool_calls===true);
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
   add('message-shape',extras(item,['id','type','role','status','content'])||!Array.isArray(item.content));
   for(const c of Array.isArray(item.content)?item.content:[]){
    contentTypes.add(record(c)&&FINANCIAL_CONTENT_TYPES.includes(c.type)?c.type:'OTHER');
    if(!record(c)||!['output_text','refusal'].includes(c.type)){add('content-kind',true);continue;}
    add('content-extras',extras(c,c.type==='refusal'?['type','refusal']:['type','text','annotations','logprobs']));add('annotations-scope',c.annotations!=null&&!empty(c.annotations));add('logprobs-scope',c.logprobs!=null&&!empty(c.logprobs));
   }
  }
 }
 const values=[data,d.status,d.model,d.service_tier,d.moderation,d.prompt,d.prompt_cache_diagnostics,d.background,d.conversation,d.access_programs,d.tool_choice,d.parallel_tool_calls,d.previous_response_id,d.error,d.incomplete_details,d.text,d.text?.format,d.text?.verbosity,d.usage,usage.input_tokens_details,usage.output_tokens_details,usage.input_tokens,input.cached_tokens,input.cache_write_tokens,usage.output_tokens,output.reasoning_tokens,usage.total_tokens,d.tools,d.output];
 const expectations=[record,v=>['completed','incomplete'].includes(v),v=>v===request?.model,v=>v==='default',()=>false,()=>false,()=>false,v=>v===false,()=>false,()=>false,v=>v==='none',v=>v!==true,()=>false,()=>false,v=>record(v)&&Object.keys(v).join('|')==='reason'&&v.reason==='max_output_tokens',record,v=>record(v)&&!extras(v,['type'])&&v.type==='text',v=>['low','medium','high'].includes(v),record,record,record,uint,uint,uint,uint,uint,uint,empty,Array.isArray];
 const controlledShape=Object.fromEntries(FINANCIAL_SHAPE_KEYS.map((key,index)=>[key,bucket(values[index],expectations[index])]));controlledShape.outputTypes=FINANCIAL_OUTPUT_TYPES.filter(type=>itemTypes.has(type));controlledShape.contentTypes=FINANCIAL_CONTENT_TYPES.filter(type=>contentTypes.has(type));
 const fixedReasonCodes=FINANCIAL_REASON_CODES.filter(code=>failures.has(code));return {validated:fixedReasonCodes.length===0,fixedReasonCodes,controlledShape};
}
export function validateFinancialInspection(value){
 if(!record(value)||Object.keys(value).sort().join('|')!==['validated','fixedReasonCodes','controlledShape'].sort().join('|')||typeof value.validated!=='boolean'||!Array.isArray(value.fixedReasonCodes)||JSON.stringify(value.fixedReasonCodes)!==JSON.stringify(FINANCIAL_REASON_CODES.filter(code=>value.fixedReasonCodes.includes(code)))||value.validated!==(value.fixedReasonCodes.length===0))throw Error('Invalid controlled financial inspection');
 const shape=value.controlledShape;if(!record(shape)||Object.keys(shape).sort().join('|')!==[...FINANCIAL_SHAPE_KEYS,'outputTypes','contentTypes'].sort().join('|')||FINANCIAL_SHAPE_KEYS.some(key=>!['absent','null','expected','other'].includes(shape[key])))throw Error('Invalid controlled financial shape');
 for(const [key,types] of [['outputTypes',FINANCIAL_OUTPUT_TYPES],['contentTypes',FINANCIAL_CONTENT_TYPES]])if(!Array.isArray(shape[key])||JSON.stringify(shape[key])!==JSON.stringify(types.filter(type=>shape[key].includes(type))))throw Error('Invalid controlled financial types');return true;
}
