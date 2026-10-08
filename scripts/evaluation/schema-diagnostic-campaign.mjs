// Prospective, offline-only scaffold. This module cannot publish or dispatch live.
import crypto from 'node:crypto';
import {types} from 'node:util';
import {apiConfig,maximumCost,actualCost} from './money.mjs';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const hash=value=>sha(JSON.stringify(value));
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const prior='scripts/evaluation/runtime/campaign-schema-probe-1/';
export const SCHEMA_DIAGNOSTIC_ORIGIN=freeze({
 [prior+'pilot-budget.json']:'9d4ebb544fad739d401d5cad553849a22e1fde62576ce59d96d132f6030ad27b',
 [prior+'pilot-budget.json.diagnostics.jsonl']:'8a4f5dc42007060e466ca945720307c2099dafe0b40a1400ce707f67f1560f79',
 [prior+'execution.attempt.json']:'cd0b7ef573d5a1eed577992b83697e7b1fc1db4639ac4c46fc8d0f1622ae3574',
 'scripts/evaluation/runtime/schema-probe-357-1.claim.json':'82aea4dec37443341ce787b0ba81100f38f3ddfec3cd681567c67871208114bf',
 'scripts/evaluation/runtime/schema-probe-357-1.authorization.json':'fef2ee7ce70b899b8555b67ea9ab3759b6e5028ce838315759a720c6c082d90b',
 'scripts/evaluation/runtime/openai-openapi-2026-10-08.json':'051b70dab8dd177b84fd7ec5556eff48894cf3b5246db641632ecbc232ff2777'
});
export const SCHEMA_DIAGNOSTIC_POLICY=freeze({
 schemaSource:{url:'https://raw.githubusercontent.com/openai/openai-openapi/main/openapi.json',revision:'506aff0a8099581b50e119b87f8f2692cdad043f',committedAt:'2026-10-08T07:48:49Z',capturedAt:'2026-10-08'},
 schemaVersion:1,campaignId:'357-schema-diagnostic-1',namespace:'diag1_',sourceBase:'6cb282e2f74e04bf324bb8d99617da96596e1037',
 priorReviewedHead:'ea86666cf1ee81664eedf38415883ecc6d8bc351',
 priorStateChecksum:'73af30923b25e701154ceee27f22f6a314022b62a6902588416cfca85d36acc1',
 priorPolicyDigest:'116c130f8f246a0b3c7f5ae6a04845a257ae7acb8409fc3593ef3535cf5cddcc',
 priorModuleManifestDigest:'74b0ffa1164c5603a5f78675a22710fcc1d707ddebe86fc68c3b66679263e4ad',
 workspace:'scripts/evaluation/runtime/campaign-schema-diagnostic-1',claim:'scripts/evaluation/runtime/schema-diagnostic-357-1.claim.json',
 authorization:'scripts/evaluation/runtime/schema-diagnostic-357-1.authorization.json',
 activationRequirements:{separateFixedAuthorization:true,newWindowMs:5400000,paidProbeSlots:1,exactReviewedHead:true,readyReviews:2,immutableClaim:true,initializeStartsClock:false,firstCountStartsClock:true},
 trial:'diag1_schema_1',requestId:'diag1_schema_1_generation_1',model:'gpt-6.1-sol',effort:'medium',maxOutputTokens:4000,maxToolCalls:0,retries:0,
 diagnosticProjectionVersion:3,financialContractVersion:3,trialCap:2000000,totalCap:25000000,
 nativeEnabled:false,maximumGenerations:1,maximumNewCountCalls:1,stopAfterGeneration:true,replayAllowed:false,resetAllowed:false,
 dispatchMs:5040000,finalMs:360000,carry:{known:10929,held:401694,exposure:412623,countCalls:6,consumedTrialSlots:5},
 consumedSlotHistory:[{segment:'pre-continuation',slots:2},{segment:'v2-continuation-1',trial:'api_instruction_1_B',slots:1},{segment:'v2-continuation-1',trial:'api_instruction_1_A',slots:1},{segment:'357-schema-probe-1',trial:'probe1_schema_1',slots:1}]
});
export function createSchemaDiagnosticScaffold(){return freeze({policy:structuredClone(SCHEMA_DIAGNOSTIC_POLICY),predecessorDigests:structuredClone(SCHEMA_DIAGNOSTIC_ORIGIN),activation:null,executionWindow:null,paidRequests:0});}
export function validateSchemaDiagnosticScaffold(value){if(JSON.stringify(value)!==JSON.stringify(createSchemaDiagnosticScaffold()))throw Error('Immutable diagnostic scaffold changed');return true;}
// Caller supplies bytes; this verifier neither opens nor changes actual runtime.
export function verifySchemaDiagnosticPredecessor(bytes){if(!bytes||Object.keys(bytes).sort().join('|')!==Object.keys(SCHEMA_DIAGNOSTIC_ORIGIN).sort().join('|'))throw Error('Exact diagnostic predecessor required');for(const [file,digest]of Object.entries(SCHEMA_DIAGNOSTIC_ORIGIN))if(!Buffer.isBuffer(bytes[file])||sha(bytes[file])!==digest)throw Error('Frozen diagnostic predecessor changed');return true;}
const stores=new WeakMap();
function ownData(value){
 if(!value||typeof value!=='object'||types.isProxy(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Invalid diagnostic generation evidence');
 const descriptors=Object.getOwnPropertyDescriptors(value);
 if(Reflect.ownKeys(descriptors).some(key=>typeof key!=='string'||!Object.hasOwn(descriptors[key],'value')))throw Error('Accessor diagnostic evidence denied');
 return descriptors;
}
function snapshotGenerationUsage(result){
 const envelope=ownData(result);
 if(!Object.hasOwn(envelope,'usage')||Object.keys(envelope).some(key=>!['usage','text'].includes(key))||envelope.text&&envelope.text.value!==null&&typeof envelope.text.value!=='string')throw Error('Invalid diagnostic generation envelope');
 const fields=ownData(envelope.usage.value),names=['input','cachedInput','cacheWrite','output','reasoning','fees'];
 if(Object.keys(fields).sort().join('|')!==names.sort().join('|'))throw Error('Invalid diagnostic usage fields');
 const usage={};for(const name of names){const value=fields[name].value;if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid diagnostic usage counter');usage[name]=value;}
 return freeze(usage);
}
export function offlineSchemaDiagnosticStore(){const p=SCHEMA_DIAGNOSTIC_POLICY,store=Object.freeze({read:()=>structuredClone(stores.get(store))});stores.set(store,{status:'scaffold',executionWindow:null,lastTime:null,newCountCalls:0,newGenerations:0,newTrialSlots:0,reservation:0,cost:null,...structuredClone(p.carry),consumedSlotHistory:structuredClone(p.consumedSlotHistory)});return store;}
export async function runOfflineSchemaDiagnostic({store,provider,authorizeSyntheticWindow=false,prompt,clock=Date.now}){
 if(!stores.has(store)||provider?.kind!=='fake'||authorizeSyntheticWindow!==true||typeof prompt!=='string')throw Error('Synthetic diagnostic authorization required; live unavailable');
 const s=store.read(),p=SCHEMA_DIAGNOSTIC_POLICY;if(s.status!=='scaffold')throw Error('Diagnostic already attempted; no replay');
 s.status='authorizing';stores.set(store,structuredClone(s));
 const sample=(settling=false)=>{const now=clock();if(!Number.isSafeInteger(now)||now<0||s.lastTime!==null&&now<s.lastTime||s.executionWindow&&now>=(settling?s.executionWindow.deadline:s.executionWindow.dispatchDeadline))throw Error('Invalid diagnostic clock');s.lastTime=now;return now;};
 try{
  const now=sample();if(!Number.isSafeInteger(now+p.dispatchMs+p.finalMs))throw Error('Diagnostic deadline overflow');
  s.executionWindow={startedAt:now,dispatchDeadline:now+p.dispatchMs,deadline:now+p.dispatchMs+p.finalMs};s.status='count-pending';s.newCountCalls=1;s.countCalls++;s.newTrialSlots=1;s.consumedTrialSlots++;s.consumedSlotHistory.push({segment:p.campaignId,trial:p.trial,slots:1});stores.set(store,structuredClone(s));
  const packet=freeze({model:p.model,effort:p.effort,prompt,maxOutputTokens:p.maxOutputTokens,maxToolCalls:0,retries:0,diagnosticProjectionVersion:3,financialContractVersion:3});
  const certificate=freeze(structuredClone(await provider.count(packet)));sample();
  if(!certificate||Object.keys(certificate).sort().join('|')!==['inputTokens','payloadHash'].join('|')||certificate.payloadHash!==hash(packet)||!Number.isSafeInteger(certificate.inputTokens)||certificate.inputTokens<0||certificate.inputTokens>32000)throw Error('Exact diagnostic count required');
  const rate=apiConfig().models[p.model],reservation=maximumCost(rate,certificate.inputTokens,p.maxOutputTokens);if(reservation>p.trialCap||s.exposure+reservation>p.totalCap)throw Error('Diagnostic cap exhausted');
  s.status='generation-pending';s.newGenerations=1;s.reservation=reservation;s.held+=reservation;s.exposure+=reservation;stores.set(store,structuredClone(s));
  const usage=snapshotGenerationUsage(await provider.send(packet,certificate));sample(true);
  if(usage.input>certificate.inputTokens||usage.output>p.maxOutputTokens||usage.cachedInput>usage.input||usage.cacheWrite>usage.input-usage.cachedInput||usage.reasoning>usage.output||usage.fees!==0)throw Error('Unresolved diagnostic generation');
  const cost=actualCost(rate,usage),known=s.known+cost,held=s.held-reservation,exposure=s.exposure-reservation+cost;
  if([cost,known,held,exposure].some(value=>!Number.isSafeInteger(value)||value<0)||cost>reservation||cost>p.trialCap||exposure>p.totalCap||known<p.carry.known||held<p.carry.held||known+held!==exposure)throw Error('Diagnostic settlement exceeds reservation');
  s.cost=cost;s.known=known;s.held=held;s.exposure=exposure;
 }catch{/* Unknown evidence keeps the complete reservation and consumes the slot. */}
 finally{s.status='stopped';stores.set(store,structuredClone(s));}
 return freeze(store.read());
}
