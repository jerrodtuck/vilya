import { pathToFileURL } from 'node:url';
import { BudgetLedger } from './ledger.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { createOpenAITransport, LIVE_BLOCK_REASON, COUNT_BILLING_INTERPRETATION } from './openai-transport.mjs';
import { exampleConfig, apiConfig } from './money.mjs';

export async function generate(ledger, provider, { prompt, requestId, trial = null, phase, model, effort, maxOutputTokens, defect = null }) {
  if (!provider || !['fake', 'offline-api-fixture', 'live'].includes(provider.kind) || typeof provider.send !== 'function') throw Error('Invalid provider');
  if (provider.kind === 'live' && (ledger.config.mode !== 'live' || provider.liveEnabled !== true)) throw Error('blocked-live: explicit live mode required');
  if (provider.kind !== 'live' && ledger.config.mode !== 'offline') throw Error('Offline transport cannot produce paid trial receipts');
  if (typeof prompt !== 'string') throw Error('Invalid prompt');
  const transportRequest = { model, effort, prompt, maxOutputTokens, maxToolCalls: 0, retries: 0 };
  // Real count preflight is remote, durably bounded, and uses the scoped published-pricing zero-separate-fee interpretation.
  const certificate = provider.prepare ? await provider.prepare(transportRequest, { requestId, trial, phase }) : null;
  const inputBound = provider.inputBound ? provider.inputBound(transportRequest, certificate) : Buffer.byteLength(prompt, 'utf8');
  if (provider.kind === 'live' && !provider.inputBound) throw Error('blocked-live: certified input bound required');
  const request = ledger.reserve({ requestId, trial, phase, model, effort, inputBound, outputBound: maxOutputTokens, defect });
  const controller = new AbortController(); let timer;
  const duration = Math.min(ledger.config.bounds.requestMs, ledger.deadline(trial, phase) - ledger.clock());
  try {
    if (duration <= 0) throw Error('deadline');
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('timeout')); }, duration); });
    const result = await Promise.race([Promise.resolve().then(() => provider.send({
      ...transportRequest, reservation: request, signal: controller.signal
    }, certificate)), timeout]);
    if (ledger.clock() >= ledger.deadline(trial, phase) || ledger.clock() >= request.start + duration || !result || typeof result.text !== 'string' ||
        Buffer.byteLength(result.text, 'utf8') > (provider.kind === 'fake' ? maxOutputTokens : 128_000)) throw Error('Invalid or late result');
    ledger.reconcile(requestId, result.usage, result.metadata);
    // Prompt and generated text are never persisted in the budget ledger.
    return result.text;
  } catch {
    controller.abort(); ledger.hold(requestId);
    throw Error('Request unresolved; full reservation retained and future dispatch held');
  } finally { clearTimeout(timer); }
}

export function fakeProvider({ text = 'offline result', lost = false } = {}) {
  return { kind: 'fake', async send({ prompt, maxOutputTokens }) {
    if (lost) throw Error('simulated lost response');
    if (Buffer.byteLength(text, 'utf8') > maxOutputTokens) throw Error('output bound');
    return { text, usage: { input: Buffer.byteLength(prompt, 'utf8'), cachedInput: 0, cacheWrite: 0,
      output: Buffer.byteLength(text, 'utf8'), reasoning: 0, fees: 0 } };
  } };
}

