import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replaceAll('\r\n', '\n');
const source = read('skills/vl-handoff/SKILL.md');

test('vl-handoff ships as one byte-identical discoverable skill', () => {
  assert.equal(source, read('apps/skill-registry/content/skills/vl-handoff/SKILL.md'));
  for (const fact of ['name: vl-handoff', 'codex-invocation: "$vl-handoff"', 'continue',
    'recommend a fresh chat', 'ready-to-paste', 'stable link']) assert.ok(source.includes(fact), fact);
});

test('handoff preserves complete state and grants no transfer authority', () => {
  for (const fact of ['exact issue, PR, head, worktree and branch', 'live workers and locks',
    'active pins', 'repair ledger', 'financial limits/holds', 'resets none',
    'explicit human authorization', 'invocation creates none']) assert.ok(source.includes(fact), fact);
});

test('semantic checkpoint cases remain distinct', () => {
  assert.match(source, /continue here.*compact this chat.*recommend a fresh chat/s);
  assert.match(source, /Continue useful active repairs/);
  assert.match(source, /built-in Compact command/);
  assert.match(source, /no universal timer, turn count or token threshold/);
  assert.match(source, /receiving seat reconciles live ownership, workers, locks and ledger/);
  assert.match(source, /new sidebar chat still requires explicit human authorization/);
});

test('applicable seats use short milestone references to the shared skill', () => {
  for (const slug of ['vl-arch', 'vl-orch-codex', 'vl-orch-claude', 'vl-orch-cursor',
    'vl-plan', 'vl-chip', 'vl-start-feature', 'vl-cursor-handoff']) {
    const body = read(`skills/${slug}/SKILL.md`);
    assert.ok(body.includes('../vl-handoff/SKILL.md'), slug);
    assert.match(body, /choose\s+continue, built-in Compact, or recommend\s+fresh chat/i, slug);
    assert.ok(body.split('../vl-handoff/SKILL.md').length - 1 <= 2, `${slug}: duplicated handoff policy`);
  }
});
