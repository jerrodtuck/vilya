import fs from 'node:fs';
const IDS=/^[A-Za-z0-9_-]{1,128}$/;
const STAGES=new Set(['send-start','http-received','http-rejected','body-unavailable','body-observed','schema-rejected','response-accepted','transport-unavailable']);
const STATUS=new Set(['completed','incomplete','failed','cancelled','queued','in_progress']);
const MODELS=new Set(['gpt-6.1-sol','gpt-6-astra']);
const TIERS=new Set(['default','priority','flex','auto','scale']);
const COUNT_KEYS=['input','cachedInput','cacheWrite','output','reasoning','total'];
const KEYS=['schemaVersion','requestId','kind','stage','observedAt','httpStatus','providerRequestId','clientRequestId','responseId','responseStatus','responseModel','serviceTier','counts','counterPresence'];
const uint=n=>Number.isSafeInteger(n)&&n>=0;
export const safeProviderId=(value,prefix,credential=null)=>typeof value==='string'&&(prefix==='req'?/^req_[A-Za-z0-9_-]{1,120}$/:/^resp_[A-Za-z0-9_-]{1,120}$/).test(value)&&!(credential&&value.includes(credential))?value:null;
export function diagnosticEvent({requestId,kind,stage,httpStatus=null,providerRequestId=null,data=null,clock=Date.now,billingValidated,billingFailureCode}){
 const usage=data?.usage,values={input:kind==='count'?data?.input_tokens:usage?.input_tokens,cachedInput:usage?.input_tokens_details?.cached_tokens,cacheWrite:usage?.input_tokens_details?.cache_write_tokens,output:usage?.output_tokens,reasoning:usage?.output_tokens_details?.reasoning_tokens,total:usage?.total_tokens};
 const result={schemaVersion:1,requestId,kind,stage,observedAt:clock(),httpStatus:Number.isInteger(httpStatus)&&httpStatus>=100&&httpStatus<=599?httpStatus:null,providerRequestId:safeProviderId(providerRequestId,'req'),clientRequestId:requestId,responseId:safeProviderId(data?.id,'resp'),responseStatus:STATUS.has(data?.status)?data.status:null,responseModel:MODELS.has(data?.model)?data.model:null,serviceTier:TIERS.has(data?.service_tier)?data.service_tier:null,counts:Object.fromEntries(COUNT_KEYS.map(k=>[k,uint(values[k])?values[k]:null])),counterPresence:Object.fromEntries(COUNT_KEYS.map(k=>[k,values[k]!==undefined]))};if(billingValidated!==undefined){result.schemaVersion=2;result.billingValidated=billingValidated;result.billingFailureCode=billingFailureCode;}validateDiagnostic(result);return result;
}
export function validateDiagnostic(event){
 if(!event||Object.keys(event).sort().join()!==[...KEYS,...(event.schemaVersion===2?['billingValidated','billingFailureCode']:[])].sort().join()||![1,2].includes(event.schemaVersion)||typeof event.requestId!=='string'||!IDS.test(event.requestId)||event.clientRequestId!==event.requestId||!['count','generation'].includes(event.kind)||!STAGES.has(event.stage)||!uint(event.observedAt)||!(event.httpStatus===null||Number.isInteger(event.httpStatus)&&event.httpStatus>=100&&event.httpStatus<=599))throw Error('Invalid safe diagnostic');
 if(event.schemaVersion===2&&(event.kind!=='generation'||!['body-observed','schema-rejected'].includes(event.stage)||typeof event.billingValidated!=='boolean'||event.billingFailureCode!==(event.billingValidated?null:'unsupported-financial-scope')))throw Error('Invalid financial diagnostic');
 for(const key of ['providerRequestId','responseId'])if(event[key]!==null&&safeProviderId(event[key],key==='providerRequestId'?'req':'resp')!==event[key])throw Error('Invalid safe diagnostic');
 if(event.responseStatus!==null&&!STATUS.has(event.responseStatus)||event.responseModel!==null&&!MODELS.has(event.responseModel)||event.serviceTier!==null&&!TIERS.has(event.serviceTier))throw Error('Invalid safe diagnostic');
 for(const key of ['counts','counterPresence'])if(!event[key]||Object.keys(event[key]).sort().join()!==[...COUNT_KEYS].sort().join())throw Error('Invalid safe diagnostic');
 for(const key of COUNT_KEYS)if(!(event.counts[key]===null||uint(event.counts[key]))||typeof event.counterPresence[key]!=='boolean'||!event.counterPresence[key]&&event.counts[key]!==null)throw Error('Invalid safe diagnostic');return true;
}
export function recordDiagnostic(ledger,event,{io=fs}={}){
 validateDiagnostic(event);const state=ledger.read(),record=(event.kind==='count'?state.preflights:state.requests).find(r=>r.id===event.requestId);if(!record||!['pending','unknown','complete'].includes(record.status))throw Error('Diagnostic lacks durable request');
 const file=ledger.file+'.diagnostics.jsonl',lock=file+'.lock',temp=file+'.next';let handle,output;
 const stat=target=>{try{return io.lstatSync(target);}catch(error){if(error.code==='ENOENT')return null;throw error;}};
 try{
  for(const target of [file,lock,temp])if(stat(target)?.isSymbolicLink())throw Error('Unsafe diagnostic path');
  handle=io.openSync(lock,'wx');if(stat(temp))throw Error('Unfinished diagnostic replacement');
  const current=stat(file);if(current&&(!current.isFile()||current.size>1000000))throw Error('Diagnostic journal bound');
  const rows=current?io.readFileSync(file,'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line)):[];for(const row of rows)validateDiagnostic(row);
  if(rows.filter(r=>r.requestId===event.requestId).length>=8)throw Error('Diagnostic request bound');
  const replacement=[...rows,event].map(row=>JSON.stringify(row)).join('\n')+'\n';if(Buffer.byteLength(replacement)>1000000)throw Error('Diagnostic journal bound');
  output=io.openSync(temp,'wx');io.writeFileSync(output,replacement);io.fsyncSync(output);io.closeSync(output);output=undefined;io.renameSync(temp,file);return true;
 }finally{if(output!==undefined)io.closeSync(output);if(handle!==undefined){io.closeSync(handle);io.unlinkSync(lock);}}
}
