import test from 'node:test';
import assert from 'node:assert/strict';
import { createOpenAITransport, buildResponsePayload, LIVE_BLOCK_REASON, OFFLINE_FIXTURE_KEY } from '../evaluation/openai-transport.mjs';
const endpoint = 'https://api.openai.com/v1/responses';
const base = () => ({ model: 'gpt-6.1-sol', effort: 'medium', prompt: 'private prompt', maxOutputTokens: 32, maxToolCalls: 0, retries: 0,
  reservation: { id: 'request_1' } });
const data = () => ({ model: 'gpt-6.1-sol', status: 'completed', service_tier: 'default', tools: [], previous_response_id: null,
  output: [{ type: 'reasoning', summary: [{ text: 'private reasoning' }] }, { type: 'message', role: 'assistant', status: 'completed',
    content: [{ type: 'output_text', text: 'ephemeral private generated content', annotations: [] }] }],
  usage: { input_tokens: 20, input_tokens_details: { cached_tokens: 3, cache_write_tokens: 4 }, output_tokens: 10,
    output_tokens_details: { reasoning_tokens: 2 }, total_tokens: 30 } });
function fixture(options = {}) {
  const calls = [];
  const provider = createOpenAITransport({ offlineFixture: true, liveEnabled: true, env: { OPENAI_API_KEY: OFFLINE_FIXTURE_KEY },
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
  const provider = createOpenAITransport({ liveEnabled: true, env: { OPENAI_API_KEY: 'FAKE-secret' }, fetchImpl: () => { calls++; } });
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
  assert.throws(() => createOpenAITransport({ offlineFixture: true, fetchImpl: globalThis.fetch, inputTokensForFixture: () => 20 }), /injected/);
  const { provider, calls } = fixture({ env: { OPENAI_API_KEY: 'sk-private-credential' } });
  await assert.rejects(send(provider), /sentinel/); assert.equal(calls.length, 0);
});
