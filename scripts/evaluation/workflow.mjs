import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { generate } from './harness.mjs';
import { runSandbox } from './sandbox.mjs';
import { LIMITS } from './money.mjs';
const fixtureDir = new URL('./fixtures/', import.meta.url);
import {cleanRelative,safeFile} from './paths.mjs';
export {safeFile} from './paths.mjs';
export function ownership(manifest) { return manifest.fileOwnership.map(file => cleanRelative(file.replace(/ \((generated|new)\)$/, ''))); }
export function applyPatch(root, manifest, text) {
  const patch = JSON.parse(text); const allowed = new Set(ownership(manifest));
  if (!patch || Object.keys(patch).join() !== 'files' || !Array.isArray(patch.files) || !patch.files.length || patch.files.length > allowed.size) throw Error('Invalid patch');
  const seen = new Set();
  const files = patch.files.map(file => {
    if (!file || Object.keys(file).sort().join() !== 'content,path' || !allowed.has(file.path) || seen.has(file.path) || typeof file.content !== 'string' || Buffer.byteLength(file.content) > 128_000) throw Error('Patch outside ownership');
    seen.add(file.path); return { path: safeFile(root, file.path), content: file.content };
  });
  const changed = files.some(file => !fs.existsSync(file.path) || fs.readFileSync(file.path, 'utf8') !== file.content);
  for (const file of files) { fs.mkdirSync(path.dirname(file.path), { recursive: true }); fs.writeFileSync(file.path, file.content); }
  return changed;
}
function context(root, manifest) {
  return ownership(manifest).map(relative => {
    const file = safeFile(root, relative); return { path: relative, content: fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null };
  });
}
export function gateArgs(command) {
  if (typeof command !== 'string' || !/^node [a-zA-Z0-9_./-]+(?: [a-zA-Z0-9_./-]+)*$/.test(command)) throw Error('Unapproved gate syntax');
  const args = command.split(' ').slice(1);
  if (!['node_modules/vitest/vitest.mjs', 'scripts/sync-skills.mjs'].includes(args[0]) || args.some(a => a.split('/').includes('..'))) throw Error('Unapproved gate');
  return args;
}
export async function gate(root, args, deadline, { sandbox } = {}) {
  if (!sandbox) throw Error('Docker sandbox required; host fixture execution forbidden');
  const results = await runSandbox({ ...sandbox, root: path.resolve(root, '../..'), commands: [args], deadline,
    name: `vilya357-gate-${process.pid}-${Date.now()}` }); return results[0];
}
export function schedule(manifests, { environment = 'api' } = {}) {
  if (!['api', 'native'].includes(environment)) throw Error('Unknown screening environment');
  const repetition = environment === 'api' ? 0 : 1;
  return manifests.flatMap(manifest => [...manifest.order[repetition]].map(arm => ({
    environment, fixture: manifest.name, seed: manifest.seed, arm, repetition: repetition + 1,
    trial: `${environment}_${manifest.name}_${repetition + 1}_${arm}`, pair: `${environment}_${manifest.name}_${repetition + 1}`
  })));
}
export function initialAllocation(manifests) {
  return { api: schedule(manifests, { environment: 'api' }), native: schedule(manifests, { environment: 'native' }) };
}
export function loadFixtures() {
  return ['behavior', 'instruction', 'migration'].map(name => {
    const manifest = JSON.parse(fs.readFileSync(new URL(`${name}.json`, fixtureDir), 'utf8'));
    if (manifest.name !== name || manifest.status !== 'tested' || !/^[a-f0-9]{40}$/.test(manifest.seed) || !Array.isArray(manifest.rubric) || manifest.order.length !== 2 || manifest.order.some(v => !['AB', 'BA'].includes(v))) throw Error('Invalid fixture');
    ownership(manifest); for (const command of [...manifest.gates.setup, ...manifest.gates.focused, ...manifest.gates.workerRegression, manifest.gates.independent.command]) gateArgs(command);
    return manifest;
  });
}
export function archiveFixture(repo, destination, seed, dependencies) {
  if (dependencies !== undefined) throw Error('Host dependencies forbidden; use pinned container image');
  if (!/^[a-f0-9]{40}$/.test(seed) || fs.existsSync(destination)) throw Error('Fresh immutable fixture required');
  fs.mkdirSync(destination, { recursive: true }); const tar = `${destination}.tar`;
  execFileSync('git', ['archive', '--format=tar', `--output=${tar}`, seed], { cwd: repo, windowsHide: true });
  execFileSync('tar', ['-xf', tar, '-C', destination], { cwd: repo, windowsHide: true });
  fs.unlinkSync(tar);
  const removeExamples = directory => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.name.startsWith('.env')) fs.rmSync(file, { recursive: true }); else if (entry.isDirectory()) removeExamples(file); } };
  removeExamples(destination);

}
export function fullGateCommands(root) {
  const app = path.join(root, 'apps/skill-registry'); const commands = [];
  for (const script of ['sync-github-projects-template.mjs','sync-night-shift-template.mjs','sync-skills.mjs']) if (fs.existsSync(path.join(app,'scripts',script))) commands.push([`scripts/${script}`]);
  commands.push(['node_modules/vitest/vitest.mjs','run'], ['node_modules/next/dist/bin/next','build'], ['scripts/scan-code-spacing.mjs']); return commands;
}
export async function acceptance(root, manifest, deadline, { sandbox } = {}) {
  if (!sandbox) throw Error('Docker sandbox required; host fixture execution forbidden');
  const oracle = safeFile(root, `apps/skill-registry/${manifest.gates.independent.copyTo}`);
  fs.copyFileSync(new URL(manifest.gates.independent.source, fixtureDir), oracle);
  const commands = [...manifest.gates.setup,...manifest.gates.focused,...manifest.gates.workerRegression,manifest.gates.independent.command].map(gateArgs);
  commands.push(...fullGateCommands(root));
  return runSandbox({ ...sandbox, root, commands, deadline, name: `vilya357-accept-${process.pid}-${Date.now()}` });
}
const reviewPrompt = (manifest, baseline, current, gates) => JSON.stringify({
  role: 'Separate independent reviewer. Apply the supplied rubric and existing architecture/quality requirements to actual before/after files and controller-run gates. Do not accept implementer claims. Return only JSON {ready:boolean,findings:[string]}. No tools/API/database/credential actions.',
  task: manifest.taskPrompt, rubric: manifest.rubric, baseline, current, gates
});
export async function runTrial({ ledger, provider, root, manifest, trial, arm, phaseOutput = 2400, acceptanceFn = acceptance, sandbox }) {
  ledger.begin(trial); const started = ledger.clock(); const baseline = context(root, manifest); let accepted = false, failure = null, gates = [], review = null;
  let ordinal = 0;
  const call = (phase, prompt, extras = {}) => generate(ledger, provider, {
    prompt, requestId: `${trial}_${phase}_${++ordinal}`, trial, phase,
    model: phase === 'planning' && arm === 'B' ? 'gpt-6-astra' : 'gpt-6.1-sol', effort: phase === 'review' ? 'high' : phase === 'planning' && arm === 'B' ? 'high' : 'medium',
    maxOutputTokens: phaseOutput, ...extras
  });
  try {
    const plan = await call('planning', JSON.stringify({ role: 'Resolve contracts, edge cases, ownership, exclusions, verification and stop conditions. No implementation. No tool execution.', task: manifest.taskPrompt, source: baseline, rubric: manifest.rubric }));
    const patch = await call('implementation', JSON.stringify({ role: 'Implement this settled plan. Return only JSON {files:[{path,content}]} containing full file replacements inside ownership. No shell commands/tools. Preserve unrelated behavior.', task: manifest.taskPrompt, plan, source: baseline, ownership: ownership(manifest) }));
    applyPatch(root, manifest, patch);
    for (let attempt = 0; attempt <= 2; attempt++) {
      gates = await acceptanceFn(root, manifest, Math.min(started + LIMITS.trialMs, ledger.read().trialStart + LIMITS.dispatchMs), { sandbox });
      if (gates.length && gates.every(result => result.passed)) {
        review = JSON.parse(await call('review', reviewPrompt(manifest, baseline, context(root, manifest), gates)));
        if (!review || typeof review.ready !== 'boolean' || !Array.isArray(review.findings) || review.findings.some(f => typeof f !== 'string')) throw Error('Invalid independent review');
        accepted = review.ready && review.findings.length === 0;
      }
      if (attempt > 0) ledger.repairResult(trial, 'acceptance', accepted);
      if (accepted || attempt === 2) break;
      const correction = await call('repair', JSON.stringify({ role: 'Correct the unresolved acceptance defect only. Return JSON {files:[{path,content}]}. This is a bounded corrective attempt; no third unsuccessful repair.', task: manifest.taskPrompt, source: context(root, manifest), gates, review, ownership: ownership(manifest) }), { defect: 'acceptance' });
      if (!applyPatch(root, manifest, correction)) throw Error('No corrective change');
    }
  } catch (error) { failure = ['Budget exhausted', 'Trial budget exhausted', 'Phase budget exhausted', 'Token bound exceeded', 'Request limit', 'No corrective change'].includes(error.message) ? error.message : 'Trial stopped: invalid output, unresolved request or required acceptance failure'; }
  finally { ledger.close(trial); }
  const state = ledger.read();
  return { fixture: manifest.name, seed: manifest.seed, trial, arm, started, ended: ledger.clock(), accepted,
    failure, gates: gates.map(({ output, ...metadata }) => metadata), review: review && { ready: review.ready, findingCount: review.findings.length },
    repairs: state.trials[trial].repairs, requests: state.requests.filter(r => r.trial === trial) };
}
