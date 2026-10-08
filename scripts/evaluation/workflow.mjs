import {requireContinuationProtocol,CONTINUATION_PATHS} from './continuation.mjs';
import {REQUIRED_GATE_IDS} from '../../apps/skill-registry/src/features/evaluation/workflow-contract.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { generate } from './generation.mjs';
import { runSandbox } from './sandbox.mjs';
import {scopedContext,boundedPacket,applyEdits,compactDiff,CONTEXT_VERSION,sha256,EditContractError} from './context.mjs';
import { LIMITS } from './money.mjs';
import {protocolDescriptor,prepareProtocolPlan,WorkflowProtocolError} from './workflow-protocol.mjs';
const fixtureDir = new URL('./fixtures/', import.meta.url);
import {cleanRelative,safeFile} from './paths.mjs';
export {safeFile} from './paths.mjs';
export function ownership(manifest) { return manifest.fileOwnership.map(file => cleanRelative(file.replace(/ \((generated|new)\)$/, ''))); }
export function applyPatch(root, manifest, text) {
  const patch = JSON.parse(text); const allowed = new Set(ownership(manifest));
  if (!patch || Object.keys(patch).join() !== 'files' || !Array.isArray(patch.files) || !patch.files.length || patch.files.length > allowed.size) throw Error('Invalid patch');
  const seen = new Set();
  const files = patch.files.map(file => {
    if (!file || Object.keys(file).sort().join() !== 'content,path' || !allowed.has(file.path) || seen.has(file.path) || typeof file.content !== 'string' || Buffer.byteLength(file.content) > 128_000) throw Error('Patch outside ownership');
    seen.add(file.path); return { path: safeFile(root, file.path), content: file.content };
  });
  const changed = files.some(file => !fs.existsSync(file.path) || fs.readFileSync(file.path, 'utf8') !== file.content);
  for (const file of files) { fs.mkdirSync(path.dirname(file.path), { recursive: true }); fs.writeFileSync(file.path, file.content); }
  return changed;
}
export function context(root, manifest) {
  return ownership(manifest).map(relative => {
    const file = safeFile(root, relative);const content=fs.existsSync(file)?fs.readFileSync(file,'utf8'):null;return {path:relative,sha256:content===null?null:sha256(content),content};
  });
}
export function gateArgs(command) {
  if (typeof command !== 'string' || !/^node [a-zA-Z0-9_./-]+(?: [a-zA-Z0-9_./-]+)*$/.test(command)) throw Error('Unapproved gate syntax');
  const args = command.split(' ').slice(1);
  if (!['node_modules/vitest/vitest.mjs', 'scripts/sync-skills.mjs'].includes(args[0]) || args.some(a => a.split('/').includes('..'))) throw Error('Unapproved gate');
  return args;
}
export async function gate(root, args, deadline, { sandbox } = {}) {
  if (!sandbox) throw Error('Docker sandbox required; host fixture execution forbidden');
  const results = await runSandbox({ ...sandbox, root: path.resolve(root, '../..'), commands: [args], deadline,
    name: `vilya357-gate-${process.pid}-${Date.now()}` }); return results[0];
}
export function schedule(manifests, { environment = 'api' } = {}) {
  if (!['api', 'native'].includes(environment)) throw Error('Unknown screening environment');
  const repetition = environment === 'api' ? 0 : 1;
  return manifests.flatMap(manifest => [...manifest.order[repetition]].map(arm => ({
    environment, fixture: manifest.name, seed: manifest.seed, arm, repetition: repetition + 1,
    trial: `${environment}_${manifest.name}_${repetition + 1}_${arm}`, pair: `${environment}_${manifest.name}_${repetition + 1}`
  })));
}
export function initialAllocation(manifests) {
  return { api: schedule(manifests, { environment: 'api' }), native: schedule(manifests, { environment: 'native' }) };
}
export function loadFixtures() {
  return ['behavior', 'instruction', 'migration'].map(name => {
    const manifest = JSON.parse(fs.readFileSync(new URL(`${name}.json`, fixtureDir), 'utf8'));
    if (manifest.name !== name || manifest.status !== 'tested' || !/^[a-f0-9]{40}$/.test(manifest.seed) || !Array.isArray(manifest.rubric) || manifest.order.length !== 2 || manifest.order.some(v => !['AB', 'BA'].includes(v))) throw Error('Invalid fixture');
    ownership(manifest); for (const command of [...manifest.gates.setup, ...manifest.gates.focused, ...manifest.gates.workerRegression, manifest.gates.independent.command]) gateArgs(command);
    return manifest;
  });
}
export function archiveFixture(repo, destination, seed, dependencies) {
  if (dependencies !== undefined) throw Error('Host dependencies forbidden; use pinned container image');
  if (!/^[a-f0-9]{40}$/.test(seed) || fs.existsSync(destination)) throw Error('Fresh immutable fixture required');
  fs.mkdirSync(destination, { recursive: true }); const tar = `${destination}.tar`;
  execFileSync('git', ['archive', '--format=tar', `--output=${tar}`, seed], { cwd: repo, windowsHide: true });
  execFileSync('tar', ['-xf', tar, '-C', destination], { cwd: repo, windowsHide: true });
  fs.unlinkSync(tar);
  const removeExamples = directory => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.name.startsWith('.env')) fs.rmSync(file, { recursive: true }); else if (entry.isDirectory()) removeExamples(file); } };
  removeExamples(destination);

}
export function fullGateCommands(root) {
  const app = path.join(root, 'apps/skill-registry'); const commands = [];
  for (const script of ['sync-github-projects-template.mjs','sync-night-shift-template.mjs','sync-skills.mjs']) if (fs.existsSync(path.join(app,'scripts',script))) commands.push([`scripts/${script}`]);
  commands.push(['node_modules/vitest/vitest.mjs','run'], ['node_modules/next/dist/bin/next','build'], ['scripts/scan-code-spacing.mjs']); return commands;
}
export async function acceptance(root, manifest, deadline, { sandbox } = {}) {
  if (!sandbox) throw Error('Docker sandbox required; host fixture execution forbidden');
  const oracle = safeFile(root, `apps/skill-registry/${manifest.gates.independent.copyTo}`);
  fs.copyFileSync(new URL(manifest.gates.independent.source, fixtureDir), oracle);
  const commands = [...manifest.gates.setup,...manifest.gates.focused,...manifest.gates.workerRegression,manifest.gates.independent.command].map(gateArgs);
  commands.push(...fullGateCommands(root));
  const ids=[...manifest.gates.setup.map(()=> 'setup-sync-skills'),...manifest.gates.focused.map(()=> 'focused'),...manifest.gates.workerRegression.map(()=> 'regression'),'oracle',...fullGateCommands(root).map(args=>({'scripts/sync-github-projects-template.mjs':'sync-projects','scripts/sync-night-shift-template.mjs':'sync-night-shift','scripts/sync-skills.mjs':'sync-skills','node_modules/vitest/vitest.mjs':'tests','node_modules/next/dist/bin/next':'build','scripts/scan-code-spacing.mjs':'spacing'})[args[0]])];
  const results=await runSandbox({ ...sandbox, root, commands, deadline, name: `vilya357-accept-${process.pid}-${Date.now()}` });
  return ids.map((id,index)=>({id,...(results[index]??{passed:false,timedOut:false,code:null,notRun:true})}));
}
export function exactReviewDiff(manifest,before,after){const diff=compactDiff(before,after);if(manifest.name==='instruction'){if(before[0].content!==before[1].content||after[0].content!==after[1].content)throw Error('Generated contract equality changed');return diff.map(item=>item.path===before[1].path?{path:item.path,beforeHash:item.beforeHash,afterHash:item.afterHash,aliasExactDiffOf:before[0].path}:item);}return diff;}
const reviewPrompt = (manifest, baseline, current, gates,fullBaseline,fullCurrent) => boundedPacket({
  role: 'Separate independent reviewer. Apply the supplied rubric and existing architecture/quality requirements to actual before/after files and controller-run gates. Do not accept implementer claims. Return only JSON {ready:boolean,findings:[string]}. No tools/API/database/credential actions.',
  task: manifest.taskPrompt, rubric: manifest.rubric, source:{...current,files:current.files.map(file=>baseline.files.find(old=>old.path===file.path)?.sha256===null?{path:file.path,sha256:file.sha256,contentInExactDiff:true}:file)}, diff:exactReviewDiff(manifest,fullBaseline,fullCurrent), gates:gates.map((g,index)=>({id:g.id??'gate_'+(index+1),passed:g.passed,timedOut:g.timedOut,code:g.code,elapsedMs:g.started!=null&&g.ended!=null?g.ended-g.started:null}))
});
export function phasePacket({phase,manifest,baseline,current=baseline,plan='',gates=[],review=null,fullBaseline=null,fullCurrent=null}) {
 if(Buffer.byteLength(plan)>5000)throw Error('Plan response context bound');
 const source=phase==='planning'||phase==='implementation'?baseline:current;
 if(phase==='review'){if(!fullBaseline||!fullCurrent){if(baseline.files.some((f,i)=>f.sha256!==current.files[i]?.sha256))throw Error('Full before/current diff required');fullBaseline=baseline.files;fullCurrent=current.files;}return reviewPrompt(manifest,baseline,current,gates,fullBaseline,fullCurrent);}
 return boundedPacket({role:phase==='planning'?'Resolve contracts, edge cases and verification. Return a concise plan of at most 5000 UTF-8 bytes. No code or tools.':phase==='implementation'?'Implement settled plan using hash-bound unique exact edits {files:[{path,sha256,edits:[{old,new}]}]}. New focused tests use sha256:null,content <=8000 bytes. No tools.':'Repair unresolved acceptance only using same hash-bound unique edits. No third unsuccessful repair.',task:manifest.taskPrompt,rubric:manifest.rubric,source,ownership:ownership(manifest),...(phase==='implementation'?{plan}:{}),...(phase==='repair'?{gates:gates.map(({output,...m})=>m),review}:{})});
}
export async function runTrial({ ledger, provider, root, manifest, trial, arm, phaseOutput = null, acceptanceFn = acceptance, sandbox,onAttempt=()=>{},environment=null,workflowProtocolVersion=1 }) {
  if(![1,2].includes(workflowProtocolVersion))throw Error('Unsupported workflow protocol');
  if(workflowProtocolVersion===2&&ledger.config.mode!=='offline'){if(typeof ledger.file!=='string'||typeof ledger.read!=='function')throw Error('Protocol v2 is offline only without fixed continuation');requireContinuationProtocol(ledger,2,trial,path.dirname(ledger.file));}
  const workflowProtocol=workflowProtocolVersion===2?protocolDescriptor(manifest,arm):null;if(ledger.read().version===4&&(workflowProtocolVersion!==2||workflowProtocol.digest!==ledger.read().continuation.protocolDigest))throw Error('Continuation protocol denied');const workflowSteps=[];
  if(ledger.read().version===4){const state=ledger.read(),item=schedule(loadFixtures()).find(i=>i.trial===trial),expected=loadFixtures().find(m=>m.name===item?.fixture),image=JSON.parse(fs.readFileSync(CONTINUATION_PATHS.readiness)).images[item?.fixture];if(!item||arm!==item.arm||JSON.stringify(manifest)!==JSON.stringify(expected)||path.resolve(root)!==path.resolve(CONTINUATION_PATHS.workspace,trial)||environment?.controllerHead!==state.continuation.reviewedHead||sandbox?.allowedRoot!==CONTINUATION_PATHS.workspace||!image||['image','nodeVersion','lockSha256'].some(k=>sandbox[k]!==image[k])){ledger.transaction(s=>{s.blocked=true;});throw Error('Continuation API provenance changed');}}
  if(sandbox&&fs.existsSync(path.join(sandbox.allowedRoot,'.sandbox-cleanup-hold.json'))){ledger.transaction(state=>{state.blocked=true;});throw Error('Sandbox cleanup unresolved; trial held');}
  ledger.begin(trial); const started = ledger.clock(); const baseline = scopedContext(root, manifest);const fullBaseline=context(root,manifest); let accepted = false, failure = null, gates = [], review = null;
  const attempts=[]; let ordinal = 0;let terminalFailure=null,pendingAttempt=null;const invalidStage=phase=>Object.assign(Error('invalid-'+phase+'-output'),{terminalPhase:phase});const editFailure=(error,phase)=>{if(error instanceof EditContractError&&error.kind==='semantic')return invalidStage(phase);return Error(error instanceof EditContractError?(error.kind==='source'?'source-changed':'context-too-large'):'filesystem-unavailable');};
  let previousEnded=started;
  const call = async (phase, prompt, extras = {}) => {
    const {workflowStep=phase,...options}=extras;
    const requestId=ledger.requestId(`${trial}_${phase}_${++ordinal}`);
    const request={prompt,requestId,trial,phase,model:phase==='planning'&&arm==='B'?'gpt-6-astra':'gpt-6.1-sol',effort:phase==='review'||phase==='planning'&&arm==='B'?'high':'medium',maxOutputTokens:phaseOutput??(phase==='planning'||phase==='review'?4000:8000),...options};
    const callStarted=ledger.clock();let output=null;
    try {output=await generate(ledger,provider,request);return output;}
    finally {if(workflowProtocol){const ended=ledger.clock(),observed=ledger.read().requests.find(r=>r.id===requestId);workflowSteps.push({stepId:workflowStep,requestId:observed?.id??null,phase,model:request.model,effort:request.effort,status:observed?.status??'not-dispatched',inputBytes:Buffer.byteLength(prompt),inputDigest:sha256(prompt),outputBytes:output===null?null:Buffer.byteLength(output),outputDigest:output===null?null:sha256(output),started:callStarted,ended,elapsedMs:ended-callStarted,handoffElapsedMs:callStarted-previousEnded});previousEnded=ended;}}
  };
  try {
    const plan = workflowProtocol?await prepareProtocolPlan({manifest,baseline,arm,call}):await call('planning', phasePacket({phase:'planning',manifest,baseline}));
    if(workflowProtocol&&JSON.stringify(context(root,manifest).map(({path,sha256})=>({path,sha256})))!==JSON.stringify(fullBaseline.map(({path,sha256})=>({path,sha256}))))throw Error('source-changed');
    const patch = await call('implementation', phasePacket({phase:'implementation',manifest,baseline,plan}));
    try{applyEdits(root,manifest,patch);}catch(error){if(workflowProtocol)throw editFailure(error,'implementation');throw error;}
    for (let attempt = 0; attempt <= 2; attempt++) {
      const attemptStarted=ledger.clock();review=null;pendingAttempt={ordinal:attempt,kind:attempt===0?'initial':'repair',started:attemptStarted};
      gates = await acceptanceFn(root, manifest, Math.min(started + LIMITS.trialMs, ledger.read().trialStart + LIMITS.dispatchMs), { sandbox });
      if (gates.length && gates.every(result => result.passed)) {
        const text=await call('review',phasePacket({phase:'review',manifest,baseline,current:scopedContext(root,manifest),gates,fullBaseline,fullCurrent:context(root,manifest)}));let candidate;try{candidate=JSON.parse(text);}catch(error){if(workflowProtocol)throw invalidStage('review');throw error;}
        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) || typeof candidate.ready !== 'boolean' || !Array.isArray(candidate.findings) || candidate.findings.some(f => typeof f !== 'string')) throw workflowProtocol?invalidStage('review'):Error('Invalid independent review');
        const observed=ledger.read().requests.filter(r=>r.trial===trial&&r.phase==='review').at(-1);
        review={...candidate,model:observed.model,effort:observed.effort,independent:true,requestId:observed.id};
        accepted = review.ready && review.findings.length === 0;
      }
      const attemptEnded=ledger.clock();attempts.push({ordinal:attempt,kind:attempt===0?'initial':'repair',started:attemptStarted,ended:attemptEnded,elapsedMs:attemptEnded-attemptStarted,outcome:accepted?'accepted':'failed',gates:gates.map(({output,...m})=>m),review:review&&{ready:review.ready,findingCount:review.findings.length,model:review.model,effort:review.effort,independent:review.independent,requestId:review.requestId}});
      pendingAttempt=null;onAttempt(attempts.at(-1));
      if (attempt > 0) ledger.repairResult(trial, 'acceptance', accepted);
      if (accepted || attempt === 2) break;
      const correction = await call('repair', phasePacket({phase:'repair',manifest,baseline,current:scopedContext(root,manifest),gates,review}), {defect:'acceptance'});
      try{if(!applyEdits(root,manifest,correction))throw Error('No corrective change');}catch(error){if(workflowProtocol)throw editFailure(error,'repair');throw error;}
    }
  } catch (error) { const last=workflowSteps.at(-1);if(workflowProtocol&&error.terminalPhase&&last?.phase===error.terminalPhase&&last.status==='complete'&&last.outputDigest){terminalFailure={code:error.message,phase:last.phase,phaseId:last.requestId,receiptId:'receipt_'+sha256(JSON.stringify(last.requestId)).slice(0,32)};if(last.phase==='review'&&pendingAttempt){const ended=ledger.clock();attempts.push({...pendingAttempt,ended,elapsedMs:ended-pendingAttempt.started,outcome:'failed',gates:gates.map(({output,...g})=>g),review:{invalidOutput:true,model:last.model,effort:last.effort,independent:true,requestId:last.requestId}});if(pendingAttempt.ordinal>0)ledger.repairResult(trial,'acceptance',false);}}if(terminalFailure)failure=terminalFailure.code;else if(/cleanup unresolved/i.test(error.message)){ledger.transaction(state=>{state.blocked=true;});failure='sandbox-cleanup-unresolved';}else if(/context exceeds|bounded matrix/i.test(error.message))failure='context-too-large';else if(/deadline|timeout/i.test(error.message))failure='deadline-exceeded';else if(['source-changed','filesystem-unavailable','context-too-large'].includes(error.message))failure=error.message;else failure = error instanceof WorkflowProtocolError?error.message:['Budget exhausted', 'Trial budget exhausted', 'Phase budget exhausted', 'Token bound exceeded', 'Request limit', 'No corrective change'].includes(error.message) ? error.message : 'Trial stopped: invalid output, unresolved request or required acceptance failure'; }
  finally {if(ledger.read().version===4&&failure!==null&&!terminalFailure)ledger.transaction(s=>{s.blocked=true;});ledger.close(trial);}
  const state = ledger.read();
  return { fixture: manifest.name, seed: manifest.seed, trial, arm, started, ended: ledger.clock(), accepted,
    failure, environment, attempts, historyComplete:failure===null||!!workflowProtocol&&!!terminalFailure&&workflowSteps.length>0&&workflowSteps.every(s=>s.status==='complete'&&s.ended!==null)&&workflowSteps.filter(s=>['implementation','repair'].includes(s.phase)).length===attempts.length+(terminalFailure&&terminalFailure.phase!=='review'?1:0)&&workflowSteps.filter(s=>s.phase==='review').length===attempts.filter(a=>a.review).length&&attempts.every(a=>a.gates.length===REQUIRED_GATE_IDS[manifest.name].length&&REQUIRED_GATE_IDS[manifest.name].every(id=>a.gates.some(g=>g.id===id))), contextVersion:CONTEXT_VERSION, gates: gates.map(({ output, ...metadata }) => metadata), review: review && { ready: review.ready, findingCount: review.findings.length },
    repairs: state.trials[trial].repairs, requests: state.requests.filter(r => r.trial === trial),...(workflowProtocol?{workflowProtocol,workflowSteps,...(terminalFailure?{terminalFailure}: {})}:{}) };
}
