import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync(new URL('./verified-api-rates-2026-10-06.json', import.meta.url), 'utf8'));
// Integer microdollars; rates are microdollars per million tokens.
export const LIMITS = Object.freeze({ total: 25_000_000, trial: 2_000_000, overhead: 1_000_000,
  planning: 400_000, implementation: 1_000_000, reviewRepair: 600_000,
  trials: 12, trialMs: 420_000, dispatchMs: 5_040_000, finalMs: 360_000, overheadMs: 600_000 });
export function integer(value, name, min = 0) {
  if (!Number.isSafeInteger(value) || value < min) throw Error(`Invalid ${name}`);
  return value;
}
export function exactKeys(value, keys, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw Error(`Invalid ${name}`);
}
export function validateConfig(config) {
  exactKeys(config, ['version', 'mode', 'models', 'bounds'], 'config');
  if (config.version !== 1 || !['offline', 'live'].includes(config.mode)) throw Error('Invalid mode');
  exactKeys(config.bounds, ['maxInputTokens', 'maxOutputTokens', 'maxRequestsPerPhase', 'maxToolCalls', 'requestMs'], 'bounds');
  for (const key of ['maxInputTokens', 'maxOutputTokens', 'maxRequestsPerPhase', 'requestMs']) integer(config.bounds[key], key, 1);
  if (config.bounds.maxInputTokens > 32_000 || config.bounds.maxOutputTokens > 8_000 ||
      config.bounds.maxRequestsPerPhase > 8 || config.bounds.requestMs > 60_000 || config.bounds.maxToolCalls !== 0) throw Error('Bounds exceed offline harness limits');
  if (!config.models || !Object.keys(config.models).length) throw Error('Missing rates');
  for (const [id, model] of Object.entries(config.models)) {
    if (!id || id.length > 100) throw Error('Invalid exact model ID');
    exactKeys(model, ['pricingKind', 'verifiedAt', 'source', 'input', 'cachedInput', 'cacheWrite', 'output', 'maxFees'], 'rates');
    if (!['fake', 'verified-api'].includes(model.pricingKind) || !/^\d{4}-\d{2}-\d{2}$/.test(model.verifiedAt) || (model.pricingKind === 'fake' ? model.source !== 'offline-test-vector' : !/^https:\/\/developers\.openai\.com\/api\/docs\/models\//.test(model.source))) throw Error('Unverified rates');
    for (const key of ['input', 'cachedInput', 'cacheWrite', 'output', 'maxFees']) integer(model[key], key);
    if (config.mode === 'live' && model.pricingKind !== 'verified-api') throw Error('Live requires verified API rates');
    if (model.pricingKind === 'verified-api') {
      const expected = catalog.models[id];
      if (!expected || model.verifiedAt !== catalog.verifiedAt || model.source !== expected.source || model.maxFees !== 0 || ['input','cachedInput','cacheWrite','output'].some(key => model[key] !== expected[key])) throw Error('Exact dated rates mismatch');
    }
    if (model.cachedInput > model.input) throw Error('Cached rate exceeds uncached rate');
  }
  return config;
}
const ceil = value => (value + 999_999n) / 1_000_000n;
function amount(value) {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw Error('Cost overflow');
  return Number(value);
}
export function maximumCost(rate, input, output) {
  integer(input, 'input bound'); integer(output, 'output bound');
  // Input, cached input and cache writes are disjoint billing categories.
  return amount(ceil(BigInt(input) * BigInt(Math.max(rate.input, rate.cachedInput, rate.cacheWrite))) +
    ceil(BigInt(output) * BigInt(rate.output)) + BigInt(rate.maxFees));
}
export function actualCost(rate, usage) {
  exactKeys(usage, ['input', 'cachedInput', 'cacheWrite', 'output', 'reasoning', 'fees'], 'usage');
  for (const key of Object.keys(usage)) integer(usage[key], `usage ${key}`);
  if (usage.cachedInput > usage.input || usage.reasoning > usage.output || usage.cacheWrite > usage.input - usage.cachedInput || usage.fees > rate.maxFees) throw Error('Unbounded usage');
  return amount(ceil(BigInt(usage.input - usage.cachedInput - usage.cacheWrite) * BigInt(rate.input) +
    BigInt(usage.cachedInput) * BigInt(rate.cachedInput) + BigInt(usage.cacheWrite) * BigInt(rate.cacheWrite)) +
    ceil(BigInt(usage.output) * BigInt(rate.output)) + BigInt(usage.fees));
}
export const exampleConfig = () => ({ version: 1, mode: 'offline', models: {
  'offline-fixture-model': { pricingKind: 'fake', verifiedAt: '2026-10-06', source: 'offline-test-vector',
    input: 1_000_000, cachedInput: 500_000, cacheWrite: 0, output: 2_000_000, maxFees: 0 }
}, bounds: { maxInputTokens: 32_000, maxOutputTokens: 8_000, maxRequestsPerPhase: 8, maxToolCalls: 0, requestMs: 1000 } });




export function apiConfig() {
  const config = exampleConfig(); config.mode = 'live';
  config.models = Object.fromEntries(Object.entries(catalog.models).map(([id, rate]) => [id, { pricingKind: 'verified-api', verifiedAt: catalog.verifiedAt, ...rate, maxFees: 0 }]));
  config.bounds.requestMs = 60000; return config;
}

