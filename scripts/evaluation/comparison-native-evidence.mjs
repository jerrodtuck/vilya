import {importNativeUsage} from './native-usage.mjs';
const time=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(value))throw Error('Native exact timestamp required');const n=Date.parse(value);if(!Number.isSafeInteger(n)||n<0)throw Error('Native timestamp invalid');return n;};
const COUNT_FIELDS=['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'];
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join()===keys.sort().join();
const content=(record,role,type)=>{const p=record.payload;if(Object.keys(p).some(k=>!['type','id','role','phase','content','turn_id','status','end_turn'].includes(k))||p.status!==undefined&&p.status!=='completed'||p.end_turn!==undefined&&p.end_turn!==true)throw Error('Native message activity scope');if(p.type!=='message'||p.role!==role||!Array.isArray(p.content)||p.content.length!==1||!exact(p.content[0],['type','text'])||p.content[0].type!==type||typeof p.content[0].text!=='string')throw Error('Native single text message required');return p.content[0].text;};
// Whole fresh session only. The historical importer remains available elsewhere,
// but a comparison phase can never use a cutoff or apply an unmetered later turn.
export async function verifyComparisonNativeSession({manifest,session,text,packet,pendingStarted,deadline,dispatchDeadline,now}){
 if(Object.hasOwn(manifest,'cutoffTimestamp')||typeof session!=='string'||!session.endsWith('\n')||Buffer.byteLength(session)>8000000||typeof text!=='string'||!text.trim()||Buffer.byteLength(text)>128000||typeof packet.payload!=='string'||Buffer.byteLength(packet.payload)>32000)throw Error('Bounded whole native phase required');
 const started=time(manifest.startedAt),ended=time(manifest.endedAt),observed=time(manifest.completionObserved?.observedAt),terminal=time(manifest.terminal?.timestamp);
 if(!Number.isSafeInteger(pendingStarted)||!Number.isSafeInteger(deadline)||!Number.isSafeInteger(dispatchDeadline)||!Number.isSafeInteger(now)||started<pendingStarted||started>=dispatchDeadline||ended<started||ended>=deadline||terminal!==ended||observed<ended||observed>now||now>=deadline||manifest.completionObserved?.completed!==true||manifest.completionObserved?.source!=='native-agent-final')throw Error('Native phase time or completion bound');
 const rows=session.split('\n').filter(line=>line.trim()).map(line=>JSON.parse(line));if(rows.length>4096)throw Error('Native phase record bound');let previous=started,user=null,output=null,context=null,sessionCount=0,startEvent=null,completion=null,lastUsage=null,userEvent=null,assistantEvent=null;
 for(let index=0;index<rows.length;index++){
  const row=rows[index],at=time(row?.timestamp),p=row?.payload;if(at<previous||at<started||at>ended||!p||typeof p!=='object'||completion)throw Error('Native record outside single phase');previous=at;
  if(row.type==='session_meta'){if(index!==0||++sessionCount!==1||at!==started)throw Error('Native session identity order');continue;}
  if(!sessionCount)throw Error('Native identity missing');
  if(row.type==='turn_context'){if(context||user||output||typeof p.turn_id!=='string'||!p.turn_id||p.turn_id.length>160)throw Error('Native resumed or extra turn');if(startEvent&&startEvent.turnId!==p.turn_id)throw Error('Native turn identity mismatch');context=p;continue;}
  if(row.type==='response_item'){
   if(!context||!startEvent)throw Error('Native turn start missing');
   if(p.type==='message'&&p.role==='user'){if(user||output||lastUsage||content(row,'user','input_text')!==packet.payload)throw Error('Native exact single packet required');user={at,index};}
   else if(p.type==='message'&&p.role==='assistant'){if(!user||output||!['final','final_answer'].includes(p.phase)||content(row,'assistant','output_text')!==text)throw Error('Native exact single final output required');output={at,index};}
   else if(p.type==='reasoning'){if(!user||output||Object.keys(p).some(k=>!['type','id','summary','content','encrypted_content'].includes(k)))throw Error('Native unsupported reasoning record');for(const field of ['summary','content'])if(p[field]!=null&&(!Array.isArray(p[field])||p[field].some(c=>!exact(c,['type','text'])||!['summary_text','reasoning_text'].includes(c.type)||typeof c.text!=='string')))throw Error('Native reasoning content scope');}
   else throw Error('Native tool/function or unsupported activity');
   if(p.turn_id!==undefined&&p.turn_id!==context.turn_id)throw Error('Native output turn mismatch');continue;
  }
  if(row.type!=='event_msg')throw Error('Native unsupported activity');
  if(p.type==='task_started'){if(startEvent||user||output||typeof p.turn_id!=='string'||!p.turn_id||context&&p.turn_id!==context.turn_id)throw Error('Native extra task start');startEvent={at,index,turnId:p.turn_id};}
  else if(p.type==='token_count'){
   if(!user||!context)throw Error('Native usage outside task');for(const counts of [p.info?.total_token_usage,p.info?.last_token_usage])if(!counts||!Number.isSafeInteger(counts.input_tokens)||counts.input_tokens<0||counts.input_tokens>32000||!Number.isSafeInteger(counts.output_tokens)||counts.output_tokens<0||counts.output_tokens>packet.maxOutputTokens)throw Error('Native phase token bound');lastUsage={at,index,counts:p.info.total_token_usage};
  }
  else if(p.type==='task_complete'){if(!output||!lastUsage||lastUsage.index<output.index||lastUsage.at!==terminal||at!==ended||p.turn_id!==context.turn_id||p.last_agent_message!==text)throw Error('Native final output lacks reconciled completion');completion={at,index};}
  else if(p.type==='user_message'){if(userEvent||!context||output||typeof p.message!=='string'||p.message!==packet.payload)throw Error('Native extra user event');userEvent={at,index};}
  else if(p.type==='agent_message'){if(assistantEvent||!user||completion||typeof p.message!=='string'||p.message!==text||p.phase!==undefined&&!['final','final_answer'].includes(p.phase))throw Error('Native extra assistant event');assistantEvent={at,index};}
  else if(p.type==='agent_reasoning'){if(!user||output||typeof p.text!=='string')throw Error('Native reasoning event scope');}
  else throw Error('Native tool/function or unsupported activity');
 }
 if(!context||!startEvent||!user||!output||!completion||!lastUsage||userEvent&&userEvent.at!==user.at||assistantEvent&&assistantEvent.at!==output.at||output.at>terminal||!exact(lastUsage.counts,COUNT_FIELDS)||!exact(manifest.terminal.counts,COUNT_FIELDS)||COUNT_FIELDS.some(key=>lastUsage.counts[key]!==manifest.terminal.counts[key]))throw Error('Native single completed metered turn required');
 const usage=await importNativeUsage({manifest,stream:session});if(usage.status!=='observed'||usage.usage.inputTokens>32000||usage.usage.outputTokens>packet.maxOutputTokens)throw Error('Native usage unavailable or over bound');return usage;
}
