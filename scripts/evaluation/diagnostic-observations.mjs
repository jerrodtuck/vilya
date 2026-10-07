import fs from 'node:fs';
import { validateDiagnostic } from './diagnostics.mjs';
import { LIMITS, validateConfig } from './money.mjs';
const counters = ['input','cachedInput','cacheWrite','output','reasoning','total'];
const uint = value => Number.isSafeInteger(value) && value >= 0;
const invalid = () => { throw Error('Invalid diagnostic observation'); };
function observationDeadline(state, request, config) {
  const deadlines = [request.start + config.bounds.requestMs];
  if (request.trial !== null) {
    const trialStart = state.trials?.[request.trial]?.start;
    if (!['planning','implementation','review','repair'].includes(request.phase) || !uint(trialStart) || !uint(state.trialStart) || trialStart < state.trialStart || request.start < trialStart) invalid();
    deadlines.push(trialStart + LIMITS.trialMs, state.trialStart + LIMITS.dispatchMs);
  } else {
    if (!['setup','final'].includes(request.phase)) invalid();
    const start = state.overheadStart?.[request.phase];
    if (!uint(start) || request.start < start) invalid();
    deadlines.push(start + (request.phase === 'final' ? LIMITS.finalMs : LIMITS.overheadMs));
    if (request.phase === 'final' && state.trialStart !== null) {
      if (!uint(state.trialStart)) invalid();
      deadlines.push(state.trialStart + LIMITS.dispatchMs + LIMITS.finalMs);
    }
  }
  if (deadlines.some(value => !uint(value))) invalid();
  return Math.min(...deadlines);
}
/** Read-only projection. Provider identities and diagnostic shapes remain private. */
export function projectDiagnosticObservations(state, rows, config) {
  if (!state || !Array.isArray(state.requests) || !Array.isArray(rows) || rows.length > 2048) invalid();
  try { validateConfig(config); for (const row of rows) validateDiagnostic(row); } catch { invalid(); }
  const requests = new Map(state.requests.map(request => [request.id, request]));
  if (requests.size !== state.requests.length || rows.some(row => row.kind === 'generation' && !requests.has(row.requestId))) invalid();
  const observations = {};
  for (const request of state.requests) {
    if (request.status !== 'unknown' || request.cost !== null || request.usage !== null) continue;
    const chain = rows.filter(row => row.kind === 'generation' && row.requestId === request.id);
    if (!chain.some(row => row.stage === 'schema-rejected')) continue;
    if (chain.length !== 4 || chain.some((row,index) => row.stage !== ['send-start','http-received','body-observed','schema-rejected'][index] || index > 0 && row.observedAt < chain[index-1].observedAt)) invalid();
    if (!uint(request.start)) invalid();
    const deadline = observationDeadline(state,request,config);
    if (chain.some(row => row.observedAt < request.start || row.observedAt >= deadline)) invalid();
    const [send,http,body,rejected] = chain;
    if (http.httpStatus !== 200 || body.httpStatus !== 200 || rejected.httpStatus !== null || !uint(request.start) || send.observedAt < request.start) invalid();
    if (body.schemaVersion !== rejected.schemaVersion || body.billingValidated !== rejected.billingValidated || body.schemaVersion === 3 && JSON.stringify(body.financialInspection) !== JSON.stringify(rejected.financialInspection)) invalid();
    if (body.billingValidated === true) continue;
    if (body.responseModel !== request.model || rejected.responseModel !== request.model || body.serviceTier !== 'default' || rejected.serviceTier !== 'default' || body.responseStatus === null || body.responseStatus !== rejected.responseStatus || http.providerRequestId !== body.providerRequestId || body.providerRequestId !== rejected.providerRequestId || body.responseId !== rejected.responseId) invalid();
    if (!counters.every(key => body.counterPresence[key] && rejected.counterPresence[key] && uint(body.counts[key]) && body.counts[key] === rejected.counts[key])) invalid();
    const matchingPreflights = (state.preflights ?? []).filter(p => p.requestId === request.id);
    if (matchingPreflights.length !== 1) invalid();
    const preflight = matchingPreflights[0];
    if (preflight.id !== request.id+'_count' || preflight.trial !== request.trial || preflight.phase !== request.phase || preflight.status !== 'complete' || preflight.model !== request.model || preflight.effort !== request.effort || preflight.serviceTier !== 'default' || preflight.pricingDate !== '2026-10-06' || preflight.billingInterpretation !== 'published-pricing-count-zero-2026-10-06' || !/^[a-f0-9]{64}$/.test(preflight.payloadHash) || preflight.inputTokens !== request.inputBound || !uint(preflight.start) || preflight.start > request.start || request.start-preflight.start > 60000 || body.observedAt > 253402300799999) invalid();
    const c = body.counts;
    if (!uint(request.inputBound) || !uint(request.outputBound) || c.input > request.inputBound || c.output > request.outputBound || c.cachedInput + c.cacheWrite > c.input || c.reasoning > c.output || c.total !== c.input + c.output) invalid();
    observations[request.id] = { source:'provider-response-metadata', billingValidation:'not-validated', responseStatus:body.responseStatus, observedAt:new Date(body.observedAt).toISOString(), usage:{inputTokens:c.input,cachedInputTokens:c.cachedInput,cacheWriteInputTokens:c.cacheWrite,outputTokens:c.output,reasoningOutputTokens:c.reasoning,totalTokens:c.total,reasoningIsOutputSubset:true} };
  }
  return observations;
}
/** Only the verified ledger's fixed diagnostic sibling can be opened. No writes or network. */
export function readDiagnosticObservations(ledger) {
  const state = ledger.read();
  const file = ledger.file + '.diagnostics.jsonl';
  try {
    for (const sibling of [file+'.lock',file+'.next']) if (fs.existsSync(sibling)) invalid();
    if (!fs.existsSync(file)) return {};
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1000000) invalid();
    const content = fs.readFileSync(file,'utf8');
    if (Buffer.byteLength(content) > 1000000) invalid();
    return projectDiagnosticObservations(state,content.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)),ledger.config);
  } catch { invalid(); }
}
