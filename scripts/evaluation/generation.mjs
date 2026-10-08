import {haltPostUnknown} from './post-unknown-recovery.mjs';
import {isFinancialRejection} from './openai-transport.mjs';
import fs from 'node:fs';import path from 'node:path';
export async function generate(ledger, provider, { prompt, requestId, trial = null, phase, model, effort, maxOutputTokens, defect = null }) {
  if(fs.existsSync(path.join(path.dirname(ledger.file),'.sandbox-cleanup-hold.json'))){ledger.transaction(state=>{state.blocked=true;haltPostUnknown(ledger);});throw Error('Sandbox cleanup unresolved; generation held');}ledger.ready(ledger.read());
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
  let financialComplete = false;
  try {
    if (duration <= 0) throw Error('deadline');
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('timeout')); }, duration); });
    const result = await Promise.race([Promise.resolve().then(() => provider.send({
      ...transportRequest, reservation: request, signal: controller.signal
    }, certificate)), timeout]);
    if (isFinancialRejection(result)) {
      if (result.observedAt >= request.start + duration || result.observedAt >= ledger.deadline(trial,phase)) throw Error('Late financial result');
      ledger.reconcile(requestId,result.usage,result.metadata,result.observedAt);financialComplete=true;throw Error('Content rejected; financial usage complete');
    }
    if (ledger.clock() >= ledger.deadline(trial, phase) || ledger.clock() >= request.start + duration || !result || typeof result.text !== 'string' ||
        Buffer.byteLength(result.text, 'utf8') > (provider.kind === 'fake' ? maxOutputTokens : 128_000)) throw Error('Invalid or late result');
    ledger.reconcile(requestId, result.usage, result.metadata);
    // Prompt and generated text are never persisted in the budget ledger.
    return result.text;
  } catch {
    controller.abort(); if(financialComplete)throw Error('Content rejected; financial usage complete');ledger.hold(requestId);
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
