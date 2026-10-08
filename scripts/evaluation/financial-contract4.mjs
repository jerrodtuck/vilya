// Prospective only: no transport, environment, filesystem or dispatch access.
import {types} from 'node:util';
import {createHash} from 'node:crypto';
export const CONTRACT4_FIELDS=Object.freeze(['billing','frequency_penalty','presence_penalty','tool_usage']);
export const CONTRACT4_REASON_CODES=Object.freeze(['unsafe-evidence','request-tools-scope','billing-scope','frequency-penalty','presence-penalty','tool-usage-scope']);
export const TOOL_USAGE_LIMITS=Object.freeze({maxDepth:4,maxNodes:64,maxKeys:8,maxKeyBytes:64,maxPaths:8});
const plain=value=>!!value&&typeof value==='object'&&!types.isProxy(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
function ownData(value){if(!plain(value))throw Error('Own plain evidence required');const fields=Object.getOwnPropertyDescriptors(value);if(Reflect.ownKeys(fields).some(key=>typeof key!=='string'||!Object.hasOwn(fields[key],'value')))throw Error('Inert own data required');return fields;}
export function inertOwnVersion(value,key='version'){if(!plain(value))throw Error('Unsafe diagnostic version');const field=Object.getOwnPropertyDescriptor(value,key);if(!field||!Object.hasOwn(field,'value'))throw Error('Unsafe diagnostic version accessor');return field.value;}
// Validation must establish exactly what JSON serialization can read. Hidden
// hooks/extras are forbidden, not merely omitted by Object.keys.
export function assertInertDiagnosticData(value,seen=new Set(),budget={nodes:0},depth=0){
 if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return true;
 if(!value||typeof value!=='object'||types.isProxy(value)||++budget.nodes>4096||depth>32||seen.has(value))throw Error('Unsafe diagnostic serialization');
 const array=Array.isArray(value);if(array?Object.getPrototypeOf(value)!==Array.prototype:!plain(value))throw Error('Unsafe diagnostic prototype');
 if(Object.getOwnPropertyDescriptor(Object.prototype,'toJSON')||array&&Object.getOwnPropertyDescriptor(Array.prototype,'toJSON'))throw Error('Unsafe inherited serialization hook');
 const fields=Object.getOwnPropertyDescriptors(value),keys=Reflect.ownKeys(fields);
 if(keys.length>(array?257:128)||keys.some(key=>typeof key!=='string'||!Object.hasOwn(fields[key],'value')||key==='toJSON'||!(array&&key==='length')&&!fields[key].enumerable)||array&&(keys.length!==fields.length.value+1||keys.some(key=>key!=='length'&&!/^(0|[1-9][0-9]*)$/.test(key))))throw Error('Unsafe diagnostic own fields');
 seen.add(value);try{for(const key of keys)if(!(array&&key==='length'))assertInertDiagnosticData(fields[key].value,seen,budget,depth+1);}finally{seen.delete(value);}return true;
}
function snapshot(value,seen=new Set(),budget={nodes:0},depth=0){
 if(value===null||['string','number','boolean','undefined'].includes(typeof value))return value;
 if(++budget.nodes>4096||depth>20||!value||typeof value!=='object'||types.isProxy(value)||seen.has(value))throw Error('Evidence bound');
 seen.add(value);try{const array=Array.isArray(value);if(array&&Object.getPrototypeOf(value)!==Array.prototype)throw Error('Plain array required');const fields=array?Object.getOwnPropertyDescriptors(value):ownData(value),keys=Reflect.ownKeys(fields);if(keys.some(key=>typeof key!=='string'||!Object.hasOwn(fields[key],'value'))||keys.length>(array?257:128)||array&&keys.length!==fields.length.value+1)throw Error('Evidence fields');const result=array?[]:Object.create(null);for(const key of keys){if(array&&key==='length')continue;if(array&&!/^(0|[1-9][0-9]*)$/.test(key))throw Error('Array field');Object.defineProperty(result,key,{value:snapshot(fields[key].value,seen,budget,depth+1),enumerable:true});}if(array&&result.length!==fields.length.value)throw Error('Sparse array denied');return Object.freeze(result);}finally{seen.delete(value);}
}
const zero=value=>Number.isSafeInteger(value)&&value===0&&!Object.is(value,-0);
const bucket=value=>value===undefined?'absent':value===null?'null':Array.isArray(value)?'array':['boolean','number','string','object'].includes(typeof value)?typeof value:'OTHER';
export function inspectToolUsage(value,{credential=null}={}){
 const metric={type:types.isProxy(value)?'OTHER':bucket(value),allZero:false,valid:false,depth:0,nodeCount:0,leafCount:0,paths:[],overflow:false},seen=new Set(),paths=[];
 const leaf=(at,parts)=>{metric.leafCount++;if(!parts.some(part=>credential&&part.includes(credential)))paths.push({pathHash:createHash('sha256').update(JSON.stringify(parts),'utf8').digest('hex'),type:types.isProxy(at)?'OTHER':bucket(at),zero:typeof at==='number'?(zero(at)?'zero':'nonzero'):'OTHER'});};
 const walk=(at,parts,depth)=>{metric.nodeCount++;metric.depth=Math.max(metric.depth,depth);if(metric.nodeCount>64||depth>4){metric.overflow=true;return false;}if(typeof at==='number'){leaf(at,parts);return zero(at);}if(!plain(at)||seen.has(at)){leaf(at,parts);return false;}let fields;try{fields=ownData(at);}catch{return false;}const keys=Object.keys(fields).sort();if(!keys.length||keys.length>8||keys.some(key=>Buffer.byteLength(key,'utf8')>64)){metric.overflow=keys.length>8;return false;}seen.add(at);let valid=true;for(const key of keys){if(metric.nodeCount>=64){metric.overflow=true;valid=false;break;}if(!walk(fields[key].value,[...parts,key],depth+1))valid=false;}seen.delete(at);return valid;};
 let valid=false;if(plain(value))valid=walk(value,[],1);else{metric.nodeCount=1;metric.depth=1;}
 paths.sort((a,b)=>a.pathHash<b.pathHash?-1:a.pathHash>b.pathHash?1:0);metric.paths=paths.slice(0,8);metric.overflow||=paths.length>8;metric.valid=valid;metric.allZero=valid&&metric.leafCount>0;return metric;
}
export function inspectContract4(data,request,inputBound,baseInspect){
 let d,r;try{d=snapshot(data);r=snapshot(request);}catch{const base=baseInspect(null,null,inputBound,3);return {...base,validated:false,fixedReasonCodes:[...base.fixedReasonCodes,'unsafe-evidence']};}
 const stripped=Object.create(null);if(plain(d))for(const [key,value]of Object.entries(d))if(!CONTRACT4_FIELDS.includes(key))Object.defineProperty(stripped,key,{value,enumerable:true});
 const base=baseInspect(plain(d)?stripped:d,r,inputBound,3),failures=[];
 if(!plain(r)||!Array.isArray(r.tools)||r.tools.length!==0||!zero(r.maxToolCalls))failures.push('request-tools-scope');
 if(plain(d)&&Object.hasOwn(d,'billing')){const billing=d.billing;if(!plain(billing)||Object.keys(billing).join('|')!=='payer'||!['developer','openai'].includes(billing.payer))failures.push('billing-scope');}
 for(const [field,reason]of [['frequency_penalty','frequency-penalty'],['presence_penalty','presence-penalty']])if(plain(d)&&Object.hasOwn(d,field)&&!zero(d[field]))failures.push(reason);
 if(plain(d)&&Object.hasOwn(d,'tool_usage')&&!inspectToolUsage(d.tool_usage).allZero)failures.push('tool-usage-scope');
 return {...base,validated:base.validated&&!failures.length,fixedReasonCodes:[...base.fixedReasonCodes,...CONTRACT4_REASON_CODES.filter(code=>failures.includes(code))]};
}
export function projectContract4(data,{credential=null}={}){
 let d;try{d=snapshot(data);}catch{d={};return {version:4,billingPayer:'OTHER',frequencyPenalty:'OTHER',presencePenalty:'OTHER',toolUsage:inspectToolUsage(undefined,{credential})};}
 const payer=plain(d?.billing)&&Object.hasOwn(d.billing,'payer')?d.billing.payer:undefined,penalty=value=>typeof value==='number'?(zero(value)?'zero':'nonzero'):bucket(value);
 return {version:4,billingPayer:payer===undefined?'absent':['developer','openai'].includes(payer)?payer:'OTHER',frequencyPenalty:penalty(d?.frequency_penalty),presencePenalty:penalty(d?.presence_penalty),toolUsage:inspectToolUsage(d?.tool_usage,{credential})};
}
export function validateContract4Projection(value){
 assertInertDiagnosticData(value);
 const exact=(v,keys)=>plain(v)&&Object.keys(v).sort().join('|')===keys.sort().join('|'),uint=n=>Number.isSafeInteger(n)&&n>=0;
 if(!exact(value,['version','billingPayer','frequencyPenalty','presencePenalty','toolUsage'])||value.version!==4||!['absent','developer','openai','OTHER'].includes(value.billingPayer)||['frequencyPenalty','presencePenalty'].some(key=>!['absent','null','boolean','string','array','object','OTHER','zero','nonzero'].includes(value[key])))throw Error('Invalid projection4');
 const t=value.toolUsage;if(!exact(t,['type','allZero','valid','depth','nodeCount','leafCount','paths','overflow'])||!['absent','null','boolean','number','string','array','object','OTHER'].includes(t.type)||typeof t.allZero!=='boolean'||typeof t.valid!=='boolean'||typeof t.overflow!=='boolean'||!uint(t.depth)||t.depth>5||!uint(t.nodeCount)||t.nodeCount>64||!uint(t.leafCount)||t.leafCount>64||t.leafCount>t.nodeCount||!Array.isArray(t.paths)||t.paths.length>8||t.allZero!==(t.valid&&t.leafCount>0))throw Error('Invalid tool usage projection4');
 if(t.paths.length>t.leafCount||t.valid&&(t.type!=='object'||t.depth<2||t.depth>4||t.nodeCount<2||!t.leafCount))throw Error('Invalid tool usage consistency');
 let prior='';for(const entry of t.paths){if(!exact(entry,['pathHash','type','zero'])||typeof entry.pathHash!=='string'||!/^[a-f0-9]{64}$/.test(entry.pathHash)||entry.pathHash<=prior||!['absent','null','boolean','number','string','array','object','OTHER'].includes(entry.type)||!(entry.type==='number'?['zero','nonzero']:['OTHER']).includes(entry.zero)||t.valid&&(entry.type!=='number'||entry.zero!=='zero'))throw Error('Invalid tool usage path');prior=entry.pathHash;}return true;
}
