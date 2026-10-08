import {sha256,scopedContext,boundedPacket,applyEdits} from '../evaluation/context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { BudgetLedger } from '../evaluation/ledger.mjs';
import { actualCost, maximumCost, exampleConfig, LIMITS } from '../evaluation/money.mjs';
import { generate, fakeProvider, cli } from '../evaluation/harness.mjs';
function setup(t, change = () => {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vilya-offline-budget-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const config = exampleConfig(); change(config);
  let now = 1000; const file = path.join(dir, 'ledger.json');
  const ledger = new BudgetLedger(file, config, { clock: () => now }); ledger.initialize();
  return { ledger, file, config, setTime: value => { now = value; }, now: () => now };
}
const options = extra => ({ requestId: 'r1', prompt: 'abcd', phase: 'planning', trial: 'a', model: 'offline-fixture-model', effort: 'medium', maxOutputTokens: 32, ...extra });
function begin(ledger) { ledger.pair('p1', 'a', 'b'); ledger.begin('a'); }
const reserve = (ledger, extra = {}) => ledger.reserve({ requestId: 'r1', phase: 'planning', trial: 'a', model: 'offline-fixture-model', effort: 'medium', inputBound: 4, outputBound: 32, ...extra });
const usage = extra => ({ input: 4, cachedInput: 0, cacheWrite: 0, output: 1, reasoning: 0, fees: 0, ...extra });

test('integer ceilings, exact boundary and cached/reasoning accounting', () => {
  const rate = { input: 1, cachedInput: 1, cacheWrite: 1, output: 1, maxFees: 3 };
  assert.equal(maximumCost(rate, 1, 1), 5);
  assert.equal(maximumCost(rate, 1_000_000, 1_000_000), 5);
  assert.equal(maximumCost(rate, 1_000_001, 1_000_001), 7);
  assert.equal(actualCost(rate, usage({ input: 2, cachedInput: 1, cacheWrite: 0, output: 1, reasoning: 1, fees: 0 })), 2);
});
test('capacity denial occurs before transport; boundary $0.40 fits', async t => {
  const { ledger } = setup(t, c => { c.models['offline-fixture-model'].maxFees = LIMITS.planning - 68; }); begin(ledger);
  assert.equal(reserve(ledger).reservation, LIMITS.planning);
  ledger.reconcile('r1', usage());
  let calls = 0;
  await assert.rejects(generate(ledger, { kind: 'fake', send() { calls++; } }, options({ requestId: 'r2' })), /budget/i);
  assert.equal(calls, 0); assert.equal(ledger.read().requests.length, 1);
});
test('setup, review and repair use shared budgets; same defect stops after two failed repairs', t => {
  const { ledger } = setup(t);
  reserve(ledger, { trial: null, phase: 'setup' }); ledger.reconcile('r1', usage()); begin(ledger);
  reserve(ledger, { requestId: 'review', phase: 'review' }); ledger.reconcile('review', usage());
  for (let i = 1; i <= 2; i++) {
    reserve(ledger, { requestId: `repair${i}`, phase: 'repair', defect: 'fault' }); ledger.reconcile(`repair${i}`, usage()); ledger.repairResult('a', 'fault', false);
  }
  assert.throws(() => reserve(ledger, { requestId: 'repair3', phase: 'repair', defect: 'fault' }), /Repair stop/);
  assert.equal(ledger.sum(ledger.read()), 24);
});
test('a meaningful repair pass resolves consecutive count, preserving request history', t => {
  const { ledger } = setup(t); begin(ledger);
  reserve(ledger, { phase: 'repair', defect: 'fault' }); ledger.reconcile('r1', usage()); ledger.repairResult('a', 'fault', true);
  assert.equal(ledger.read().trials.a.repairs.fault.unsuccessful, 0); assert.equal(ledger.read().requests.length, 1);
});
test('lost response retains full reservation, persists restart hold and sanitizes provider error', async t => {
  const { ledger, file, config, now } = setup(t); begin(ledger);
  await assert.rejects(generate(ledger, { kind: 'fake', send() { throw Error('SECRET_TOKEN'); } }, options()), error => !error.message.includes('SECRET_TOKEN') && /retained/.test(error.message));
  const fresh = new BudgetLedger(file, config, { clock: now });
  assert.equal(fresh.sum(fresh.read()), 68); assert.equal(fresh.read().requests[0].status, 'unknown');
  assert.throws(() => reserve(fresh, { requestId: 'r2' }), /held/);
  assert.ok(!fs.readFileSync(file, 'utf8').includes('abcd'));
});
test('one in-flight request, cross-process lock and unfinished restart all deny send', async t => {
  const { ledger, file, config, now } = setup(t); begin(ledger); reserve(ledger);
  const resumed = new BudgetLedger(file, config, { clock: now });
  assert.throws(() => reserve(resumed, { requestId: 'r2' }), /held/);
  fs.writeFileSync(`${file}.lock`, '');
  assert.throws(() => ledger.pair('p2', 'c', 'd'), /EEXIST/); fs.unlinkSync(`${file}.lock`);
});
test('parallel requests admit exactly one transport and retain unresolved usage', async t => {
  const { ledger } = setup(t); begin(ledger); let calls = 0;
  const provider = { kind: 'fake', async send() { calls++; return { text: 'x', usage: usage() }; } };
  const results = await Promise.allSettled([generate(ledger, provider, options()), generate(ledger, provider, options({ requestId: 'r2' }))]);
  assert.equal(calls, 1); assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
});
test('timeout holds reservation; abort signal and output/tool/retry limits reach transport', async t => {
  const { ledger } = setup(t, c => { c.bounds.requestMs = 5; }); begin(ledger); let sent;
  await assert.rejects(generate(ledger, { kind: 'fake', send(request) { sent = request; return new Promise(() => {}); } }, options()), /held/);
  assert.equal(sent.signal.aborted, true); assert.equal(sent.maxOutputTokens, 32); assert.equal(sent.maxToolCalls, 0); assert.equal(sent.retries, 0);
  assert.throws(() => reserve(ledger, { requestId: 'r2' }), /held/);
});
test('context, output, request and process deadlines deny before transport', async t => {
  const { ledger, setTime } = setup(t, c => { c.bounds.maxRequestsPerPhase = 1; }); begin(ledger); let calls = 0;
  const provider = { kind: 'fake', async send() { calls++; return { text: 'x', usage: usage() }; } };
  await assert.rejects(generate(ledger, provider, options({ prompt: 'x'.repeat(32_001) })), /bound/);
  await assert.rejects(generate(ledger, provider, options({ maxOutputTokens: 8001 })), /bound/);
  await generate(ledger, provider, options());
  await assert.rejects(generate(ledger, provider, options({ requestId: 'r2' })), /Request limit/);
  setTime(1000 + LIMITS.trialMs);
  await assert.rejects(generate(ledger, provider, options({ requestId: 'r3', phase: 'implementation' })), /deadline/);
  assert.equal(calls, 1);
});
test('actual output over bound or malformed usage holds even when nominal price is low', async t => {
  for (const result of [{ text: 'x'.repeat(33), usage: usage() }, { text: 'x', usage: usage({ output: 33 }) }, { text: 'x' }]) {
    const { ledger } = setup(t); begin(ledger);
    await assert.rejects(generate(ledger, { kind: 'fake', async send() { return result; } }, options()), /retained/);
    assert.equal(ledger.read().blocked, true);
  }
});
test('unknown prices, changed rates, invalid integers, missing/corrupt ledger fail closed', t => {
  const { ledger, file, config, now } = setup(t);
  const bad = exampleConfig(); bad.models['offline-fixture-model'].input = NaN;
  assert.throws(() => new BudgetLedger(file, bad), /Invalid/);
  assert.throws(() => new BudgetLedger(file, { ...config, mode: 'live' }), /Live requires/);
  const changed = structuredClone(config); changed.models['offline-fixture-model'].input++;
  assert.throws(() => new BudgetLedger(file, changed, { clock: now }).read(), /mismatch/);
  assert.throws(() => new BudgetLedger(`${file}.missing`, config, { clock: now }).read(), /ENOENT/);
  const envelope = JSON.parse(fs.readFileSync(file)); envelope.state.lastTime++;
  fs.writeFileSync(file, JSON.stringify(envelope)); assert.throws(() => ledger.read(), /checksum/);
});
test('matched pairs are durable full-trial commitments; no thirteenth/replacement trial', t => {
  const { ledger } = setup(t);
  for (let i = 0; i < 6; i++) ledger.pair(`p${i}`, `a${i}`, `b${i}`);
  assert.throws(() => ledger.pair('p6', 'a6', 'b6'), /cannot fit/);
  assert.throws(() => ledger.pair('p0', 'x', 'y'), /already/);
  assert.equal(Object.keys(ledger.read().trials).length, 12);
});
test('aggregate clock, sequential trials, setup deadline and clock rollback fail closed', t => {
  const { ledger, setTime } = setup(t); begin(ledger);
  assert.throws(() => ledger.begin('b'), /cannot begin/); ledger.close('a');
  setTime(1000 + LIMITS.dispatchMs); assert.throws(() => ledger.begin('b'), /Aggregate/);
  setTime(0); assert.throws(() => ledger.pair('p2', 'c', 'd'), /regressed/);
  setTime(1000 + LIMITS.dispatchMs);
  reserve(ledger, { trial: null, phase: 'setup' }); ledger.reconcile('r1', usage());
  setTime(1000 + LIMITS.dispatchMs + LIMITS.overheadMs);
  assert.throws(() => reserve(ledger, { requestId: 'r2', trial: null, phase: 'setup' }), /deadline/);
});
test('offline default and explicit live refusal do not read credentials or create ledger', async t => {
  const output = []; await cli([], value => output.push(JSON.parse(value)));
  assert.equal(output[0].paidRequests, 0); assert.equal(output[0].status, 'offline-dry-run');
  await assert.rejects(cli(['--live']), /blocked-live/);
  const { file } = setup(t);
  const exe = fileURLToPath(new URL('../evaluation/harness.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [exe, '--resume-example', '--ledger', file], { encoding: 'utf8', env: { ...process.env, OPENAI_API_KEY: 'DO_NOT_PRINT' } });
  assert.equal(result.status, 0); assert.ok(!result.stdout.includes('DO_NOT_PRINT')); assert.ok(!result.stderr.includes('DO_NOT_PRINT'));
  assert.equal(JSON.parse(result.stdout).trialCount, 0);
});



import { apiConfig } from '../evaluation/money.mjs';
import { applyPatch, safeFile, gateArgs, gate, schedule, runTrial } from '../evaluation/workflow.mjs';
test('API rates are exact and dated; caller-supplied discounts or extra fees fail closed', t => {
  const { file } = setup(t); const config = apiConfig();
  assert.doesNotThrow(() => new BudgetLedger(file, config));
  config.models['gpt-6-astra'].input = 1;
  assert.throws(() => new BudgetLedger(file, config), /rates mismatch/);
  const good = apiConfig(); const rate = good.models['gpt-6-astra'];
  assert.equal(maximumCost(rate, 10_000, 2400), 245_000);
  assert.equal(actualCost(rate, usage({ input: 10_000, cachedInput: 2000, cacheWrite: 3000, output: 2400, reasoning: 1200 })), 209_500);
  assert.throws(() => actualCost(rate, usage({ input: 4, cachedInput: 3, cacheWrite: 2 })), /usage/);
});
test('final overhead has its own time window and still shares setup dollar cap', t => {
  const { ledger, setTime } = setup(t); reserve(ledger, { trial: null, phase: 'setup' }); ledger.reconcile('r1', usage()); begin(ledger); ledger.close('a');
  setTime(1000 + LIMITS.dispatchMs);
  reserve(ledger, { trial: null, phase: 'final', requestId: 'final' }); ledger.reconcile('final', usage());
  setTime(1000 + LIMITS.dispatchMs + LIMITS.finalMs);
  assert.throws(() => reserve(ledger, { trial: null, phase: 'final', requestId: 'late' }), /deadline/);
});
test('patch traversal, absolute paths, ownership, duplicate files and symlinks are rejected before writes', t => {
  const { file } = setup(t); const root = path.dirname(file); fs.mkdirSync(path.join(root, 'src')); fs.writeFileSync(path.join(root, 'src/a.ts'), 'before');
  const manifest = { fileOwnership: ['src/a.ts'] };
  for (const target of ['../outside', '/absolute', 'C:/absolute', 'src\\a.ts', 'src/no.ts']) {
    assert.throws(() => applyPatch(root, manifest, JSON.stringify({ files: [{ path: target, content: 'evil' }] })));
  }
  fs.symlinkSync(root, path.join(root, 'src/link'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => safeFile(root, 'src/link/ledger.json'), /Symlink/);
  assert.throws(() => applyPatch(root, manifest, JSON.stringify({ files: [{ path: 'src/a.ts', content: 'one' }, { path: 'src/a.ts', content: 'two' }] })));
  assert.equal(fs.readFileSync(path.join(root, 'src/a.ts'), 'utf8'), 'before');
  assert.equal(applyPatch(root, manifest, JSON.stringify({ files: [{ path: 'src/a.ts', content: 'after' }] })), true);
});
test('model never supplies gate shell commands; gate deadline kills bounded child', async t => {
  for (const command of ['node evil.mjs', 'node scripts/sync-skills.mjs; echo secret', 'node node_modules/vitest/vitest.mjs run ../outside', 'powershell evil']) assert.throws(() => gateArgs(command), /gate/i);
  const { file } = setup(t); await assert.rejects(gate(path.dirname(file), ['-e', 'setInterval(()=>{},1000)'], Date.now() + 40), /Docker sandbox required/);
});
test('initial allocation is six API plus six counterbalanced native; second API repetitions never dispatch silently', () => {
  const manifests = [{ name: 'behavior', seed: 'a'.repeat(40), order: ['AB','BA'] }, { name: 'instruction', seed: 'b'.repeat(40), order: ['BA','AB'] }, { name: 'migration', seed: 'c'.repeat(40), order: ['AB','BA'] }];
  const api = schedule(manifests); const native = schedule(manifests, { environment: 'native' });
  assert.equal(api.length, 6); assert.equal(native.length, 6); assert.equal(api.length + native.length, 12);
  assert.equal(api.map(t => t.arm).join(''), 'ABBAAB'); assert.equal(native.map(t => t.arm).join(''), 'BAABBA');
  assert.equal(api.every(t => t.environment === 'api' && t.repetition === 1), true);
  assert.equal(native.every(t => t.environment === 'native' && t.repetition === 2), true);
  assert.equal(new Set([...api, ...native].map(t => t.trial)).size, 12);
  assert.throws(() => schedule(manifests, { environment: 'unapproved-api-replication' }), /Unknown/);
});
test('fake end-to-end pipeline uses stateless planning, implementation, independent actual-file review and recorded gates', async t => {
  const { ledger, config, file } = setup(t); ledger.pair('p', 'a', 'b');
  // Exact-ID fake rates only for an offline transport contract test.
  config.models = { 'gpt-6.1-sol': exampleConfig().models['offline-fixture-model'], 'gpt-6-astra': exampleConfig().models['offline-fixture-model'] };
  const freshFile = path.join(path.dirname(file), 'pipeline.json'); const budget = new BudgetLedger(freshFile, config, { clock: () => 1000 }); budget.initialize(); budget.pair('p', 'a', 'b');
  const root = path.dirname(file); fs.writeFileSync(path.join(root, 'a.ts'), 'before');
  const manifest = { name: 'fake-contract', seed: 'a'.repeat(40), taskPrompt: 'replace before with after', fileOwnership: ['a.ts'], rubric: ['after'] };
  const calls = []; const provider = { kind: 'fake', async send(request) {
    calls.push(request); const text = calls.length === 1 ? 'settled plan' : calls.length === 2 ? JSON.stringify({ files: [{ path: 'a.ts', sha256:sha256('before'), edits:[{old:'before',new:'after'}] }] }) : JSON.stringify({ ready: true, findings: [] });
    return { text, usage: usage({ input: Buffer.byteLength(request.prompt), output: Buffer.byteLength(text) }) };
  } };
  const result = await runTrial({ ledger: budget, provider, root, manifest, trial: 'a', arm: 'B', acceptanceFn: async () => [{ passed: fs.readFileSync(path.join(root, 'a.ts'), 'utf8') === 'after', command: 'fake-independent-gate', code: 0 }] });
  assert.equal(result.accepted, true); assert.equal(calls.length, 3);
  assert.equal(calls[0].model, 'gpt-6-astra'); assert.equal(calls[0].effort, 'high');
  assert.equal(calls[1].model, 'gpt-6.1-sol'); assert.equal(calls[1].effort, 'medium'); assert.equal(calls[2].effort, 'high');
  assert.ok(calls[2].prompt.includes('before')); assert.ok(calls[2].prompt.includes('after')); assert.ok(!calls[2].prompt.includes('settled plan'));
  assert.equal(result.requests.length, 3); assert.equal(result.gates[0].output, undefined); assert.equal(budget.read().trials.a.closed, true);
});

import { createOpenAITransport, OFFLINE_FIXTURE_KEY } from '../evaluation/openai-transport.mjs';
test('Responses fixture integration proves durable reservation exists before transport and imports only metadata', async t => {
  const { file } = setup(t); const config = apiConfig(); config.mode = 'offline';
  const ledger = new BudgetLedger(path.join(path.dirname(file), 'response.json'), config, { clock: () => 1000 }); ledger.initialize(); begin(ledger); let calls = 0;
  const provider = createOpenAITransport({ offlineFixture: true, liveEnabled: true, env: { OPENAI_API_KEY: OFFLINE_FIXTURE_KEY }, inputTokensForFixture: () => 20,
    reservationGuard: request => ledger.read().requests.find(r => r.id === request.reservation.id),
    fetchImpl: async url => {
      calls++; assert.equal(ledger.read().requests[0].status, 'pending');
      return { ok: true, redirected: false, url, headers: { get: () => 'req_receipt' }, json: async () => ({
        model: 'gpt-6.1-sol', status: 'completed', service_tier: 'default', parallel_tool_calls: false, tools: [], previous_response_id: null,
        output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'private result', annotations: [] }] }],
        usage: { input_tokens: 20, input_tokens_details: { cached_tokens: 3, cache_write_tokens: 4 }, output_tokens: 10, output_tokens_details: { reasoning_tokens: 2 }, total_tokens: 30 }
      }) };
    } });
  assert.equal(await generate(ledger, provider, options({ model: 'gpt-6.1-sol' })), 'private result');
  assert.equal(calls, 1); const record = ledger.read().requests[0];
  assert.equal(record.status, 'complete'); assert.equal(record.providerRequestId, 'req_receipt'); assert.equal(record.usage.reasoning, 2);
  assert.ok(!fs.readFileSync(ledger.file, 'utf8').includes('private result')); assert.ok(!fs.readFileSync(ledger.file, 'utf8').includes(OFFLINE_FIXTURE_KEY));
});