export async function cli(args, output = console.log) {
  if (args.length === 1 && args[0] === '--api-preflight') {
    output(JSON.stringify({ status: 'blocked-live', modelRates: 'verified-2026-10-06', credentialPresent: Boolean(process.env.OPENAI_API_KEY), reason: LIVE_BLOCK_REASON, paidRequests: 0 })); return;
  }
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

export function guardedTransport(budget) {
  return createOpenAITransport({ liveEnabled: true, countBillingInterpretation: COUNT_BILLING_INTERPRETATION, preflightGuard: {
    begin: meta => budget.beginPreflight(meta), complete: (id, result) => budget.completePreflight(id, result), hold: id => budget.holdPreflight(id)
  }, reservationGuard: request => {
    const pending = budget.read().requests.filter(r => r.status === 'pending');
    if (pending.length !== 1 || pending[0].id !== request.reservation?.id) throw Error('Missing persisted reservation'); return pending[0];
  } });
}
async function setupReview(args, output) {
  const values = {};for(let i=0;i<args.length;i++){if(['--live','--initialize'].includes(args[i]))values[args[i]]=true;else if(['--ledger','--prompt','--request-id'].includes(args[i])&&args[i+1])values[args[i]]=args[++i];else throw Error('Unsupported review option');}
  if(!values['--live']||!['--ledger','--prompt'].every(k=>path.isAbsolute(values[k]??'')))throw Error('Explicit live and absolute review paths required');
  const repo=fs.realpathSync(new URL('../..',import.meta.url));const {safeFile}=await import('./workflow.mjs');
  for(const k of ['--ledger','--prompt']){if(!path.resolve(values[k]).startsWith(repo+path.sep))throw Error('Review path outside pilot');safeFile(repo,path.relative(repo,values[k]).split(path.sep).join('/'));}
  if(!/^[A-Za-z0-9_-]{1,70}$/.test(values['--request-id']??''))throw Error('Explicit review request ID required');
  const prompt=fs.readFileSync(values['--prompt'],'utf8');if(Buffer.byteLength(prompt)>32000)throw Error('Review context bound');
  if(!process.env.OPENAI_API_KEY)throw Error('Missing controller credential');const budget=new BudgetLedger(values['--ledger'],apiConfig());if(values['--initialize'])budget.initialize();else budget.read();
  const text=await generate(budget,guardedTransport(budget),{prompt,requestId:values['--request-id'],phase:'setup',model:'gpt-6.1-sol',effort:'high',maxOutputTokens:8000});
  output(JSON.stringify({status:'setup-review',text,receipt:budget.read().requests.find(r=>r.id===values['--request-id'])}));
}
async function runAPI(args, output) {
  throw Error('Trial dispatch stopped: unresolved Docker full-gate defect requires independently reviewed revised plan');
  const flags = new Set(['--live', '--initialize']); const values = {};
  for (let i = 0; i < args.length; i++) {
    if (flags.has(args[i])) { if (values[args[i]]) throw Error('Duplicate option'); values[args[i]] = true; }
    else if (['--ledger', '--workspace', '--dependencies'].includes(args[i]) && args[i + 1]) { if (values[args[i]]) throw Error('Duplicate option'); values[args[i]] = args[++i]; }
    else throw Error('Unsupported pilot option');
  }
  if (!values['--live'] || !['--ledger','--workspace','--dependencies'].every(key => path.isAbsolute(values[key] ?? ''))) throw Error('Explicit --live and absolute --ledger/--workspace/--dependencies required');
  const repo = fs.realpathSync(new URL('../..', import.meta.url));
  const { safeFile } = await import('./workflow.mjs');
  const workspace = path.resolve(values['--workspace']);
  if (!workspace.startsWith(repo + path.sep) || workspace === repo || !path.resolve(values['--ledger']).startsWith(workspace + path.sep)) throw Error('Pilot workspace/ledger must stay inside dedicated repo subdirectory');
  safeFile(repo, path.relative(repo, workspace).split(path.sep).join('/'));
  safeFile(repo, path.relative(repo, path.resolve(values['--ledger'])).split(path.sep).join('/'));
  if (!process.env.OPENAI_API_KEY) throw Error('blocked-live: OPENAI_API_KEY is absent; no request sent');
  const budget = new BudgetLedger(values['--ledger'], apiConfig());
  const provider = guardedTransport(budget);
  // Exact counting is durably recorded inside each actual phase; no paid generation preflight probe.
  const { loadFixtures, schedule, archiveFixture, runTrial } = await import('./workflow.mjs');
  const manifests = loadFixtures(); const order = schedule(manifests, { environment: 'api' });
  if (values['--initialize']) { fs.mkdirSync(workspace, { recursive: true }); budget.initialize(); } else budget.read();
  const receipts = [];
  for (const item of order) {
    const state = budget.read();
    if (Object.keys(state.trials).some(id => !order.some(item => item.trial === id)) || Object.keys(state.trials).length > 6) throw Error('Ledger exceeds initial six-API allocation');
    if (state.blocked || state.requests.some(r => r.status !== 'complete')) throw Error('Unresolved request; trial dispatch held');
    if (state.trials[item.trial]?.start !== null && state.trials[item.trial]?.start !== undefined) continue;
    if (!state.pairs.some(pair => pair.id === item.pair)) {
      const pair = order.filter(candidate => candidate.pair === item.pair); budget.pair(item.pair, pair[0].trial, pair[1].trial);
    }
    const root = path.join(workspace, item.trial); archiveFixture(repo, root, item.seed, values['--dependencies']);
    const receipt = await runTrial({ ledger: budget, provider, root, manifest: manifests.find(m => m.name === item.fixture), trial: item.trial, arm: item.arm });
    receipts.push(receipt);
    // Persist each receipt separately; no prompt, generated code or gate output is imported.
    fs.writeFileSync(path.join(workspace, `${item.trial}.receipt.json`), JSON.stringify(receipt, null, 2));
    output(JSON.stringify({ trial: item.trial, accepted: receipt.accepted, failure: receipt.failure }));
    if (budget.read().blocked) break;
  }
  output(JSON.stringify({ status: 'pilot-ended', trialsThisInvocation: receipts.length, accepted: receipts.filter(r => r.accepted).length }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await cli(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
