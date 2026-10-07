import {RECOVERY_PATHS,claimFreshCampaign,readPriorCampaign,requireRecoveryExecution} from './recovery.mjs';
import {recordDiagnostic} from './diagnostics.mjs';
import { pathToFileURL } from 'node:url';
import { BudgetLedger } from './ledger.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { createOpenAITransport, LIVE_BLOCK_REASON, COUNT_BILLING_INTERPRETATION } from './openai-transport.mjs';
import { exampleConfig, apiConfig } from './money.mjs';

import {generate,fakeProvider} from './generation.mjs';
export {generate,fakeProvider} from './generation.mjs';
export async function cli(args, output = console.log) {
  if(args.length===1&&args[0]==='--initialize-fresh-campaign'){const ledger=new BudgetLedger(RECOVERY_PATHS.destination,apiConfig());ledger.initializeRecovery(claimFreshCampaign());output(JSON.stringify({status:'fresh-campaign-initialized',campaignId:'357-screening-2',carriedUnknownMicrodollars:42730,paidRequests:0}));return;}
  if (args.length === 1 && args[0] === '--api-preflight') {
    output(JSON.stringify({ status: 'blocked-live', modelRates: 'verified-2026-10-06', credentialPresent: Boolean(process.env.OPENAI_API_KEY), reason: LIVE_BLOCK_REASON, paidRequests: 0 })); return;
  }
  if(args[0]==='--snapshot-dry-run'){if(args.length!==1)throw Error('Unsupported snapshot option');const {publicSnapshot}=await import('./public-results.mjs');const {execFileSync}=await import('node:child_process');const repo=fs.realpathSync(new URL('../..',import.meta.url));const snapshot=publicSnapshot({sourceHead:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim()});output(JSON.stringify({status:'public-snapshot-dry-run',runCount:snapshot.runs.length,paidRequests:0}));return;}
  if(args[0]==='--export-public')return exportPublic(args.slice(1),output);
  if (args[0] === '--setup-review') return setupReview(args.slice(1), output);
  if (args[0] === '--run-api') return runAPI(args.slice(1), output);
  if (args.includes('--live')) throw Error(LIVE_BLOCK_REASON);
  if (!args.length || (args.length === 1 && args[0] === '--dry-run')) {
    output(JSON.stringify({ status: 'offline-dry-run', paidRequests: 0, live: 'blocked-live', config: exampleConfig() })); return;
  }
  if (args.length !== 3 || !['--initialize-example', '--resume-example'].includes(args[0]) || args[1] !== '--ledger') throw Error('Use --dry-run, --live, or --initialize-example/--resume-example --ledger ABSOLUTE_PATH');
  const ledger = new BudgetLedger(args[2], exampleConfig());
  if (args[0] === '--initialize-example') ledger.initialize();
  else ledger.read();
  const state = ledger.read();
  // Explicit example invocation is one fake setup request, never a coding trial.
  const requestId = `example_${state.requests.length + 1}`;
  await generate(ledger, fakeProvider(), { prompt: 'offline fixture', requestId, phase: 'setup', model: 'offline-fixture-model', effort: 'medium', maxOutputTokens: 32 });
  const final = ledger.read();
  output(JSON.stringify({ status: 'offline-example', paidRequests: 0, fakeRequests: final.requests.length,
    fakeMicrodollars: ledger.sum(final), trialCount: Object.keys(final.trials).length }));
}

