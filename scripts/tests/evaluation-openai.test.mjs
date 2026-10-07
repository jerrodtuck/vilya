import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BudgetLedger } from '../evaluation/ledger.mjs';
import { apiConfig } from '../evaluation/money.mjs';
import { generate } from '../evaluation/harness.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createOpenAITransport, parseResponse, buildResponsePayload, LIVE_BLOCK_REASON, OFFLINE_FIXTURE_KEY, COUNT_BILLING_INTERPRETATION } from '../evaluation/openai-transport.mjs';
const endpoint = 'https://api.openai.com/v1/responses';
const base = () => ({ model: 'gpt-6.1-sol', effort: 'medium', prompt: 'private prompt', maxOutputTokens: 32, maxToolCalls: 0, retries: 0,
  reservation: { id: 'request_1' } });
const data = () => ({ model: 'gpt-6.1-sol', status: 'completed', service_tier: 'default', parallel_tool_calls: false, tools: [], previous_response_id: null,
  output: [{ type: 'reasoning', summary: [{ type:'summary_text', text: 'private reasoning' }] }, { type: 'message', role: 'assistant', status: 'completed',
    content: [{ type: 'output_text', text: 'ephemeral private generated content', annotations: [] }] }],
  usage: { input_tokens: 20, input_tokens_details: { cached_tokens: 3, cache_write_tokens: 4 }, output_tokens: 10,
    output_tokens_details: { reasoning_tokens: 2 }, total_tokens: 30 } });
function fixture(options = {}) {
  const calls = [];
  const provider = createOpenAITransport({diagnosticGuard:()=>true, offlineFixture: true, liveEnabled: true, env: { OPENAI_API_KEY: OFFLINE_FIXTURE_KEY },
    inputTokensForFixture: () => 20,
    reservationGuard: request => ({ id: request.reservation.id, status: 'pending', model: request.model, effort: request.effort,
      inputBound: 20, outputBound: request.maxOutputTokens, reservation: 500 }),
    fetchImpl: async (url, init) => { calls.push({ url, init }); return { ok: true, redirected: false, url,
      headers: { get: () => 'req_safe123' }, json: async () => data() }; }, ...options });
  return { provider, calls };
}
const send = (provider, request = base()) => provider.send(request, provider.prepare(request));

test('live stays blocked with credentials and explicit opt-in before reserve/network', async () => {
  let calls = 0;
  const provider = createOpenAITransport({diagnosticGuard:()=>true, liveEnabled: true, env: { OPENAI_API_KEY: 'FAKE-secret' }, fetchImpl: () => { calls++; } });
  assert.throws(() => provider.prepare(base()), { message: LIVE_BLOCK_REASON });
  assert.throws(() => provider.inputBound(base(), { inputTokens: 1 }), { message: LIVE_BLOCK_REASON });
  await assert.rejects(provider.send(base()), { message: LIVE_BLOCK_REASON });
  assert.equal(calls, 0);
});

test('missing credential or explicit live opt-in prevents all requests', async () => {
  for (const options of [{ env: {} }, { liveEnabled: false }]) {
    const { provider, calls } = fixture(options);
    await assert.rejects(send(provider), /explicit invocation/); assert.equal(calls.length, 0);
  }
});

test('certificate rejects caller counts, prompt changes, model changes, and foreign provenance', async () => {
  const { provider, calls } = fixture(); const request = base(); const certificate = provider.prepare(request);
  for (const invalid of [{ ...certificate, inputTokens: 1 }, { inputTokens: 20 }]) {
    await assert.rejects(provider.send(request, invalid), /certificate/);
  }
  await assert.rejects(provider.send({ ...request, prompt: 'changed prompt' }, certificate), /certificate/);
  await assert.rejects(provider.send({ ...request, model: 'gpt-6-astra' }, certificate), /certificate/);
  const other = fixture().provider;
  await assert.rejects(other.send(request, certificate), /certificate/);
  assert.equal(calls.length, 0);
  assert.equal(Object.isFrozen(certificate), true);
});

