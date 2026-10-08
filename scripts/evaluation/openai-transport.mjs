import {inspectFinancialResponse,projectFinancialDiagnostics,FINANCIAL_CONTRACT_VERSION} from './financial-inspector.mjs';
import {diagnosticEvent,safeProviderId} from './diagnostics.mjs';
import { createHash } from 'node:crypto';
const ENDPOINT = 'https://api.openai.com/v1/responses';
const MODELS = new Set(['gpt-6.1-sol', 'gpt-6-astra']);
const REQUEST_KEYS = new Set(['model', 'effort', 'prompt', 'maxOutputTokens', 'maxToolCalls', 'retries', 'signal', 'reservation']);
export const OFFLINE_FIXTURE_KEY = 'offline-fixture-only-not-a-real-api-key';
export const COUNT_BILLING_INTERPRETATION = 'published-pricing-count-zero-2026-10-06';
export const LIVE_BLOCK_REASON = 'blocked-live: exact count preparation requires the approved billing interpretation and durable preflight guard';
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
    max_output_tokens: request.maxOutputTokens, text: { format: { type: 'text' } }, tools: [], tool_choice: 'none', parallel_tool_calls: false,
    service_tier: 'default', store: false, stream: false, background: false, truncation: 'disabled' };
}

export function validateFinancialResponse(data, request, inputBound) {
  const inspection=inspectFinancialResponse(data,request,inputBound);if(!inspection.validated)fail();
  const usage=data.usage;return {input:usage.input_tokens,cachedInput:usage.input_tokens_details.cached_tokens,cacheWrite:usage.input_tokens_details.cache_write_tokens,output:usage.output_tokens,reasoning:usage.output_tokens_details.reasoning_tokens,fees:0};
}
const financialRejections = new WeakSet();
export const isFinancialRejection = value => record(value) && financialRejections.has(value);
function rejectedFinancialResult(usage, metadata, observedAt) {
  const result = Object.freeze({ usage, metadata, observedAt }); financialRejections.add(result); return result;
}
export function parseResponse(data, request, inputBound, providerRequestId = null) {
  const counts = validateFinancialResponse(data, request, inputBound);
  if(data.status!=='completed')fail();
  const text = [];
  for (const item of data.output) {
    if (item.type === 'reasoning') continue;
    if (item.type !== 'message' || item.role !== 'assistant' || item.status !== 'completed' || !Array.isArray(item.content)) fail();
    if (item.phase === 'commentary') continue;
    for (const content of item.content) {
      if (content.type !== 'output_text' || typeof content.text !== 'string' ||
          (content.annotations != null && (!Array.isArray(content.annotations) || content.annotations.length))) fail();
      text.push(content.text);
    }
  }
  if (!text.length || !text.join('').trim()) fail();
  const safeId = typeof providerRequestId === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(providerRequestId) ? providerRequestId : null;
  return { text: text.join(''), usage: counts, metadata: { providerRequestId: safeId } };
}