import { archiveFixture, loadFixtures } from '../evaluation/workflow.mjs';
test('immutable archive forbids host dependencies and contains no private environment files', t => {
  const { file } = setup(t); const root=path.join(path.dirname(file),'historical');const repo=fileURLToPath(new URL('../../',import.meta.url));const manifest=loadFixtures()[0];
  assert.throws(()=>archiveFixture(repo,root,manifest.seed,'host-dependencies'),/Host dependencies forbidden/);archiveFixture(repo,root,manifest.seed);
  assert.equal(fs.existsSync(path.join(root,'.git')),false);assert.equal(fs.existsSync(path.join(root,'apps/skill-registry/.env.example')),false);
});

import {sandboxArgs} from '../evaluation/sandbox.mjs';
test('sandbox exposes only isolated fixture, readonly deps and explicit harmless environment', t=>{
 const {file}=setup(t);const allowedRoot=path.dirname(file),root=path.join(allowedRoot,'fixture');fs.mkdirSync(root);
 const args=sandboxArgs({allowedRoot,root,image:'sha256:'+ 'a'.repeat(64),volume:'vilya357-deps-'+ 'b'.repeat(64),commands:[['-e','console.log(1)']],deadline:Date.now()+1000,name:'vilya357-test'});
 for(const flag of ['--network=none','--read-only','--user=1000:1000','--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=256','--memory=4g'])assert.ok(args.includes(flag));
 assert.equal(args.filter(a=>a.startsWith('type=bind')).length,1);assert.ok(args.find(a=>a.startsWith('type=bind')).endsWith('target=/seed,readonly'));assert.equal(args.some(a=>a.includes('OPENAI_API_KEY')||a.includes('docker.sock')||a.includes('.env.local')),false);
 fs.writeFileSync(path.join(root,'.env.local'),'ignored');assert.throws(()=>sandboxArgs({allowedRoot,root}),/private configuration/);
});