test('unsupported model/effort/options/endpoints/tools/tier and output caps rejected', () => {
  for (const amendment of [{ model: 'latest' }, { effort: 'low' }, { endpoint: 'https://elsewhere.invalid' }, { service_tier: 'fast' },
    { tools: ['shell'] }, { previous_response_id: 'old' }, { maxToolCalls: 1 }, { retries: 1 }, { maxOutputTokens: 0 },
    { maxOutputTokens: 8001 }, { inputBound: 1 }, { prompt: 'a'.repeat(32001) }]) {
    assert.throws(() => buildResponsePayload({ ...base(), ...amendment }), /Unsupported/);
  }
});

test('exact bounded no-tools Standard payload and ephemeral output/counters only', async () => {
  const { provider, calls } = fixture(); const result = await send(provider);
  assert.equal(calls.length, 1); assert.equal(calls[0].url, endpoint); assert.equal(calls[0].init.redirect, 'error');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.max_output_tokens, 32); assert.equal(body.service_tier, 'default'); assert.equal(body.store, false);
  assert.equal(body.background, false); assert.equal(body.stream, false); assert.equal(body.tool_choice, 'none'); assert.deepEqual(body.tools, []);
  assert.deepEqual(result.usage, { input: 20, cachedInput: 3, cacheWrite: 4, output: 10, reasoning: 2, fees: 0 });
  assert.deepEqual(result.metadata, { providerRequestId: 'req_safe123' });
  assert.equal(JSON.stringify(result.metadata).includes('private'), false);
  assert.equal(JSON.stringify(result).includes('FAKE-secret'), false); assert.equal(JSON.stringify(result).includes('private reasoning'), false);
  assert.match(result.text, /ephemeral/);
});

test('missing, undercounted, mismatched or completed reservation sends zero requests', async () => {
  for (const amendment of [{ inputBound: 1 }, { outputBound: 33 }, { model: 'gpt-6-astra' }, { status: 'complete' }, { id: 'other' }]) {
    const { provider, calls } = fixture({ reservationGuard: () => ({ id: 'request_1', status: 'pending', model: 'gpt-6.1-sol',
      effort: 'medium', inputBound: 20, outputBound: 32, reservation: 500, ...amendment }) });
    await assert.rejects(send(provider), /Reservation/); assert.equal(calls.length, 0);
  }
  const { provider, calls } = fixture({ reservationGuard: undefined });
  await assert.rejects(send(provider), /guard/); assert.equal(calls.length, 0);
});

test('redirects, different response endpoints, and failed response bodies fail without body read', async () => {
  for (const amendment of [{ redirected: true }, { url: 'https://elsewhere.invalid' }, { ok: false }]) {
    let bodyRead = false;
    const { provider } = fixture({ fetchImpl: async () => ({ ok: true, redirected: false, url: endpoint,
      ...amendment, json: () => { bodyRead = true; throw Error('private prompt FAKE-secret'); } }) });
    await assert.rejects(send(provider), error => !/private|FAKE-secret/.test(error.message)); assert.equal(bodyRead, false);
  }
});

test('deadline aborts stalled fetch once without retry', async () => {
  let calls = 0; let signal;
  const { provider } = fixture({ timeoutMs: 5, fetchImpl: async (_url, init) => { calls++; signal = init.signal; return new Promise(() => {}); } });
  await assert.rejects(send(provider), /unresolved/); assert.equal(calls, 1); assert.equal(signal.aborted, true);
});

test('caller cancellation aborts and remains unresolved', async () => {
  const controller = new AbortController(); let signal;
  const { provider } = fixture({ fetchImpl: async (_url, init) => { signal = init.signal; controller.abort(); return new Promise(() => {}); } });
  await assert.rejects(send(provider, { ...base(), signal: controller.signal }), /unresolved/); assert.equal(signal.aborted, true);
});

