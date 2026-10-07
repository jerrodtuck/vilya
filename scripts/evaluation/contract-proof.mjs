import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BudgetLedger } from './ledger.mjs';
import { apiConfig, actualCost } from './money.mjs';
import { loadFixtures, archiveFixture, runTrial, acceptance, context } from './workflow.mjs';
import { sha256, sharedSkillsDigest } from './context.mjs';
import { publicSnapshot } from './public-results.mjs';
import { assertAcceptedEvidence, REQUIRED_GATE_IDS } from '../../apps/skill-registry/src/features/evaluation/acceptance.mjs';
const repoDefault = fileURLToPath(new URL('../..',import.meta.url));
export const SCRIPTED_USAGE = Object.freeze({input:128,cachedInput:16,cacheWrite:8,output:40,reasoning:10,fees:0});
const metadataFile = 'apps/skill-registry/src/shared/skills/meta.ts';
const testFile = 'apps/skill-registry/src/shared/skills/meta.test.ts';
const oldLabels = '  if (slug.endsWith("nextjs")) return "Next.js / React";';
const newLabels = oldLabels+'\n  if (slug.endsWith("fastapi")) return "FastAPI / Python";\n  if (slug.endsWith("django")) return "Django / Python";\n  if (slug.endsWith("-ml")) return "Python ML / Data";';
const tests = '\ndescribe("contract proof stack labels", () => {\n  it("preserves requested labels and fallback", () => {\n    expect(stackOf("crucible-blazor")).toBe("Blazor / .NET");\n    expect(stackOf("crucible-nextjs")).toBe("Next.js / React");\n    expect(stackOf("crucible-fastapi")).toBe("FastAPI / Python");\n    expect(stackOf("crucible-django")).toBe("Django / Python");\n    expect(stackOf("crucible-ml")).toBe("Python ML / Data");\n    expect(stackOf("unknown")).toBe("any stack");\n  });\n});\n';
const edgeTest = '\nit("keeps an html suffix out of the ML category", () => {\n  expect(stackOf("crucible-html")).toBe("any stack");\n});\n';
function edit(root,relative,old,replacement) {
  const content = fs.readFileSync(path.join(root,relative),'utf8');
  return {path:relative,sha256:sha256(content),edits:[{old,new:replacement}]};
}
function implementation(root,needsRepair) {
  const testContent = fs.readFileSync(path.join(root,testFile),'utf8');
  return JSON.stringify({files:[edit(root,metadataFile,oldLabels,newLabels),{path:testFile,sha256:sha256(testContent),edits:[{old:testContent,new:testContent.replace('import { levelOf } from "./meta";','import { levelOf, stackOf } from "./meta";')+tests+(needsRepair?'':edgeTest)}]}]});
}
function repair(root,index) {
  const before = fs.readFileSync(path.join(root,testFile),'utf8');
  return JSON.stringify({files:[{path:testFile,sha256:sha256(before),edits:[{old:before,new:before+(index===1?edgeTest:'\nit("preserves the process skill stack fallback", () => { expect(stackOf("history")).toBe("any stack"); });\n')}]}]});
}
function verifyReview(packet,root,manifest) {
  assert.deepEqual(packet.rubric,manifest.rubric);
  assert.equal(packet.task,manifest.taskPrompt);
  assert.deepEqual(packet.gates.map(g=>g.id),REQUIRED_GATE_IDS.behavior);
  assert.equal(packet.gates.every(g=>g.passed&&g.code===0&&!g.timedOut),true);
  assert.equal(packet.diff.length,2);
  for (const file of context(root,manifest)) {
    const diff = packet.diff.find(item=>item.path===file.path);
    assert.equal(diff.afterHash,file.sha256);
    assert.equal(diff.hunks.some(hunk=>hunk.added.length>0),true);
    assert.equal(packet.source.files.find(item=>item.path===file.path).sha256,file.sha256);
  }
  const metadata = fs.readFileSync(path.join(root,metadataFile),'utf8');
  assert.equal(metadata.includes(newLabels),true);
  assert.equal(metadata.includes('if (slug.startsWith("crucible")) return "review";'),true);
  assert.equal(metadata.includes('if (skill.slug === "night-shift") return "scheduler-fired";'),true);
}
/** Scripted control-plane fixture. No model, transport, API credential or network lookup. */
export function scriptedProvider({root,manifest,arm,scenario='accept'}) {
  const calls=[];let reviews=0,repairs=0;
  return {kind:'fake',calls,inputBound:()=>SCRIPTED_USAGE.input,
    async send(request) {
      const phase=request.reservation.phase;
      assert.equal(request.model,phase==='planning'&&arm==='B'?'gpt-6-astra':'gpt-6.1-sol');
      assert.equal(request.effort,phase==='review'||phase==='planning'&&arm==='B'?'high':'medium');
      assert.equal(request.maxToolCalls,0);assert.equal(request.retries,0);
      const packet=JSON.parse(request.prompt);let text;
      if(phase==='planning') text='Synthetic settled plan: preserve metadata, add exact Python labels and focused fallback tests.';
      else if(phase==='implementation') text=scenario==='invalid-edit'?'{}':implementation(root,scenario==='review-repair'||scenario==='repair-stop');
      else if(phase==='repair') text=repair(root,++repairs);
      else if(phase==='review') {
        verifyReview(packet,root,manifest);reviews++;
        if(scenario==='invalid-review') text='{}';
        else {
          const focused=fs.readFileSync(path.join(root,testFile),'utf8');
          const requiresEdge=scenario==='review-repair'||scenario==='repair-stop';
          const ready=scenario!=='repair-stop'&&(!requiresEdge||focused.includes(edgeTest));
          assert.equal(requiresEdge&&reviews===1?ready===false:true,true);
          text=JSON.stringify({ready,findings:ready?[]:['Add an explicit focused html-suffix fallback regression.']});
        }
      } else throw Error('Unexpected scripted phase');
      calls.push({phase,model:request.model,effort:request.effort,maxOutputTokens:request.maxOutputTokens,usage:{...SCRIPTED_USAGE}});
      return {text,usage:{...SCRIPTED_USAGE}};
    }
  };
}
export function offlineProofLedger(file,{clock=Date.now,configure=()=>{}}={}) {
  const config=apiConfig();config.mode='offline';configure(config);
  const ledger=new BudgetLedger(file,config,{clock});ledger.initialize();return ledger;
}
/** Component cases inject gates explicitly. The main proof always uses actual Docker acceptance. */
export async function contractCase({repo=repoDefault,workspace,arm='A',scenario='accept',sandbox,acceptanceFn=acceptance,clock=Date.now,configure}) {
  const manifest=loadFixtures().find(item=>item.name==='behavior');
  const root=path.join(workspace,'fixture');archiveFixture(repo,root,manifest.seed);
  const ledger=offlineProofLedger(path.join(workspace,'contract-ledger.json'),{clock,configure});
  ledger.pair('api_behavior_1','api_behavior_1_A','api_behavior_1_B');
  const trial='api_behavior_1_'+arm;
  const provider=scriptedProvider({root,manifest,arm,scenario});
  const controllerHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
  const environment={controllerHead,gateNodeVersion:sandbox?.nodeVersion??null,image:sandbox?.image??null,lockSha256:sandbox?.lockSha256??null,skillsDigest:sharedSkillsDigest(repo)};
  const receipt=await runTrial({ledger,provider,root,manifest,trial,arm,sandbox,acceptanceFn,environment});
  fs.writeFileSync(path.join(workspace,'contract-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  assert.equal(ledger.read().trials[trial].closed,true);
  assert.equal(provider.calls.length,receipt.requests.length);
  assert.equal(receipt.requests.every(r=>r.status==='complete'),true);
  const expected=provider.calls.reduce((sum,call)=>sum+actualCost(ledger.config.models[call.model],SCRIPTED_USAGE),0);
  assert.equal(ledger.sum(ledger.read()),expected);
  return {root,ledger,receipt,calls:provider.calls,syntheticMicrodollars:expected,gateEvidence:acceptanceFn===acceptance?'actual-network-none-docker':'injected-component'};
}
export function publicContractEvidence(cases,sourceHead) {
  const state={version:2,requests:cases.flatMap(item=>item.receipt.requests)};
  const snapshot=publicSnapshot({state,receipts:cases.map(item=>item.receipt),sourceHead});
  for(const item of cases){const run=snapshot.runs.find(r=>r.runId===item.receipt.trial);assertAcceptedEvidence(run);}
  return snapshot;
}
function readinessForBehavior(file,repo) {
  const readiness=JSON.parse(fs.readFileSync(file,'utf8'));const image=readiness.images?.behavior;
  assert.equal(readiness.schemaVersion,1);assert.equal(readiness.fullBaselines,true);assert.equal(readiness.referenceAcceptance,true);
  assert.equal(image.seed,loadFixtures().find(m=>m.name==='behavior').seed);
  assert.equal(image.baseImage,'node@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392');
  assert.equal(image.image,'sha256:d27234200476cde5d5edd79ee422fdbfbf1676063ef7b91963c653958b960106');
  assert.equal(image.volume,'vilya357-deps-532c6e9c8c985a987119347763906a06dc7e4fea94d50eaab1f739071485dc12');
  assert.equal(image.lockSha256,'acddfb5ed525de043ebb72cbba74846c1cb9efd400e787a7730aab1c14acf07f');
  assert.equal(image.runnerSha256,sha256(fs.readFileSync(path.join(repo,'scripts/evaluation/sandbox-runner.mjs'))));
  const docker=(args)=>execFileSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:10000});
  assert.equal(JSON.parse(docker(['image','inspect',image.image]))[0].Id,image.image);
  assert.equal(JSON.parse(docker(['volume','inspect',image.volume]))[0].Name,image.volume);
  return image;
}
/** Entire controller chain with pinned Docker gates. Synthetic proof, never a model trial. */
export async function runContractProof({repo=repoDefault,readiness=path.join(repo,'scripts/evaluation/runtime/readiness.json')}={}) {
  const image=readinessForBehavior(readiness,repo);const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-contract-proof-'));
  const started=Date.now();const cases=[];
  for(const [arm,scenario] of [['A','accept'],['B','review-repair']]) {
    const trialWorkspace=path.join(workspace,arm);fs.mkdirSync(trialWorkspace);
    cases.push(await contractCase({repo,workspace:trialWorkspace,arm,scenario,sandbox:{...image,allowedRoot:workspace}}));
  }
  const sourceHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
  const snapshot=publicContractEvidence(cases,sourceHead);
  assert.equal(cases[0].receipt.attempts.length,1);assert.equal(cases[1].receipt.attempts.length,2);
  assert.deepEqual(cases[0].calls.map(c=>c.phase),['planning','implementation','review']);
  assert.deepEqual(cases[1].calls.map(c=>c.phase),['planning','implementation','review','repair','review']);
  for(const item of cases)for(const attempt of item.receipt.attempts){assert.deepEqual(attempt.gates.map(g=>g.id),REQUIRED_GATE_IDS.behavior);assert.equal(attempt.gates.every(g=>g.passed&&g.code===0&&g.cleanupConfirmed===true),true);}
  assert.equal(fs.existsSync(path.join(workspace,'.sandbox-cleanup-hold.json')),false);
  const containers=execFileSync('docker',['ps','-a','--format','{{.Names}}'],{encoding:'utf8',windowsHide:true,timeout:10000}).trim().split('\n');
  assert.equal(containers.some(name=>name.startsWith('vilya357-accept-'+process.pid+'-')),false);
  const report={schemaVersion:1,kind:'synthetic-controller-contract-proof',paidCalls:0,gateEvidence:'actual-network-none-docker',controllerHead:sourceHead,fixtureSeed:image.seed,imageDigest:image.image,startedAt:new Date(started).toISOString(),elapsedMs:Date.now()-started,scriptedUsage:SCRIPTED_USAGE,cases:cases.map(item=>({arm:item.receipt.arm,acceptedContract:true,attempts:item.receipt.attempts.length,routing:item.calls.map(({phase,model,effort})=>({phase,model,effort})),syntheticMicrodollars:item.syntheticMicrodollars,totalInputTokens:item.calls.length*SCRIPTED_USAGE.input,totalOutputTokens:item.calls.length*SCRIPTED_USAGE.output,elapsedMs:item.receipt.ended-item.receipt.started})),reconciledSyntheticMicrodollars:snapshot.budget.reconciledCostMicrodollars,heldSyntheticMicrodollars:snapshot.budget.heldReservationMicrodollars,cleanupConfirmed:true,limitations:['scripted-responses-not-model-quality','synthetic-token-counters-not-measured-generation','fake-cost-at-fixed-rates-not-provider-billing','historical-fixture-not-held-out','no-native-model-execution','no-live-export']};
  fs.writeFileSync(path.join(workspace,'contract-proof.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  return {report,workspace};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  if(process.argv.length!==2)throw Error('Contract proof accepts no runtime overrides');
  const {report,workspace}=await runContractProof();process.stdout.write(JSON.stringify({report,proofArtifacts:workspace})+'\n');
}
