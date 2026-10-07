import fs from 'node:fs';
import { validateDiagnostic } from './diagnostics.mjs';
const counters = ['input','cachedInput','cacheWrite','output','reasoning','total'];
const uint = value => Number.isSafeInteger(value) && value >= 0;
const invalid = () => { throw Error('Invalid diagnostic observation'); };
/** Read-only projection. Provider identities and diagnostic shapes remain private. */
export function projectDiagnosticObservations(state, rows) {
  if (!state || !Array.isArray(state.requests) || !Array.isArray(rows) || rows.length > 2048) invalid();
  try { for (const row of rows) validateDiagnostic(row); } catch { invalid(); }
  const requests = new Map(state.requests.map(request => [request.id, request]));
  if (requests.size !== state.requests.length || rows.some(row => row.kind === 'generation' && !requests.has(row.requestId))) invalid();
  const observations = {};
  for (const request of state.requests) {
    if (request.status !== 'unknown' || request.cost !== null || request.usage !== null) continue;
    const chain = rows.filter(row => row.kind === 'generation' && row.requestId === request.id);
    if (!chain.some(row => row.stage === 'schema-rejected')) continue;
    if (chain.length !== 4 || chain.some((row,index) => row.stage !== ['send-start','http-received','body-observed','schema-rejected'][index] || index > 0 && row.observedAt < chain[index-1].observedAt)) invalid();
    const [send,http,body,rejected] = chain;
    if (http.httpStatus !== 200 || body.httpStatus !== 200 || rejected.httpStatus !== null || !uint(request.start) || send.observedAt < request.start) invalid();
    if (body.schemaVersion !== rejected.schemaVersion || body.billingValidated !== rejected.billingValidated || body.schemaVersion === 3 && JSON.stringify(body.financialInspection) !== JSON.stringify(rejected.financialInspection)) invalid();
    if (body.billingValidated === true) continue;
    if (body.responseModel !== request.model || rejected.responseModel !== request.model || body.serviceTier !== 'default' || rejected.serviceTier !== 'default' || body.responseStatus === null || body.responseStatus !== rejected.responseStatus || http.providerRequestId !== body.providerRequestId || body.providerRequestId !== rejected.providerRequestId || body.responseId !== rejected.responseId) invalid();
    if (!counters.every(key => body.counterPresence[key] && rejected.counterPresence[key] && uint(body.counts[key]) && body.counts[key] === rejected.counts[key])) invalid();
    const matchingPreflights = (state.preflights ?? []).filter(p => p.requestId === request.id);
    if (matchingPreflights.length !== 1 || matchingPreflights[0].status !== 'complete' || matchingPreflights[0].model !== request.model || matchingPreflights[0].effort !== request.effort || matchingPreflights[0].serviceTier !== 'default' || matchingPreflights[0].inputTokens !== request.inputBound || body.observedAt > 253402300799999) invalid();
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
    return projectDiagnosticObservations(state,content.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)));
  } catch { invalid(); }
}