test('missing counters, unknown fees, count overflow, cache overlap and reasoning overcount fail', async () => {
  for (const mutate of [value => delete value.usage.input_tokens_details.cache_write_tokens,
    value => delete value.usage.output_tokens_details.reasoning_tokens, value => { value.usage.fees = 1; },
    value => { value.usage.input_tokens = 21; value.usage.total_tokens = 31; },
    value => { value.usage.output_tokens = 33; value.usage.total_tokens = 53; },
    value => { value.usage.input_tokens_details.cache_write_tokens = 18; },
    value => { value.usage.output_tokens_details.reasoning_tokens = 11; },
    value => { value.service_tier = 'priority'; }, value => { value.output.push({ type: 'web_search_call' }); }]) {
    const value = data(); mutate(value);
    const { provider } = fixture({ fetchImpl: async () => ({ ok: true, url: endpoint, json: async () => value }) });
    await assert.rejects(send(provider), /unresolved/);
  }
});

test('provider exception and private JSON errors never escape into diagnostics', async () => {
  for (const fetchImpl of [async () => { throw Error('FAKE-secret private prompt'); },
    async () => ({ ok: true, url: endpoint, json: async () => { throw Error('FAKE-secret private prompt'); } })]) {
    const { provider } = fixture({ fetchImpl });
    await assert.rejects(send(provider), error => error.message === 'OpenAI request unresolved; retain full reservation');
  }
});

test('fixture mode rejects native fetch and a real-shaped environment credential', async () => {
  assert.throws(() => createOpenAITransport({diagnosticGuard:()=>true, offlineFixture: true, fetchImpl: globalThis.fetch, inputTokensForFixture: () => 20 }), /injected/);
  const { provider, calls } = fixture({ env: { OPENAI_API_KEY: 'sk-private-credential' } });
  await assert.rejects(send(provider), /sentinel/); assert.equal(calls.length, 0);
});

function countedFixture(options = {}) {
  const calls = []; const events = []; let pending;
  const provider = createOpenAITransport({diagnosticGuard:()=>true, liveEnabled: true, env: { OPENAI_API_KEY: 'FAKE-count-secret' },
    countBillingInterpretation: COUNT_BILLING_INTERPRETATION,
    preflightGuard: {
      begin(meta, scope) { events.push('begin'); pending = { ...meta, ...scope, id: `${scope.requestId}_count`, status: 'pending', deadline: (options.clock ?? Date.now)() + 15_000 }; return pending; },
      complete(id, receipt) { assert.equal(id, pending.id); events.push('complete'); pending = { ...pending, ...receipt, status: 'complete' }; return true; },
      hold(id) { assert.equal(id, pending.id); events.push('hold'); pending.status = 'unknown'; }
    },
    reservationGuard: request => { events.push('generation-guard'); return { id: request.reservation.id, status: 'pending', model: request.model,
      effort: request.effort, inputBound: 20, outputBound: request.maxOutputTokens, reservation: 500 }; },
    fetchImpl: async (url, init) => { calls.push({ url, init }); events.push(url.endsWith('/input_tokens') ? 'count-send' : 'generation-send');
      return { ok: true, url, headers: { get: () => 'req_count1' }, json: async () => url.endsWith('/input_tokens') ?
        { object: 'response.input_tokens', input_tokens: 20 } : data() }; }, ...options });
  return { provider, calls, events, pending: () => pending };
}

test('approved exact count records before send then certifies generation bound', async () => {
  const { provider, calls, events, pending } = countedFixture(); const request = base();
  const certificate = await provider.prepare(request, { requestId: 'request_1', trial: 'trial_1', phase: 'planning' });
  assert.equal(calls.length, 1); assert.deepEqual(events, ['begin', 'count-send', 'complete']);
  assert.equal(pending().status, 'complete'); assert.equal(certificate.provenance, 'openai-exact-input-count');
  assert.equal(provider.inputBound(request, certificate), 20);
  const countPayload = JSON.parse(calls[0].init.body);
  assert.deepEqual(countPayload, { model: request.model, input: request.prompt, reasoning: { effort: request.effort }, text: { format: { type: 'text' } },
    parallel_tool_calls: false, tools: [], tool_choice: 'none', truncation: 'disabled' });
  await provider.send(request, certificate);
  assert.deepEqual(events, ['begin', 'count-send', 'complete', 'generation-guard', 'generation-send']);
  assert.equal(calls.length, 2);
  await assert.rejects(provider.send(request, certificate), /certificate/); assert.equal(calls.length, 2);
});

