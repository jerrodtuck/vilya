import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, unlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./select-checks.mjs', import.meta.url));
function history(t, files) {
  const cwd = mkdtempSync(join(tmpdir(), 'vilya-impact-'));
  // Only this test-owned, freshly created directory is removed.
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const write = (file, body = 'fixture\n') => {
    mkdirSync(dirname(join(cwd, file)), { recursive: true });
    writeFileSync(join(cwd, file), body);
  };
  const commit = () => {
    git('add', '.');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture');
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q');
  write('seed');
  for (const file of files) write(file);
  const base = commit();
  return { cwd, write, commit, base, run: (head, mode = 'pull_request', from = base) =>
    spawnSync(process.execPath, [cli, from, head, mode], { cwd, encoding: 'utf8', env: { ...process.env, GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '' } }) };
}
function selection(fixture, head, ...args) {
  const result = fixture.run(head, ...args);
  assert.equal(result.status, 0, result.stderr);
  const { lint, registry, skills, tooling } = JSON.parse(result.stdout);
  return { lint, registry, skills, tooling };
}
const all = { lint: true, registry: true, skills: true, tooling: true };

test('real CLI distinguishes docs from shared delivery and broadens dependencies/unknown impact', t => {
  const f = history(t, []);
  f.write('docs/project-tracking/changelog.d/example.md');
  assert.deepEqual(selection(f, f.commit()), { lint: false, registry: false, skills: false, tooling: false });
  f.write('skills/vl-plan/references/planner-contract.md');
  assert.deepEqual(selection(f, f.commit()), { lint: false, registry: true, skills: true, tooling: false });
  f.write('apps/skill-registry/package-lock.json');
  assert.deepEqual(selection(f, f.commit()), { lint: true, registry: true, skills: true, tooling: false });
  f.write('scripts/new-loader.mjs');
  assert.deepEqual(selection(f, f.commit()), all);
  f.write('scripts/evaluation/owner-campaign.mjs');
  const campaign = JSON.parse(f.run(f.commit()).stdout);
  assert.match(campaign.unverified[0], /Owner-specific campaign verification required/);
});

test('missing/malformed base fails visibly; default-branch mode selects full regression', t => {
  const f = history(t, []);
  for (const base of ['', 'not-a-sha', 'f'.repeat(40)]) {
    const result = f.run(f.base, 'pull_request', base);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Selection failed visibly/);
    assert.equal(result.stdout, '');
  }
  assert.deepEqual(selection(f, f.base, 'push'), all);
});

test('rename out of shared delivery keeps old-path consumers; deletion keeps registry checks', t => {
  const shared = 'skills/example/SKILL.md';
  const registry = 'apps/skill-registry/src/removed.ts';
  const f = history(t, [shared, registry]);
  mkdirSync(join(f.cwd, 'docs'), { recursive: true });
  renameSync(join(f.cwd, shared), join(f.cwd, 'docs', 'moved.md'));
  unlinkSync(join(f.cwd, registry));
  const head = f.commit();
  assert.deepEqual(selection(f, head), { lint: true, registry: true, skills: true, tooling: false });
  const result = JSON.parse(f.run(head).stdout);
  assert.ok(result.paths.includes(shared));
  assert.ok(result.paths.includes('docs/moved.md'));
  assert.ok(result.paths.includes(registry));
});
