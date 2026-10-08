// Synthetic controller proof only. Never invokes a transport or native model.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {loadFixtures,schedule,archiveFixture,runTrial,acceptance,context} from './workflow.mjs';
import {offlineProofLedger,scriptedProvider,SCRIPTED_USAGE} from './contract-proof.mjs';
import {BudgetLedger} from './ledger.mjs';
import {apiConfig} from './money.mjs';
import {sha256,sharedSkillsDigest} from './context.mjs';
import {protocolDescriptor} from './workflow-protocol.mjs';
import {beginNative,advanceNative} from './native-bridge.mjs';
import {importNativeUsage} from './native-usage.mjs';
import {publicSnapshot} from './public-results.mjs';
const repoDefault=fileURLToPath(new URL('../..',import.meta.url));
const write=(file,value)=>{const next=file+'.tmp';fs.writeFileSync(next,JSON.stringify(value,null,2));fs.renameSync(next,file);};
function shortPatch(root,manifest){const files=context(root,manifest).slice(0,manifest.name==='instruction'?2:1);return JSON.stringify({files:files.map(f=>{const old=f.content.split('\n').find(line=>line.trim()&&f.content.split(line).length===2);if(!old)throw Error('Unique synthetic edit anchor missing');const replacement=old+'\n'+(f.path.endsWith('.md')?'<!-- synthetic contract change -->':'// synthetic contract change');if(Buffer.byteLength(old)+Buffer.byteLength(replacement)>16000)throw Error('Synthetic edit exceeds immutable bound');return {path:f.path,sha256:f.sha256,edits:[{old,new:replacement}]};})});}
function providerFor(root,manifest,arm,previous=null){
 if(manifest.name==='behavior')return scriptedProvider({root,manifest,arm,scenario:arm==='B'?'review-repair':'accept',workflowProtocolVersion:2,initialReviews:previous?.nativePhases.filter(p=>p.phase==='review').length??0,initialRepairs:previous?.nativePhases.filter(p=>p.phase==='repair').length??0});
 return {kind:'offline-api-fixture',inputBound:()=>SCRIPTED_USAGE.input,async send(request){const packet=JSON.parse(request.prompt);let text;if(request.reservation.phase==='planning'){if(packet.answerDigest)text=JSON.stringify({status:'settled',plan:'Synthetic complete contract plan.',answerDigest:packet.answerDigest});else if(packet.question&&!packet.source)text=JSON.stringify({questionId:packet.questionId,resolution:'resolved',answer:'Preserve the declared contract and existing acceptance requirements.'});else text='Synthetic complete contract plan.';}else if(request.reservation.phase==='review')text=JSON.stringify({ready:false,findings:['Synthetic edits do not implement this fixture contract.']});else text=shortPatch(root,manifest);return {text,usage:{...SCRIPTED_USAGE}};}};
}
function nativeReceipt(packet,head){const uuid=crypto.randomUUID(),start=Date.parse(packet.startedAt),end=Math.max(Date.now(),start+3),at=n=>new Date(n).toISOString(),counts={input_tokens:128,cached_input_tokens:16,cache_write_input_tokens:0,output_tokens:40,reasoning_output_tokens:10,total_tokens:168},zero=Object.fromEntries(Object.keys(counts).map(k=>[k,0])),taskPath='/root/offline_contract';const manifest={schemaVersion:1,agentId:'synthetic',taskPath,sessionUUID:uuid,parentSessionUUID:null,model:packet.model,effort:packet.effort,head,fixture:packet.workflowProtocol.fixture,phase:packet.phase,startedAt:at(start),endedAt:at(end),freshSession:true,historyMode:'none',phaseCount:1,completionObserved:{completed:true,source:'native-agent-final',observedAt:at(end)},baseline:{timestamp:at(start),counts:zero},terminal:{timestamp:at(end-1),counts}};const stream=[{type:'session_meta',timestamp:at(start),payload:{id:uuid,parent_thread_id:null,agent_path:taskPath}},{type:'turn_context',timestamp:at(start+1),payload:{model:packet.model,effort:packet.effort}},{type:'event_msg',timestamp:at(end-1),payload:{type:'token_count',info:{total_token_usage:counts,last_token_usage:counts}}}].map(JSON.stringify).join('\n')+'\n';return importNativeUsage({manifest,stream});}
/** Resume completed trials; a torn API call/receipt stops rather than redispatches. */
export async function runOfflineCampaign({repo=repoDefault,workspace,readiness,acceptanceFn=acceptance}={}){
 if(!workspace||!path.isAbsolute(workspace)||!path.isAbsolute(readiness??''))throw Error('Absolute disposable workspace and readiness required');
 const fixtureRoot=fs.realpathSync(path.join(repo,'scripts/evaluation/runtime'));const resolved=path.resolve(workspace);if(resolved.startsWith(fixtureRoot+path.sep))throw Error('Campaign evidence directory denied');
 const tempRoot=fs.realpathSync(os.tmpdir());if(!resolved.startsWith(tempRoot+path.sep))throw Error('Only disposable temporary campaign roots allowed');let ancestor=resolved;while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);if(fs.realpathSync(ancestor)!==ancestor)throw Error('Linked campaign root denied');fs.mkdirSync(workspace,{recursive:true});const ledgerFile=path.join(workspace,'offline-budget.json'),config=apiConfig();config.mode='offline';const ledger=fs.existsSync(ledgerFile)?new BudgetLedger(ledgerFile,config):offlineProofLedger(ledgerFile);ledger.ready(ledger.read());
 const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),fixtures=loadFixtures(),images=JSON.parse(fs.readFileSync(readiness)).images;const descriptor={kind:'synthetic-offline-complete-campaign',head,protocol:fixtures.map(m=>protocolDescriptor(m,'B')),gateEvidence:acceptanceFn===acceptance?'actual-network-none-docker':'injected-component'};const manifestFile=path.join(workspace,'offline-proof-manifest.json');if(fs.existsSync(manifestFile)){if(JSON.stringify(JSON.parse(fs.readFileSync(manifestFile)))!==JSON.stringify(descriptor))throw Error('Immutable offline campaign binding changed');}else write(manifestFile,descriptor);
 const receipts=[];for(const item of schedule(fixtures)){
  const receiptFile=path.join(workspace,item.trial+'.receipt.json'),state=ledger.read();if(fs.existsSync(receiptFile)){const receipt=JSON.parse(fs.readFileSync(receiptFile));if(receipt.historyComplete!==true||!state.trials[item.trial]?.closed||JSON.stringify(receipt.requests)!==JSON.stringify(state.requests.filter(r=>r.trial===item.trial)))throw Error('Receipt/ledger mismatch');receipts.push(receipt);continue;}
  if(state.trials[item.trial]?.start!==null&&state.trials[item.trial]?.start!==undefined)throw Error('Incomplete API trial requires inspection; redispatch denied');
  if(!state.pairs.some(p=>p.id===item.pair)){const pair=schedule(fixtures).filter(i=>i.pair===item.pair);ledger.pair(item.pair,pair[0].trial,pair[1].trial);}
  const manifest=fixtures.find(m=>m.name===item.fixture),root=path.join(workspace,item.trial);archiveFixture(repo,root,item.seed);const sandbox={...images[item.fixture],allowedRoot:workspace},environment={controllerHead:head,gateNodeVersion:sandbox.nodeVersion,image:sandbox.image,lockSha256:sandbox.lockSha256,skillsDigest:sharedSkillsDigest(repo)};const receipt=await runTrial({ledger,provider:providerFor(root,manifest,item.arm),root,manifest,trial:item.trial,arm:item.arm,sandbox,environment,acceptanceFn,workflowProtocolVersion:2});write(receiptFile,receipt);receipts.push(receipt);if(receipt.historyComplete!==true||ledger.read().blocked||receipt.requests.some(r=>r.status!=='complete'))throw Error('Unknown API evidence holds campaign');
 }
 for(const item of schedule(fixtures,{environment:'native'})){
  const stateFile=path.join(workspace,item.trial+'.native-state.json'),manifest=fixtures.find(m=>m.name===item.fixture);let state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile)):null;
  if(!state)beginNative({ledger,workspace,repo,trial:item.trial,workflowProtocolVersion:2,controllerHead:head,sandbox:{...images[item.fixture],allowedRoot:workspace}});
  state=JSON.parse(fs.readFileSync(stateFile));const provider=providerFor(state.root,manifest,item.arm,state);while(!state.terminal){
   // Persist a packet before output. The bridge binds it to current source bytes.
   const packetFile=path.join(workspace,item.trial+'.next.json');let packet;if(fs.existsSync(packetFile)){packet=JSON.parse(fs.readFileSync(packetFile));if(packet.phaseId!==state.pendingWorkflowStep.phaseId)packet=null;}
   if(!packet){const {nativePacket}=await import('./native-bridge.mjs');packet=nativePacket(state,manifest);write(stateFile,state);write(packetFile,packet);}
   const response=await provider.send({reservation:{phase:packet.phase},model:packet.model,effort:packet.effort,maxToolCalls:0,retries:0,prompt:packet.payload});const usageReceipt=await nativeReceipt(packet,head),sessionUUIDs=[...receipts.filter(r=>r.nativeSessionIds).flatMap(r=>r.nativeSessionIds),...state.nativeSessionIds,usageReceipt.identity.sessionUUID];
   await new Promise(resolve=>setTimeout(resolve,4));
   await advanceNative({ledger,workspace,trial:item.trial,text:response.text,usageReceipt,independenceEvidence:{freshNoHistory:true,accountingDisjoint:true,sessionUUIDs}});state=JSON.parse(fs.readFileSync(stateFile));
  }
  receipts.push(state);if(!state.historyComplete||ledger.read().blocked)throw Error('Incomplete native evidence holds campaign');
 }
 const snapshot=publicSnapshot({state:ledger.read(),receipts,sourceHead:head,images,syntheticProof:true});const report={...descriptor,paidCalls:0,terminalTrials:receipts.length,accepted:receipts.filter(r=>r.accepted).map(r=>r.trial),failed:receipts.filter(r=>!r.accepted).map(r=>r.trial),requestCount:ledger.read().requests.length,limitations:['synthetic-responses-and-native-usage','not-model-quality','no-native-confirmation','no-live-export']};write(path.join(workspace,'synthetic-snapshot.json'),snapshot);write(path.join(workspace,'offline-report.json'),report);return {workspace,report,snapshot};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const args=process.argv.slice(2);if(args.length!==5||args[0]!=='--offline'||args[1]!=='--workspace'||args[3]!=='--readiness')throw Error('Only offline scripted campaign CLI is supported');const {report,workspace}=await runOfflineCampaign({workspace:args[2],readiness:args[4]});console.log(JSON.stringify({report,workspace}));}