test('missing approved interpretation/guard or denied durable preflight emits zero calls', async () => {
  for (const options of [{ countBillingInterpretation: 'assume-free' }, { preflightGuard: undefined }]) {
    const { provider, calls } = countedFixture(options);
    assert.throws(() => provider.prepare(base(), { requestId: 'request_1' }), /blocked-live/); assert.equal(calls.length, 0);
  }
  const { provider, calls } = countedFixture({ preflightGuard: { begin() { throw Error('exhausted'); }, complete() {}, hold() {} } });
  await assert.rejects(provider.prepare(base(), { requestId: 'request_1' }), /exhausted/); assert.equal(calls.length, 0);
});

test('unknown count fees/usage/schema/overflow/lost response hold preflight without generation', async () => {
  for (const value of [{ object: 'response.input_tokens', input_tokens: 20, usage: {} },
    { object: 'response.input_tokens', input_tokens: 20, fees: 0 }, { object: 'response.input_tokens', input_tokens: 32001 },
    { object: 'response.input_tokens', input_tokens: -1 }, { object: 'response.input_tokens', input_tokens: null },
    { object: 'response', input_tokens: 20 }, null]) {
    let calls = 0;
    const { provider, events, pending } = countedFixture({ fetchImpl: async url => { calls++; return { ok: true, url, json: async () => value }; } });
    await assert.rejects(provider.prepare(base(), { requestId: 'request_1' }), /preflight unresolved/);
    assert.equal(calls, 1); assert.deepEqual(events, ['begin', 'hold']); assert.equal(pending().status, 'unknown');
  }
  const { provider, pending } = countedFixture({ fetchImpl: async () => { throw Error('private FAKE-count-secret'); } });
  await assert.rejects(provider.prepare(base(), { requestId: 'request_1' }), error => error.message === 'Input preflight unresolved; dispatch held');
  assert.equal(pending().status, 'unknown');
});

test('count deadline aborts once and holds durable preflight', async () => {
  let calls = 0; let signal;
  const { provider, pending } = countedFixture({ timeoutMs: 5, fetchImpl: async (_url, init) => { calls++; signal = init.signal; return new Promise(() => {}); } });
  await assert.rejects(provider.prepare(base(), { requestId: 'request_1' }), /preflight unresolved/);
  assert.equal(calls, 1); assert.equal(signal.aborted, true); assert.equal(pending().status, 'unknown');
});

test('certificate expires or clock regresses before generation and binds every generation option', async () => {
  let now = 1000; const { provider, calls } = countedFixture({ clock: () => now }); const request = base();
  const certificate = await provider.prepare(request, { requestId: 'request_1' });
  for (const changes of [{ effort: 'high' }, { maxOutputTokens: 31 }, { prompt: 'different' }, { model: 'gpt-6-astra' }]) {
    await assert.rejects(provider.send({ ...request, ...changes }, certificate), /certificate/);
  }
  now = 999; await assert.rejects(provider.send(request, certificate), /certificate/);
  now = 61000; await assert.rejects(provider.send(request, certificate), /certificate/);
  assert.equal(calls.length, 1);
});