async function exportPublic(args,output){const values={};for(let i=0;i<args.length;i++){if(!['--ledger','--workspace','--readiness'].includes(args[i])||!args[i+1])throw Error('Unsupported export option');values[args[i]]=args[++i];}const repo=fs.realpathSync(new URL('../..',import.meta.url));const {safeFile}=await import('./paths.mjs');for(const value of Object.values(values)){if(!path.isAbsolute(value)||!path.resolve(value).startsWith(repo+path.sep))throw Error('Export input outside pilot');safeFile(repo,path.relative(repo,value).split(path.sep).join('/'));}const {publicSnapshot}=await import('./public-results.mjs');const {exportSnapshot}=await import('./export-results.mjs');const {loadFixtures,initialAllocation}=await import('./workflow.mjs');const {execFileSync}=await import('node:child_process');const sourceHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();const state=values['--ledger']?new BudgetLedger(values['--ledger'],apiConfig()).read():null;const images=values['--readiness']?JSON.parse(fs.readFileSync(values['--readiness'])).images:{};const receipts=[];if(values['--workspace'])for(const item of Object.values(initialAllocation(loadFixtures())).flat()){const file=safeFile(values['--workspace'],item.trial+(item.environment==='api'?'.receipt.json':'.native-state.json'));if(fs.existsSync(file))receipts.push(JSON.parse(fs.readFileSync(file)));}const result=await exportSnapshot(publicSnapshot({state,receipts,sourceHead,images,...(state?.version===3?readPriorCampaign():{})}));output(JSON.stringify({status:'public-evidence-exported',runCount:result.runCount}));}
export function guardedTransport(budget) {
  requireRecoveryExecution(budget);
  return createOpenAITransport({ liveEnabled: true, diagnosticGuard:event=>recordDiagnostic(budget,event), countBillingInterpretation: COUNT_BILLING_INTERPRETATION, preflightGuard: {
    begin: meta => budget.beginPreflight(meta), complete: (id, result) => budget.completePreflight(id, result), hold: id => budget.holdPreflight(id)
  }, reservationGuard: request => {
    const pending = budget.read().requests.filter(r => r.status === 'pending');
    if (pending.length !== 1 || pending[0].id !== request.reservation?.id) throw Error('Missing persisted reservation'); return pending[0];
  } });
}
async function setupReview(args, output) {
  const values = {};for(let i=0;i<args.length;i++){if(['--live','--initialize'].includes(args[i]))values[args[i]]=true;else if(['--ledger','--prompt','--review-id'].includes(args[i])&&args[i+1])values[args[i]]=args[++i];else throw Error('Unsupported review option');}
  if(!values['--live']||!['--ledger','--prompt'].every(k=>path.isAbsolute(values[k]??'')))throw Error('Explicit live and absolute review paths required');
  const repo=fs.realpathSync(new URL('../..',import.meta.url));const {safeFile}=await import('./paths.mjs');
  for(const k of ['--ledger','--prompt']){if(!path.resolve(values[k]).startsWith(repo+path.sep))throw Error('Review path outside pilot');safeFile(repo,path.relative(repo,values[k]).split(path.sep).join('/'));}
  if(!['setup_cost_review_1','setup_sandbox_review_1','setup_final_review_1','setup_product_plan_1'].includes(values['--review-id']))throw Error('Explicit review request ID required');
  const prompt=fs.readFileSync(values['--prompt'],'utf8');if(Buffer.byteLength(prompt)>32000)throw Error('Review context bound');
  if(!process.env.OPENAI_API_KEY)throw Error('Missing controller credential');const budget=new BudgetLedger(values['--ledger'],apiConfig());if(values['--initialize'])throw Error('Live recovery cannot initialize through setup');requireRecoveryExecution(budget);
  const text=await generate(budget,guardedTransport(budget),{prompt,requestId:budget.requestId(values['--review-id']),phase:'setup',model:values['--review-id']==='setup_product_plan_1'?'gpt-6-astra':'gpt-6.1-sol',effort:'high',maxOutputTokens:values['--review-id']==='setup_product_plan_1'?4000:8000});
  output(JSON.stringify({status:'setup-review',text,receipt:budget.read().requests.find(r=>r.id===budget.requestId(values['--review-id']))}));
}
async function runAPI(args, output) {
  const flags = new Set(['--live', '--initialize','--first-pair']); const values = {};
  for (let i = 0; i < args.length; i++) {
    if (flags.has(args[i])) { if (values[args[i]]) throw Error('Duplicate option'); values[args[i]] = true; }
    else if (['--ledger', '--workspace', '--readiness','--reviewed-head'].includes(args[i]) && args[i + 1]) { if (values[args[i]]) throw Error('Duplicate option'); values[args[i]] = args[++i]; }
    else throw Error('Unsupported pilot option');
  }
  if (!values['--live'] || !['--ledger','--workspace','--readiness'].every(key => path.isAbsolute(values[key] ?? ''))) throw Error('Explicit --live and absolute --ledger/--workspace/--readiness required');
  const repo = fs.realpathSync(new URL('../..', import.meta.url));
  const { safeFile } = await import('./paths.mjs');
  const workspace = path.resolve(values['--workspace']);
  if (!workspace.startsWith(repo + path.sep) || workspace === repo || !path.resolve(values['--ledger']).startsWith(workspace + path.sep)) throw Error('Pilot workspace/ledger must stay inside dedicated repo subdirectory');
  safeFile(repo, path.relative(repo, workspace).split(path.sep).join('/'));
  safeFile(repo, path.relative(repo, path.resolve(values['--ledger'])).split(path.sep).join('/'));
  const {execFileSync}=await import('node:child_process');const currentHead=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();if(values['--reviewed-head']!==currentHead)throw Error('Exact reviewed controller head required');
  if(!path.resolve(values['--readiness']).startsWith(repo+path.sep))throw Error('Readiness path outside pilot');safeFile(repo,path.relative(repo,values['--readiness']).split(path.sep).join('/'));
  const readiness=JSON.parse(fs.readFileSync(values['--readiness'],'utf8'));if(readiness.schemaVersion!==1||readiness.fullBaselines!==true||readiness.referenceAcceptance!==true||readiness.negativeOracles!==true||readiness.cleanupNegativeProof!==true)throw Error('Fixture readiness unresolved');
  if (!process.env.OPENAI_API_KEY) throw Error('blocked-live: OPENAI_API_KEY is absent; no request sent');
  const budget = new BudgetLedger(values['--ledger'], apiConfig());
  if(values['--initialize'])throw Error('Use the explicit fixed recovery initializer');const stateBefore=requireRecoveryExecution(budget);if(workspace!==path.dirname(RECOVERY_PATHS.destination))throw Error('Fixed successor workspace required');
  const provider = guardedTransport(budget);
  // Exact counting is durably recorded inside each actual phase; no paid generation preflight probe.
  const { loadFixtures, schedule, archiveFixture, runTrial } = await import('./workflow.mjs');
  const manifests = loadFixtures(); const order = schedule(manifests, { environment: 'api' });const {buildSandboxImage}=await import('./sandbox.mjs');for(const m of manifests){const observed=buildSandboxImage({repo,seed:m.seed,runtimeRoot:path.dirname(values['--readiness'])});const supplied=readiness.images[m.name];if(!supplied||observed.image!==supplied.image||observed.volume!==supplied.volume||observed.lockSha256!==supplied.lockSha256||observed.runnerSha256!==supplied.runnerSha256)throw Error('Immutable image readiness mismatch');}
  budget.read();
  const {sharedSkillsDigest}=await import('./context.mjs');const skillsDigest=sharedSkillsDigest(repo);
  const receipts = [];
  for (const item of order) {
    const state = budget.read();if(Object.keys(state.trials).some(id=>id.startsWith('native_')))throw Error('API stage closed after native allocation');
    if (Object.keys(state.trials).some(id => !order.some(item => item.trial === id)) || Object.keys(state.trials).length > 6) throw Error('Ledger exceeds initial six-API allocation');
    if (state.blocked || state.requests.some(r => r.status !== 'complete')) throw Error('Unresolved request; trial dispatch held');
    if (state.trials[item.trial]?.start !== null && state.trials[item.trial]?.start !== undefined) continue;
    if (!state.pairs.some(pair => pair.id === item.pair)) {
      const pair = order.filter(candidate => candidate.pair === item.pair); budget.pair(item.pair, pair[0].trial, pair[1].trial);
    }
    const root = path.join(workspace, item.trial); archiveFixture(repo, root, item.seed);
    const receipt = await runTrial({ ledger: budget, provider, root, manifest: manifests.find(m => m.name === item.fixture), trial: item.trial, arm: item.arm,environment:{controllerHead:currentHead,nodeVersion:process.version,image:readiness.images[item.fixture].image,gateNodeVersion:readiness.images[item.fixture].nodeVersion,lockSha256:readiness.images[item.fixture].lockSha256,skillsDigest,contextVersion:'scoped-search-replace-1',toolsMode:'stateless-no-tools',cacheControl:'uncontrolled'},sandbox:{...readiness.images[item.fixture],allowedRoot:workspace},onAttempt:attempt=>fs.appendFileSync(path.join(workspace,item.trial+'.attempts.jsonl'),JSON.stringify(attempt)+'\n') });
    receipts.push(receipt);
    // Persist each receipt separately; no prompt, generated code or gate output is imported.
    fs.writeFileSync(path.join(workspace, `${item.trial}.receipt.json`), JSON.stringify(receipt, null, 2));
    output(JSON.stringify({ trial: item.trial, accepted: receipt.accepted, failure: receipt.failure }));
    if (budget.read().blocked) break;
    if(values['--first-pair']&&item===order.filter(i=>i.pair===item.pair).at(-1))break;
  }
  output(JSON.stringify({ status: 'pilot-ended', trialsThisInvocation: receipts.length, accepted: receipts.filter(r => r.accepted).length }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await cli(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