export function createOpenAITransport({ fetchImpl = globalThis.fetch, env = process.env, liveEnabled = false,
  offlineFixture = false, inputTokensForFixture, reservationGuard, preflightGuard,
  countBillingInterpretation, diagnosticGuard, timeoutMs = 60_000, clock = Date.now } = {}) {
  if (!uint(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) throw Error('Invalid transport deadline');
  if (offlineFixture && (typeof fetchImpl !== 'function' || fetchImpl === globalThis.fetch || typeof inputTokensForFixture !== 'function')) throw Error('Offline fixture requires injected fetch and token count');
  const certificates = new WeakSet(); const consumed = new WeakSet();
  function configured() {
    if (!offlineFixture && (countBillingInterpretation !== COUNT_BILLING_INTERPRETATION ||
        typeof diagnosticGuard!=='function' || !preflightGuard || ['begin', 'complete', 'hold'].some(key => typeof preflightGuard[key] !== 'function'))) throw Error(LIVE_BLOCK_REASON);
  }
  function credential() {
    if (!liveEnabled || !env.OPENAI_API_KEY) throw Error('blocked-live: explicit invocation and environment credential required');
    if (offlineFixture && env.OPENAI_API_KEY !== OFFLINE_FIXTURE_KEY) throw Error('Offline fixture requires sentinel credential');
  }
  function observe(scope,stage,fields={}){const secret=env.OPENAI_API_KEY;const suppress=value=>typeof value==='string'&&secret&&value.includes(secret)?null:value;const safeFields={...fields,providerRequestId:suppress(fields.providerRequestId),data:fields.data?{...fields.data,id:suppress(fields.data.id)}:null};if(diagnosticGuard&&diagnosticGuard(diagnosticEvent({...scope,stage,...safeFields,clock}))!==true)throw Error('Diagnostic persistence unavailable');}
  async function post(url, payload, signal, deadline, scope, financialValidator = null) {
    const controller = new AbortController(); const abort = () => controller.abort(); let timer;
    try {
      observe(scope,'send-start');
      if (signal?.aborted) fail();
      signal?.addEventListener('abort', abort, { once: true });
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(Error('deadline')); }, deadline);
        controller.signal.addEventListener('abort', () => reject(Error('aborted')), { once: true });
      });
      const receive = async () => {
        const response = await fetchImpl(url, { method: 'POST', redirect: 'error', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'X-Client-Request-Id': scope.requestId, Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: JSON.stringify(payload) });
        const rawId=response?.headers?.get('x-request-id');const providerRequestId=safeProviderId(rawId,'req',env.OPENAI_API_KEY);
        const fields={httpStatus:response?.status??null,providerRequestId};observe(scope,'http-received',fields);
        if (!response?.ok || response.redirected || response.url !== url){observe(scope,'http-rejected',fields);fail();}
        // Failed bodies may echo private content. Never read or include them in errors.
        let data;try{data=await response.json();}catch{observe(scope,'body-unavailable',fields);fail();}let finance = null;
        if(financialValidator){const inspection=financialValidator(data);finance={billingValidated:inspection.validated,billingFailureCode:inspection.validated?null:'unsupported-financial-scope',usage:inspection.validated?validateFinancialResponse(data,{model:payload.model,maxOutputTokens:payload.max_output_tokens},scope.inputBound):null,inspection,diagnosticProjection:projectFinancialDiagnostics(data)};}
        const observedAt=clock();observe(scope,'body-observed',{...fields,data,...(finance?{billingValidated:finance.billingValidated,billingFailureCode:finance.billingFailureCode,financialInspection:finance.inspection,financialContractVersion:FINANCIAL_CONTRACT_VERSION,diagnosticProjection:finance.diagnosticProjection}:{})});if(controller.signal.aborted)fail();
        return { data, providerRequestId, finance, observedAt };
      };
      return await Promise.race([receive(), timeout]);
    } catch { controller.abort(); observe(scope,'transport-unavailable'); fail(); }
    finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
  }
  function mint(request, payload, count, provenance, preflightId = null) {
    if (!uint(count) || count < 1 || count > 32_000) throw Error('Invalid input token count');
    const issuedAt = clock(); if (!uint(issuedAt)) throw Error('Invalid certificate clock');
    const certificate = Object.freeze({ payloadHash: fingerprint(payload), model: request.model, effort: request.effort,
      inputTokens: count, serviceTier: 'default', pricingDate: '2026-10-06', provenance, preflightId, issuedAt, expiresAt: issuedAt + 60_000 });
    certificates.add(certificate); return certificate;
  }
  function prepare(request, scope = {}) {
    const payload = buildResponsePayload(request); configured();
    if (offlineFixture) return mint(request, payload, inputTokensForFixture(payload), 'offline-fixture-only');
    credential();
    return (async () => {
      // The counter consumes identical model/input and empty tool definitions. Output controls
      // do not add input tokens; the certificate binds every generation option nevertheless.
      const meta = { ...scope, payloadHash: fingerprint(payload), model: request.model, effort: request.effort,
        serviceTier: 'default', pricingDate: '2026-10-06', billingInterpretation: COUNT_BILLING_INTERPRETATION };
      const pending = preflightGuard.begin(meta, scope);
      if (!pending || pending.status !== 'pending' || typeof pending.id !== 'string' ||
          pending.payloadHash !== meta.payloadHash || pending.model !== meta.model || !uint(pending.deadline)) throw Error('Missing durable preflight reservation');
      try {
        const remaining = pending.deadline - clock();
        if (!uint(remaining) || remaining < 1) fail();
        const result = await post(`${ENDPOINT}/input_tokens`, { model: payload.model, input: payload.input,
          reasoning: payload.reasoning, text: payload.text, parallel_tool_calls: payload.parallel_tool_calls,
          tools: payload.tools, tool_choice: payload.tool_choice, truncation: payload.truncation }, request.signal, Math.min(timeoutMs, 15_000, remaining),{requestId:pending.id,kind:'count'});
        if (clock() >= pending.deadline || !record(result.data) || Object.keys(result.data).sort().join('|') !== 'input_tokens|object' ||
            result.data.object !== 'response.input_tokens' || !uint(result.data.input_tokens) ||
            result.data.input_tokens < 1 || result.data.input_tokens > 32_000) fail();
        if (preflightGuard.complete(pending.id, { inputTokens: result.data.input_tokens, providerRequestId: result.providerRequestId }) !== true) fail();
        return mint(request, payload, result.data.input_tokens, 'openai-exact-input-count', pending.id);
      } catch { preflightGuard.hold(pending.id); throw Error('Input preflight unresolved; dispatch held'); }
    })();
  }
  function inputBound(request, certificate) {
    const payload = buildResponsePayload(request); configured();
    const now = clock();
    if (!certificates.has(certificate) || consumed.has(certificate) || certificate.payloadHash !== fingerprint(payload) ||
        certificate.model !== request.model || certificate.effort !== request.effort || certificate.serviceTier !== 'default' ||
        certificate.pricingDate !== '2026-10-06' || !uint(now) || now < certificate.issuedAt || now >= certificate.expiresAt) throw Error('Missing, expired or mismatched input certificate');
    return certificate.inputTokens;
  }
  return {
    kind: offlineFixture ? 'offline-api-fixture' : 'live', liveEnabled, prepare, inputBound,
    async send(request, certificate) {
      credential(); const payload = buildResponsePayload(request); const bound = inputBound(request, certificate);
      if (typeof reservationGuard !== 'function') throw Error('Missing persisted reservation guard');
      const held = reservationGuard(request);
      if (!record(held) || held.status !== 'pending' || held.model !== request.model || held.effort !== request.effort ||
          held.inputBound !== bound || held.outputBound !== request.maxOutputTokens || !uint(held.reservation) ||
          !request.reservation || held.id !== request.reservation.id) throw Error('Reservation does not cover request');
      consumed.add(certificate); // Consumed even if request is lost: never blindly retry.
      const scope={requestId:held.id,kind:'generation',inputBound:bound};const result = await post(ENDPOINT,payload,request.signal,timeoutMs,scope,data=>inspectFinancialResponse(data,request,bound));
      let parsed;try{parsed=parseResponse(result.data,request,bound,result.providerRequestId);}catch{observe(scope,'schema-rejected',{data:result.data,providerRequestId:result.providerRequestId,billingValidated:result.finance.billingValidated,billingFailureCode:result.finance.billingFailureCode,financialInspection:result.finance.inspection,financialContractVersion:FINANCIAL_CONTRACT_VERSION,diagnosticProjection:result.finance.diagnosticProjection});if(result.finance.billingValidated)return rejectedFinancialResult(result.finance.usage,{providerRequestId:result.providerRequestId},result.observedAt);fail();}observe(scope,'response-accepted',{data:result.data,providerRequestId:result.providerRequestId});return parsed;
    }
  };
}