test('production fake-network preparation integrates with persisted budget before generation', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vilya-count-seam-'));
  try {
    const ledger = new BudgetLedger(path.join(temp, 'ledger.json'), apiConfig()); ledger.initialize(); let calls = 0;
    const provider = createOpenAITransport({diagnosticGuard:()=>true, liveEnabled: true, env: { OPENAI_API_KEY: 'FAKE-integration-key' },
      countBillingInterpretation: COUNT_BILLING_INTERPRETATION,
      preflightGuard: { begin: (meta, scope) => ledger.beginPreflight({ ...meta, ...scope }),
        complete: (id, result) => ledger.completePreflight(id, result), hold: id => ledger.holdPreflight(id) },
      reservationGuard: request => ledger.read().requests.find(r => r.id === request.reservation.id),
      fetchImpl: async url => {
        calls++; const state = ledger.read();
        if (url.endsWith('/input_tokens')) {
          assert.equal(state.preflights.length, 1); assert.equal(state.preflights[0].status, 'pending'); assert.equal(state.requests.length, 0);
          return { ok: true, url, json: async () => ({ object: 'response.input_tokens', input_tokens: 20 }) };
        }
        assert.equal(state.preflights[0].status, 'complete'); assert.equal(state.requests[0].status, 'pending');
        assert.equal(state.requests[0].inputBound, 20); assert.equal(state.requests[0].reservation, 370);
        return { ok: true, url, json: async () => data() };
      } });
    await generate(ledger, provider, { prompt: 'private seam prompt', requestId: 'seam_1', phase: 'setup', model: 'gpt-6.1-sol', effort: 'medium', maxOutputTokens: 32 });
    assert.equal(calls, 2); const state = ledger.read();
    assert.equal(state.requests[0].status, 'complete'); assert.equal(state.preflights[0].status, 'complete');
    assert.equal(state.requests[0].cost, 137); assert.equal(fs.readFileSync(ledger.file, 'utf8').includes('private seam prompt'), false);
    const resumed = new BudgetLedger(ledger.file, apiConfig()); assert.equal(resumed.sum(resumed.read()), 137);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('unexpected top-level charge or usage metadata cannot normalize to zero fees', async () => {
  for (const unknown of ['fees', 'fee', 'cost', 'charges', 'billing', 'billing_details', 'additional_usage', 'unrecognized_field']) {
    const value = { ...data(), [unknown]: { amount: 999, private: 'FAKE-secret private prompt' } };
    assert.throws(() => parseResponse(value, base(), 20), error => error.message === 'OpenAI request unresolved; retain full reservation');
    const { provider } = fixture({ fetchImpl: async () => ({ ok: true, url: endpoint, json: async () => value }) });
    await assert.rejects(send(provider), error => error.message === 'OpenAI request unresolved; retain full reservation');
  }
  const documented = { ...data(), id: 'resp_fixture', object: 'response', created_at: 1000, completed_at: 1001,
    error: null, incomplete_details: null, metadata: {}, reasoning: { effort: 'medium', summary: null },
    max_output_tokens: 32, max_tool_calls: null, store: false, background: false, temperature: 1,
    text: { format: { type: 'text' } }, tool_choice: 'none', parallel_tool_calls: false, top_p: 1, truncation: 'disabled', user: null };
  assert.equal(parseResponse(documented, base(), 20).usage.fees, 0);
});

test('count uses remaining stage deadline and rejects a response arriving at that boundary', async () => {
  for (const late of [false, true]) {
    let now = 1000; let sends = 0; let held = false; let signal;
    const provider = createOpenAITransport({diagnosticGuard:()=>true, liveEnabled: true, env: { OPENAI_API_KEY: 'FAKE-deadline-key' },
      countBillingInterpretation: COUNT_BILLING_INTERPRETATION, clock: () => now,
      preflightGuard: { begin: meta => ({ ...meta, id: 'near_deadline_count', status: 'pending', deadline: 1005 }),
        complete() { throw Error('Late count must not complete'); }, hold() { held = true; } },
      fetchImpl: async (url, init) => { sends++; signal = init.signal;
        if (!late) return new Promise(() => {});
        now = 1005; return { ok: true, url, json: async () => ({ object: 'response.input_tokens', input_tokens: 20 }) };
      } });
    await assert.rejects(provider.prepare(base(), { requestId: 'near_deadline' }), /preflight unresolved/);
    assert.equal(sends, 1); assert.equal(held, true); if (!late) assert.equal(signal.aborted, true);
  }
});

function realLedgerProvider(ledger,fetchImpl,clock=Date.now){return createOpenAITransport({diagnosticGuard:()=>true,liveEnabled:true,env:{OPENAI_API_KEY:'FAKE-ledger-guard-key'},clock,countBillingInterpretation:COUNT_BILLING_INTERPRETATION,preflightGuard:{begin:meta=>ledger.beginPreflight(meta),complete:(id,r)=>ledger.completePreflight(id,r),hold:id=>ledger.holdPreflight(id)},reservationGuard:r=>ledger.read().requests.find(p=>p.id===r.reservation.id),fetchImpl});}
test('real ledger count cap65 and lost count restart deny transport before POST',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-count-edge-'));try{const ledger=new BudgetLedger(path.join(temp,'l.json'),apiConfig(),{clock:()=>1000});ledger.initialize();for(let i=0;i<64;i++){const p=ledger.beginPreflight({requestId:'count_'+i,trial:null,phase:'setup',payloadHash:'a'.repeat(64),model:'gpt-6.1-sol',effort:'medium',serviceTier:'default',pricingDate:'2026-10-06',billingInterpretation:COUNT_BILLING_INTERPRETATION});ledger.completePreflight(p.id,{inputTokens:20,providerRequestId:null});}let posts=0;const provider=realLedgerProvider(ledger,async()=>{posts++;throw Error('forbidden');},()=>1000);await assert.rejects(provider.prepare(base(),{requestId:'count_65',trial:null,phase:'setup'}));assert.equal(posts,0);
 const lost=new BudgetLedger(path.join(temp,'lost.json'),apiConfig(),{clock:()=>1000});lost.initialize();const failing=realLedgerProvider(lost,async()=>{posts++;throw Error('lost');},()=>1000);await assert.rejects(failing.prepare(base(),{requestId:'lost',trial:null,phase:'setup'}));assert.equal(lost.read().preflights[0].status,'unknown');const resumed=new BudgetLedger(lost.file,apiConfig(),{clock:()=>1000});const before=posts;await assert.rejects(realLedgerProvider(resumed,async()=>{posts++;},()=>1000).prepare(base(),{requestId:'retry',trial:null,phase:'setup'}));assert.equal(posts,before);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}});