test('actual setup-review CLI reaches missing credential without cyclic top-level await or requests',t=>{
 const repo=fileURLToPath(new URL('../../',import.meta.url));const runtime=path.join(repo,'scripts/evaluation/runtime');fs.mkdirSync(runtime,{recursive:true});const dir=fs.mkdtempSync(path.join(runtime,'cli-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const prompt=path.join(dir,'public.txt'),ledger=path.join(dir,'ledger.json');fs.writeFileSync(prompt,'Public bounded independent review packet.');
 const result=spawnSync(process.execPath,['scripts/evaluation/harness.mjs','--setup-review','--live','--initialize','--ledger',ledger,'--prompt',prompt,'--review-id','setup_cost_review_1'],{cwd:repo,encoding:'utf8',timeout:3000,env:{...process.env,OPENAI_API_KEY:''}});
 assert.equal(result.status,1);assert.match(result.stderr,/Missing controller credential/);assert.doesNotMatch(result.stderr,/unsettled top-level await/);assert.equal(fs.existsSync(ledger),false);
});

test('actual public snapshot CLI resolves full workflow import graph without network or files',()=>{const repo=fileURLToPath(new URL('../../',import.meta.url));const result=spawnSync(process.execPath,['scripts/evaluation/harness.mjs','--snapshot-dry-run'],{cwd:repo,encoding:'utf8',timeout:3000,env:{...process.env,OPENAI_API_KEY:''}});assert.equal(result.status,0);assert.deepEqual(JSON.parse(result.stdout),{status:'public-snapshot-dry-run',runCount:12,paidRequests:0});assert.doesNotMatch(result.stderr,/unsettled top-level await/);});

test('cleanup failure blocks later paid phases and restart before provider transport',async t=>{const {file,config}=setup(t);config.models={'gpt-6.1-sol':config.models['offline-fixture-model'],'gpt-6-astra':config.models['offline-fixture-model']};delete config.models['offline-fixture-model'];const ledger=new BudgetLedger(path.join(path.dirname(file),'cleanup-ledger.json'),config,{clock:()=>1000});ledger.initialize();ledger.pair('p','a','b');const root=path.dirname(file);fs.writeFileSync(path.join(root,'a.ts'),'before');const manifest={name:'fake-contract',seed:'a'.repeat(40),taskPrompt:'fix',fileOwnership:['a.ts'],rubric:['after']};let sends=0;const provider={kind:'fake',async send(request){sends++;const text=sends===1?'plan':JSON.stringify({files:[{path:'a.ts',sha256:sha256('before'),edits:[{old:'before',new:'after'}]}]});return{text,usage:usage({input:Buffer.byteLength(request.prompt),output:Buffer.byteLength(text)})};}};const result=await runTrial({ledger,provider,root,manifest,trial:'a',arm:'A',acceptanceFn:async()=>{fs.writeFileSync(path.join(root,'.sandbox-cleanup-hold.json'),'pending');throw Error('Sandbox cleanup unresolved');}});assert.equal(result.failure,'sandbox-cleanup-unresolved');assert.equal(ledger.read().blocked,true);assert.equal(sends,2);const resumed=new BudgetLedger(ledger.file,config,{clock:()=>1000});await assert.rejects(generate(resumed,provider,{prompt:'never sent',requestId:'next',trial:'b',phase:'planning',model:'gpt-6.1-sol',effort:'medium',maxOutputTokens:100}));assert.equal(sends,2);});
