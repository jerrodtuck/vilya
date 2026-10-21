import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const eslint = path.join(app, 'node_modules/eslint/bin/eslint.js');
const depcruise = path.join(app, 'node_modules/dependency-cruiser/bin/dependency-cruiser.mjs');
const boundaryConfig = path.join(app, 'scripts/lint/boundary-config.cjs');

function fixture(run) {
  // An app-local temporary project finds the locked tools/types without symlinks.
  // Its own tsconfig keeps invalid cases out of the application build.
  const dir = fs.mkdtempSync(path.join(app, '.lint-fixture-'));
  function write(name, source) {
    const target = path.join(dir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, source);
  }
  function cli(tool, args) {
    const result = spawnSync(process.execPath, [tool, ...args], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    assert.ifError(result.error);
    assert.notEqual(result.status, null, result.stderr);
    return { status: result.status, output: result.stdout, stderr: result.stderr };
  }
  write('tsconfig.json', JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', lib: ['es2022', 'dom'], module: 'esnext', moduleResolution: 'bundler', paths: { '@/*': ['./src/*'] } }, include: ['src/**/*.ts'] }));
  write('eslint.config.mjs', `import { createLintConfig } from ${JSON.stringify(pathToFileURL(path.join(app, 'eslint.config.mjs')).href)};\nexport default createLintConfig(import.meta.dirname);`);
  const config = contracts => write('.dependency-cruiser.cjs', `module.exports = require(${JSON.stringify(boundaryConfig)})(${JSON.stringify(contracts)});`);
  config([]);
  try { run({ dir, write, cli, config }); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

function graph(cli) {
  const validation = cli(depcruise, ['--config', '.dependency-cruiser.cjs', 'src']);
  const result = cli(depcruise, ['--config', '.dependency-cruiser.cjs', 'src', '--output-type', 'json']);
  assert.equal(result.stderr, '');
  return { ...validation, report: JSON.parse(result.output) };
}
function hasViolation(report, name, from, to) {
  assert.ok(report.summary.violations.some(v => v.rule.name === name && v.from === from && v.to === to), `${name}: ${from} -> ${to}\n${JSON.stringify(report.summary.violations)}`);
}

test('installed graph checks alias, relative, type-only and indirect boundaries without filtering intermediates', () => fixture(({ write, cli }) => {
  const files = {
    'features/a/alias.ts': "import type { Item } from '@/features/b/private'; export type Copy = Item;",
    'features/a/relative.ts': "export { value } from '../b/private';",
    'features/b/private.ts': 'export const value = 1; export type Item = number;',
    'features/a/generated.ts': "export { value } from '../../../.next/bridge';",
    'features/a/entry.ts': "export { value } from '../../bridge';",
    'bridge.ts': "export { value } from './app/entry';",
    'app/entry.ts': 'export const value = 1;',
    'shared/outbound.ts': "export { value } from '../bridge';",
    'shared/feature.ts': "export { value } from '../features/b/private';",
    'features/a/missing.ts': "import './missing-relative'; import '@/missing-alias';",
    'features/a/production.ts': "export { value } from './consumer.test';",
    'features/a/consumer.test.ts': "export { value } from '../b/private';",
  };
  for (const [file, source] of Object.entries(files)) write('src/' + file, source);
  write('.next/bridge.ts', "export { value } from '../src/app/entry';");
  const { status, report } = graph(cli);
  assert.notEqual(status, 0);
  hasViolation(report, 'no-private-cross-feature', 'src/features/a/alias.ts', 'src/features/b/private.ts');
  hasViolation(report, 'no-private-cross-feature', 'src/features/a/relative.ts', 'src/features/b/private.ts');
  hasViolation(report, 'feature-no-app', 'src/features/a/entry.ts', 'src/app/entry.ts');
  hasViolation(report, 'feature-no-app', 'src/features/a/generated.ts', 'src/app/entry.ts');
  hasViolation(report, 'shared-no-features-or-app', 'src/shared/outbound.ts', 'src/app/entry.ts');
  hasViolation(report, 'shared-no-features-or-app', 'src/shared/feature.ts', 'src/features/b/private.ts');
  hasViolation(report, 'production-no-tests', 'src/features/a/production.ts', 'src/features/a/consumer.test.ts');
  assert.equal(report.summary.violations.filter(v => v.rule.name === 'no-unresolved-local').length, 2);
  assert.ok(report.modules.some(m => m.source === 'src/bridge.ts'));
  assert.ok(!report.summary.violations.some(v => v.from.endsWith('consumer.test.ts')));
}));

test('installed graph permits composition, same-feature internals, test consumers and external terminals', () => fixture(({ write, cli }) => {
  write('src/features/a/private.ts', "import './public'; export const value = 1;");
  write('src/features/a/public.ts', "export { value } from './private';");
  write('src/features/b/private.ts', 'export const other = 2;');
  write('src/app/entry.ts', "import 'server-only'; import 'geist/font/sans'; import 'geist/font/mono'; export { value } from '@/features/a/public'; export { other } from '../features/b/private';");
  write('src/features/a/consumer.test.ts', "export { other } from '../b/private';");
  write('.next/generated.ts', "export { missing } from '@/missing';");
  const { status, report } = graph(cli);
  assert.equal(status, 0, JSON.stringify(report.summary));
  assert.equal(report.summary.violations.length, 0);
  assert.ok(!report.modules.some(m => m.source.includes('.next/')));
}));

test('a named public contract permits only its exact edge and preserves private/cycle guards', () => fixture(({ write, cli, config }) => {
  const policy = [{ from: 'src/features/a/consumer.ts', to: 'src/features/b/contract.ts', owner: 'b', reason: 'fixture: approved acyclic collaboration' }];
  config(policy);
  write('src/features/a/consumer.ts', "export { value } from '../b/contract';");
  write('src/features/b/contract.ts', "export { value } from './private';");
  write('src/features/b/private.ts', 'export const value = 1;');
  assert.equal(graph(cli).status, 0);
  write('src/features/a/consumer.ts', "export { value } from '../b/contract'; export { value as privateValue } from '../b/private';");
  const adjacent = graph(cli);
  assert.notEqual(adjacent.status, 0);
  hasViolation(adjacent.report, 'no-private-cross-feature-contract-1', 'src/features/a/consumer.ts', 'src/features/b/private.ts');
  write('src/features/a/consumer.ts', "export { value } from '../b/contract';");
  write('src/features/b/private.ts', "import '../a/consumer'; export const value = 1;");
  const cyclic = graph(cli);
  assert.notEqual(cyclic.status, 0);
  assert.ok(cyclic.report.summary.violations.some(v => v.rule.name === 'no-cross-feature-cycles'));
}));

test('installed typed ESLint rejects unsafe boundaries, promise escapes and unexplained suppressions', () => fixture(({ write, cli }) => {
  write('src/adapter.ts', `
export const payload = JSON.parse('{}');
payload.call();
export function unsafeReturn() { return payload.value; }
function numberOnly(n: number) { return n; }
numberOnly(payload);
export type Explicit = any;
Promise.resolve(1);
void Promise.resolve(2);
setTimeout(async () => { await Promise.resolve(); }, 1);
// @ts-ignore
const ignored: number = 'bad';
// @ts-nocheck
export const stillChecked = 1;
// @ts-expect-error
const expected: number = 'bad';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Unexplained = any;
/* eslint-disable */
export {};
`);
  const result = cli(eslint, ['src', '--format', 'json']);
  assert.equal(result.status, 1, result.stderr);
  const messages = JSON.parse(result.output).flatMap(file => file.messages);
  for (const rule of ['no-explicit-any', 'no-unsafe-assignment', 'no-unsafe-argument', 'no-unsafe-call', 'no-unsafe-member-access', 'no-unsafe-return', 'no-floating-promises', 'no-misused-promises', 'ban-ts-comment']) {
    assert.ok(messages.some(m => m.ruleId === '@typescript-eslint/' + rule), rule);
  }
  assert.equal(messages.filter(m => m.ruleId === '@typescript-eslint/no-floating-promises').length, 2);
  assert.ok(messages.some(m => m.ruleId === '@eslint-community/eslint-comments/require-description'));
  assert.ok(messages.some(m => m.ruleId === '@eslint-community/eslint-comments/no-unlimited-disable'));
}));

test('validated unknown, handled promises and described narrow exceptions pass; size stays advisory', () => fixture(({ write, cli }) => {
  write('src/valid.ts', `
const payload: unknown = JSON.parse('{"value":1}');
if (typeof payload === 'object' && payload !== null && 'value' in payload && typeof payload.value === 'number') {
  const value: number = payload.value;
  console.log(value);
}
async function handled() { await Promise.resolve(); }
handled().catch(error => { console.error(error); });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- external vendor contract fixture needs this exact shape
export type Vendor = any;
// @ts-expect-error -- fixture tests the described TypeScript exception form
const expected: number = 'bad';
`);
  write('src/advisory.ts', Array.from({ length: 401 }, (_, i) => `export const value${i} = ${i};`).join('\n'));
  const result = cli(eslint, ['src', '--format', 'json']);
  assert.equal(result.status, 0, result.stderr + result.output);
  const messages = JSON.parse(result.output).flatMap(file => file.messages);
  assert.deepEqual(messages.map(m => [m.ruleId, m.severity]), [['max-lines', 1]]);
  write('src/valid.ts', '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately stale exception must fail\nexport const safe = 1;');
  const unused = cli(eslint, ['src', '--format', 'json']);
  assert.equal(unused.status, 1);
  assert.ok(JSON.parse(unused.output).flatMap(file => file.messages).some(m => /Unused eslint-disable/.test(m.message)));
}));