test('real ledger shared count/generation concurrency and final boundary deny count POST',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'vilya-count-concurrent-'));try{let now=1000;const ledger=new BudgetLedger(path.join(temp,'l.json'),apiConfig(),{clock:()=>now});ledger.initialize();let resolveCount,posts=0;const provider=realLedgerProvider(ledger,async url=>{posts++;return new Promise(resolve=>resolveCount=()=>resolve({ok:true,url,json:async()=>({object:'response.input_tokens',input_tokens:20})}));},()=>now);const first=provider.prepare(base(),{requestId:'first',trial:null,phase:'setup'});await assert.rejects(provider.prepare(base(),{requestId:'second',trial:null,phase:'setup'}));assert.equal(posts,1);resolveCount();await first;ledger.reserve({requestId:'first',trial:null,phase:'setup',model:'gpt-6.1-sol',effort:'medium',inputBound:20,outputBound:32});await assert.rejects(provider.prepare(base(),{requestId:'third',trial:null,phase:'setup'}));assert.equal(posts,1);ledger.hold('first');
 const final=new BudgetLedger(path.join(temp,'final.json'),apiConfig(),{clock:()=>now});final.initialize();final.transaction(state=>{state.overheadStart.final=0;state.trialStart=0;});now=360000;await assert.rejects(realLedgerProvider(final,async()=>{posts++;},()=>now).prepare(base(),{requestId:'latefinal',trial:null,phase:'final'}));assert.equal(posts,1);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}});
