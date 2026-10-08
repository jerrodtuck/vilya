import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {SCHEMA_PROBE_POLICY as P,acquireSchemaProbeLease,readSchemaProbeClaimLocked,closeSchemaProbeLease} from './schema-probe-campaign.mjs';
import {apiConfig,maximumCost,actualCost,exactKeys,integer} from './money.mjs';
import {createOpenAITransport,COUNT_BILLING_INTERPRETATION} from './openai-transport.mjs';
import {recordDiagnostic} from './diagnostics.mjs';
import {generate} from './generation.mjs';

const repo=fileURLToPath(new URL('../..',import.meta.url));
const digest=v=>crypto.createHash('sha256').update(v).digest('hex');
const hash=v=>digest(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const SCHEMA_PROBE_PATHS=Object.freeze({workspace:path.join(repo,P.workspace),ledger:path.join(repo,P.workspace,'pilot-budget.json'),authorization:path.join(repo,'scripts/evaluation/runtime/schema-probe-357-1.authorization.json'),claim:path.join(repo,P.claim),prompt:path.join(repo,P.workspace,'probe.private.txt'),env:path.join(repo,'.env')});
function safe(file){let at=path.parse(file).root;for(const part of file.slice(at.length).split(path.sep)){at=path.join(at,part);try{if(fs.lstatSync(at).isSymbolicLink())throw Error('Unsafe schema-probe path');}catch(e){if(e.code!=='ENOENT')throw e;}}return file;}
function bytes(file){safe(file);const st=fs.statSync(file);if(!st.isFile()||st.size>1000000)throw Error('Schema-probe file bound');return fs.readFileSync(file);}
function authorization(head){const raw=bytes(SCHEMA_PROBE_PATHS.authorization),value=JSON.parse(raw);const expected={schemaVersion:1,campaignId:P.campaignId,reviewedHead:head,windowMinutes:90,paidProbeSlots:1,userAuthorized:true};if(!same(value,expected))throw Error('Separate fixed 90-minute/one-slot user authorization required');return digest(raw);}
function publish(file,value){safe(file);const temp=file+'.next';const fd=fs.openSync(temp,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify(value)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.linkSync(temp,file);fs.unlinkSync(temp);}
function binding(lease,head){const claim=readSchemaProbeClaimLocked(lease);if(claim.activation.reviewedHead!==head)throw Error('Exact reviewed head required');return {head,claimDigest:digest(bytes(SCHEMA_PROBE_PATHS.claim)),authorizationDigest:authorization(head),policyDigest:hash(P)};}

// Deliberately implements only the existing generation/transport guard interface.
// No public reset, pair allocator, native path or subsequent trial is available.
class ProbeLedger {
  constructor(lease,head,bound,clock=Date.now){this.lease=lease;this.head=head;this.bound=Object.freeze({...bound});this.clock=clock;this.file=SCHEMA_PROBE_PATHS.ledger;this.config=apiConfig();}
  check(){const current=binding(this.lease,this.head);if(!same(current,this.bound))throw Error('Probe execution binding changed');return current;}
  boundEvidence(){if(authorization(this.head)!==this.bound.authorizationDigest||digest(bytes(SCHEMA_PROBE_PATHS.claim))!==this.bound.claimDigest)throw Error('Probe authorization/claim changed');return this.bound;}
  read(){if(fs.existsSync(this.file+'.next'))throw Error('Probe replacement unfinished');const raw=bytes(this.file);if(this.expectedBytes!==undefined&&digest(raw)!==this.expectedBytes)throw Error('Probe state changed outside transaction');const envelope=JSON.parse(raw);exactKeys(envelope,['state','sha256'],'probe envelope');if(envelope.sha256!==hash(envelope.state))throw Error('Probe checksum mismatch');this.validate(envelope.state);this.expectedBytes=digest(raw);return envelope.state;}
  validate(s){
    exactKeys(s,['version','binding','carry','consumedSlotHistory','lastTime','executionWindow','status','blocked','preflights','requests'],'probe state');
    const history=s.status==='initialized'?P.consumedSlotHistory:[...P.consumedSlotHistory,{segment:P.campaignId,trial:P.trial,slots:1}];
    if(s.version!==1||!same(s.binding,this.boundEvidence())||!same(s.carry,P.carry)||!same(s.consumedSlotHistory,history)||!['initialized','running','stopped'].includes(s.status)||typeof s.blocked!=='boolean'||!Array.isArray(s.preflights)||!Array.isArray(s.requests)||s.preflights.length>1||s.requests.length>1)throw Error('Probe immutable allocation changed');
    integer(s.lastTime,'probe time');
    if(s.executionWindow!==null){exactKeys(s.executionWindow,['startedAt','dispatchDeadline','finalDeadline'],'probe window');const w=s.executionWindow;Object.values(w).forEach(v=>integer(v,'window time'));if(w.dispatchDeadline!==w.startedAt+5040000||w.finalDeadline!==w.startedAt+5400000||s.preflights.length!==1||s.preflights[0].start!==w.startedAt)throw Error('Probe window changed');}else if(s.preflights.length||s.requests.length)throw Error('Probe window missing');
    for(const c of s.preflights){exactKeys(c,['requestId','trial','phase','payloadHash','model','effort','serviceTier','pricingDate','billingInterpretation','id','status','start','inputTokens','providerRequestId'],'probe count');this.scope(c);if(c.id!==P.requestId+'_count'||!/^[a-f0-9]{64}$/.test(c.payloadHash)||c.serviceTier!=='default'||c.pricingDate!=='2026-10-06'||c.billingInterpretation!==COUNT_BILLING_INTERPRETATION||!['pending','unknown','complete'].includes(c.status))throw Error('Probe count changed');if(c.status==='complete'){integer(c.inputTokens,'input tokens',1);if(c.inputTokens>32000)throw Error('Probe count bound');}else if(c.inputTokens!==null||c.providerRequestId!==null)throw Error('Probe pending count changed');this.providerId(c.providerRequestId);}
    for(const r of s.requests){exactKeys(r,['id','trial','phase','model','effort','inputBound','outputBound','reservation','start','end','status','cost','usage','providerRequestId'],'probe request');this.scope({...r,requestId:r.id});integer(r.start,'request start');if(!s.preflights[0]||s.preflights[0].status!=='complete'||r.inputBound!==s.preflights[0].inputTokens||r.outputBound!==P.maxOutputTokens||r.reservation!==maximumCost(this.config.models[P.model],r.inputBound,r.outputBound)||r.reservation>P.trialCap||r.reservation+P.carry.exposure>P.totalCap||!['pending','unknown','complete'].includes(r.status)||r.start<s.preflights[0].start||r.start>=s.executionWindow.dispatchDeadline)throw Error('Probe reservation changed');if(r.status==='complete'){if(r.cost!==actualCost(this.config.models[P.model],r.usage)||r.cost>r.reservation||r.usage.input>r.inputBound||r.usage.output>r.outputBound||!Number.isSafeInteger(r.end)||r.end<r.start||r.end>=Math.min(r.start+60000,s.executionWindow.dispatchDeadline))throw Error('Probe reconciliation changed');}else if(r.cost!==null||r.usage!==null||r.end!==null)throw Error('Probe held evidence changed');this.providerId(r.providerRequestId);}
    if([...s.preflights,...s.requests].some(r=>r.status==='unknown')&&!s.blocked||s.status==='initialized'&&(s.preflights.length||s.requests.length)||s.status==='stopped'&&[...s.preflights,...s.requests].some(r=>r.status==='pending'))throw Error('Probe terminal fence changed');
  }
  providerId(v){if(v!==null&&(typeof v!=='string'||!/^req_[A-Za-z0-9_-]{1,120}$/.test(v)))throw Error('Probe provider identifier');}
  scope(v){if(v.requestId!==P.requestId||v.trial!==P.trial||v.phase!=='implementation'||v.model!==P.model||v.effort!==P.effort)throw Error('Probe fixed request scope');}
  write(s){this.validate(s);safe(this.file);const temp=this.file+'.next',fd=fs.openSync(temp,'wx',0o600),raw=JSON.stringify({state:s,sha256:hash(s)})+'\n';try{fs.writeFileSync(fd,raw);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(temp,this.file);this.expectedBytes=digest(raw);}
  transaction(change){const lock=this.file+'.lock',fd=fs.openSync(safe(lock),'wx',0o600);try{const s=this.read(),now=integer(this.clock(),'clock');if(now<s.lastTime)throw Error('Probe clock regressed');const result=change(s,now);s.lastTime=now;this.write(s);return result;}finally{fs.closeSync(fd);fs.unlinkSync(lock);}}
  ready(s){if(s.status==='stopped'||s.blocked||[...s.preflights,...s.requests].some(r=>r.status!=='complete'))throw Error('Probe stopped or unresolved');}
  beginPreflight(meta){return this.transaction((s,now)=>{this.ready(s);this.scope(meta);if(s.status!=='running'||s.preflights.length)throw Error('Probe count already attempted');s.executionWindow={startedAt:now,dispatchDeadline:now+5040000,finalDeadline:now+5400000};const c={...meta,id:P.requestId+'_count',status:'pending',start:now,inputTokens:null,providerRequestId:null};s.preflights.push(c);return {...c,deadline:now+15000};});}
  completePreflight(id,result){return this.transaction((s,now)=>{exactKeys(result,['inputTokens','providerRequestId'],'count result');const c=s.preflights[0];if(c?.id!==id||c.status!=='pending'||now>=c.start+15000)throw Error('Probe count deadline');Object.assign(c,result,{status:'complete'});return true;});}
  holdPreflight(id){return this.transaction(s=>{const c=s.preflights[0];if(c?.id!==id||c.status!=='pending')throw Error('Probe count hold');c.status='unknown';s.blocked=true;});}
  reserve(v){return this.transaction((s,now)=>{this.ready(s);this.scope(v);if(s.requests.length||now>=s.executionWindow.dispatchDeadline)throw Error('Probe generation already attempted/deadline');const r={id:v.requestId,trial:v.trial,phase:v.phase,model:v.model,effort:v.effort,inputBound:v.inputBound,outputBound:v.outputBound,reservation:maximumCost(this.config.models[P.model],v.inputBound,v.outputBound),start:now,end:null,status:'pending',cost:null,usage:null,providerRequestId:null};s.requests.push(r);return structuredClone(r);});}
  reconcile(id,usage,metadata,observedAt=null){return this.transaction((s,now)=>{const r=s.requests[0];if(r?.id!==id||r.status!=='pending'||now>=Math.min(r.start+60000,s.executionWindow.dispatchDeadline)||observedAt!==null&&(observedAt<r.start||observedAt>now))throw Error('Probe reconciliation deadline');exactKeys(metadata,['providerRequestId'],'provider metadata');Object.assign(r,{usage:structuredClone(usage),cost:actualCost(this.config.models[P.model],usage),providerRequestId:metadata.providerRequestId,status:'complete',end:observedAt??now});});}
  hold(id){return this.transaction(s=>{const r=s.requests[0];if(r?.id!==id||r.status!=='pending')throw Error('Probe hold');r.status='unknown';s.blocked=true;});}
  deadline(){return this.read().executionWindow.dispatchDeadline;}
  stop(){const lock=this.file+'.lock',fd=fs.openSync(safe(lock),'wx',0o600);try{const s=this.read();s.status='stopped';for(const r of [...s.preflights,...s.requests])if(r.status==='pending'){r.status='unknown';s.blocked=true;}this.write(s);}finally{fs.closeSync(fd);fs.unlinkSync(lock);}}
}

function parse(args){const v={};for(let i=0;i<args.length;i++){const k=args[i];if(k==='--live'){if(v[k])throw Error('Duplicate option');v[k]=true;}else if(['--workflow-protocol','--reviewed-head','--workspace','--ledger','--claim','--authorization','--prompt'].includes(k)&&!v[k]&&args[i+1])v[k]=args[++i];else throw Error('Invalid probe option');}if(!v['--live']||v['--workflow-protocol']!=='2'||!/^[a-f0-9]{40}$/.test(v['--reviewed-head']??''))throw Error('Explicit probe live protocol/head required');for(const key of ['workspace','ledger','claim','authorization','prompt'])if(v['--'+key]!==SCHEMA_PROBE_PATHS[key])throw Error('Exact probe paths required');return v;}
export async function schemaProbeCLI(args){
  const mode=args[0];if(!['--initialize','--run'].includes(mode))throw Error('Explicit probe action required');const v=parse(args.slice(1)),head=v['--reviewed-head'],lease=acquireSchemaProbeLease();
  try{
    const bound=binding(lease,head);
    if(mode==='--initialize'){
      // Atomic directory creation is the permanent initialization attempt fence.
      safe(SCHEMA_PROBE_PATHS.workspace);fs.mkdirSync(SCHEMA_PROBE_PATHS.workspace);
      const state={version:1,binding:bound,carry:structuredClone(P.carry),consumedSlotHistory:structuredClone(P.consumedSlotHistory),lastTime:integer(Date.now(),'clock'),executionWindow:null,status:'initialized',blocked:false,preflights:[],requests:[]};publish(SCHEMA_PROBE_PATHS.ledger,{state,sha256:hash(state)});return {status:'initialized',executionWindowStarted:false,paidRequests:0};
    }
    // The host must load only this fixed .env externally with Node's env-file flag.
    if(!process.execArgv.includes('--env-file='+SCHEMA_PROBE_PATHS.env)||!process.env.OPENAI_API_KEY)throw Error('Fixed externally loaded .env required');
    const ledger=new ProbeLedger(lease,head,bound);const initial=ledger.read();if(initial.status!=='initialized'||fs.existsSync(ledger.file+'.lock'))throw Error('Probe already attempted; restart denied');
    publish(path.join(SCHEMA_PROBE_PATHS.workspace,'execution.attempt.json'),{schemaVersion:1,binding:bound});
    ledger.transaction(s=>{if(s.status!=='initialized')throw Error('Probe already attempted; restart denied');s.status='running';s.consumedSlotHistory.push({segment:P.campaignId,trial:P.trial,slots:1});});
    try{
      const prompt=bytes(SCHEMA_PROBE_PATHS.prompt).toString('utf8');
      const provider=createOpenAITransport({liveEnabled:true,countBillingInterpretation:COUNT_BILLING_INTERPRETATION,diagnosticGuard:event=>recordDiagnostic(ledger,event),preflightGuard:{begin:m=>ledger.beginPreflight(m),complete:(id,r)=>ledger.completePreflight(id,r),hold:id=>ledger.holdPreflight(id)},reservationGuard:request=>{const r=ledger.read().requests[0];if(r?.status!=='pending'||r.id!==request.reservation?.id)throw Error('Probe reservation missing');return r;},fetchImpl:(...request)=>{ledger.check();const s=ledger.read(),count=request[0].endsWith('/input_tokens'),r=count?s.preflights[0]:s.requests[0],now=integer(ledger.clock(),'network clock');if(r?.status!=='pending'||now<s.lastTime||now>=Math.min(r.start+(count?15000:60000),s.executionWindow.dispatchDeadline))throw Error('Probe pre-network deadline');return globalThis.fetch(...request);}});
      await generate(ledger,provider,{prompt,requestId:P.requestId,trial:P.trial,phase:'implementation',model:P.model,effort:P.effort,maxOutputTokens:P.maxOutputTokens});
    }catch{/* Transport details and private content never enter controller output. */}
    finally{ledger.stop();}
    const s=ledger.read(),r=s.requests[0],known=P.carry.known+(r?.cost??0),held=P.carry.held+(r&&r.status!=='complete'?r.reservation:0);return {status:'stopped',blocked:s.blocked,known,held,exposure:known+held,countCalls:P.carry.countCalls+s.preflights.length,consumedTrialSlots:P.carry.consumedTrialSlots+1,paidRequests:s.requests.length};
  }finally{closeSchemaProbeLease(lease);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(await schemaProbeCLI(process.argv.slice(2))));}catch{console.error('Schema probe held; preserve all evidence');process.exitCode=1;}}
