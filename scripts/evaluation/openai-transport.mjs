import { createHash } from 'node:crypto';
const ENDPOINT = 'https://api.openai.com/v1/responses';
const MODELS = new Set(['gpt-6.1-sol', 'gpt-6-astra']);
const REQUEST_KEYS = new Set(['model', 'effort', 'prompt', 'maxOutputTokens', 'maxToolCalls', 'retries', 'signal', 'reservation']);
export const OFFLINE_FIXTURE_KEY = 'offline-fixture-only-not-a-real-api-key';
export const LIVE_BLOCK_REASON = 'blocked-live: exact input-token bound and token-count preflight billing are not certified';
const fail = () => { throw Error('OpenAI request unresolved; retain full reservation'); };
const uint = value => Number.isSafeInteger(value) && value >= 0;
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const fingerprint = payload => createHash('sha256').update(JSON.stringify(payload)).digest('hex');

export function buildResponsePayload(request) {
  if (!record(request) || Object.keys(request).some(key => !REQUEST_KEYS.has(key)) ||
      !MODELS.has(request.model) || !['medium', 'high'].includes(request.effort) ||
      typeof request.prompt !== 'string' || !request.prompt.length || Buffer.byteLength(request.prompt, 'utf8') > 32_000 ||
      !uint(request.maxOutputTokens) || request.maxOutputTokens < 1 || request.maxOutputTokens > 8_000 ||
      request.maxToolCalls !== 0 || request.retries !== 0) throw Error('Unsupported OpenAI request');
  return { model: request.model, input: request.prompt, reasoning: { effort: request.effort },
    max_output_tokens: request.maxOutputTokens, tools: [], tool_choice: 'none', parallel_tool_calls: false,
    service_tier: 'default', store: false, stream: false, background: false, truncation: 'disabled' };
}

export function parseResponse(data, request, inputBound, providerRequestId = null) {
  const usage = data?.usage;
  if (!record(data) || data.status !== 'completed' || data.model !== request.model ||
      data.service_tier !== 'default' || data.error != null || data.incomplete_details != null ||
      !Array.isArray(data.tools) || data.tools.length || data.previous_response_id != null ||
      !record(usage) || Object.keys(usage).some(key => !['input_tokens', 'output_tokens', 'total_tokens', 'input_tokens_details', 'output_tokens_details'].includes(key)) ||
      !record(usage.input_tokens_details) || !record(usage.output_tokens_details) ||
      Object.keys(usage.input_tokens_details).some(key => !['cached_tokens', 'cache_write_tokens'].includes(key)) ||
      Object.keys(usage.output_tokens_details).some(key => key !== 'reasoning_tokens')) fail();
  const counts = { input: usage.input_tokens, cachedInput: usage.input_tokens_details.cached_tokens,
    cacheWrite: usage.input_tokens_details.cache_write_tokens, output: usage.output_tokens,
    reasoning: usage.output_tokens_details.reasoning_tokens, fees: 0 };
  // No fees only in the fixed Standard, text-only/no-tools scope. Missing counters are invalid.
  if (Object.values(counts).some(value => !uint(value)) || !uint(usage.total_tokens) ||
      usage.total_tokens !== counts.input + counts.output || counts.input > inputBound ||
      counts.output > request.maxOutputTokens || counts.cachedInput + counts.cacheWrite > counts.input ||
      counts.reasoning > counts.output) fail();
  if (!Array.isArray(data.output)) fail();
  const text = [];
  for (const item of data.output) {
    if (item.type === 'reasoning') continue;
    if (item.type !== 'message' || item.role !== 'assistant' || item.status !== 'completed' || !Array.isArray(item.content)) fail();
    for (const content of item.content) {
      if (content.type !== 'output_text' || typeof content.text !== 'string' ||
          (content.annotations != null && (!Array.isArray(content.annotations) || content.annotations.length))) fail();
      text.push(content.text);
    }
  }
  if (!text.length) fail();
  const safeId = typeof providerRequestId === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(providerRequestId) ? providerRequestId : null;
  return { text: text.join(''), usage: counts, metadata: { providerRequestId: safeId } };
}

export function createOpenAITransport({ fetchImpl, env = process.env, liveEnabled = false,
  offlineFixture = false, inputTokensForFixture, reservationGuard, timeoutMs = 60_000 } = {}) {
  if (!uint(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) throw Error('Invalid transport deadline');
  if (offlineFixture && (typeof fetchImpl !== 'function' || fetchImpl === globalThis.fetch || typeof inputTokensForFixture !== 'function')) throw Error('Offline fixture requires injected fetch and token count');
  const certificates = new WeakSet();
  function prepare(request) {
    const payload = buildResponsePayload(request);
    if (!offlineFixture) throw Error(LIVE_BLOCK_REASON);
    const count = inputTokensForFixture(payload);
    if (!uint(count) || count < 1 || count > 32_000) throw Error('Invalid fixture input token count');
    const certificate = Object.freeze({ payloadHash: fingerprint(payload), model: request.model,
      inputTokens: count, serviceTier: 'default', pricingDate: '2026-10-06', provenance: 'offline-fixture-only' });
    certificates.add(certificate); return certificate;
  }
  function inputBound(request, certificate) {
    const payload = buildResponsePayload(request);
    if (!offlineFixture) throw Error(LIVE_BLOCK_REASON);
    if (!certificates.has(certificate) || certificate.payloadHash !== fingerprint(payload) ||
        certificate.model !== request.model || certificate.serviceTier !== 'default' || certificate.pricingDate !== '2026-10-06') throw Error('Missing or mismatched input certificate');
    return certificate.inputTokens;
  }
  return {
    kind: offlineFixture ? 'offline-api-fixture' : 'live', liveEnabled, prepare, inputBound,
    async send(request, certificate) {
      if (!liveEnabled || !env.OPENAI_API_KEY) throw Error('blocked-live: explicit invocation and environment credential required');
      if (offlineFixture && env.OPENAI_API_KEY !== OFFLINE_FIXTURE_KEY) throw Error('Offline fixture requires sentinel credential');
      const payload = buildResponsePayload(request);
      const bound = inputBound(request, certificate);
      if (typeof reservationGuard !== 'function') throw Error('Missing persisted reservation guard');
      const held = reservationGuard(request);
      if (!record(held) || held.status !== 'pending' || held.model !== request.model || held.effort !== request.effort ||
          held.inputBound !== bound || held.outputBound !== request.maxOutputTokens || !uint(held.reservation) ||
          !request.reservation || held.id !== request.reservation.id) throw Error('Reservation does not cover request');
      const controller = new AbortController(); const abort = () => controller.abort(); let timer;
      try {
        if (request.signal?.aborted) fail();
        request.signal?.addEventListener('abort', abort, { once: true });
        const timeout = new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(Error('deadline')); }, timeoutMs);
          controller.signal.addEventListener('abort', () => reject(Error('aborted')), { once: true });
        });
        const receive = async () => {
          const response = await fetchImpl(ENDPOINT, { method: 'POST', redirect: 'error', signal: controller.signal,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: JSON.stringify(payload) });
          if (!response?.ok || response.redirected || response.url !== ENDPOINT) fail();
          // Failed bodies may echo private content. Never read or include them in errors.
          const data = await response.json();
          if (controller.signal.aborted) fail();
          return parseResponse(data, request, bound, response.headers?.get('x-request-id'));
        };
        return await Promise.race([receive(), timeout]);
      } catch { controller.abort(); fail(); }
      finally { clearTimeout(timer); request.signal?.removeEventListener('abort', abort); }
    }
  };
}

