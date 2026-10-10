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

test('archive-safety output and successor starter preserve uncertainty and authority', () => {
  for (const fact of ['old owning chat', 'safe to archive', 'not safe to archive',
    'unverified (treated as not safe)', 'concrete reason', 'manual action',
    'keep the old owner', 'chat unarchived', 'Recheck associated/attached trees',
    'This assessment does not authorize or perform archival']) assert.ok(source.includes(fact), fact);
});

test('archive safety reconciles actual inventory and every needed environment', () => {
  for (const fact of ['actual associated and attached worktrees', 'including background',
    'live workers', 'locks and dependent work', 'unavailable attachment query is not an empty inventory',
    'exact required head, branch and checkout', 'necessary ignored/untracked local setup',
    'confirm successor access', 'second attachment disables deletion',
    'private file contents out of public', 'Contradictions stop dependent work']) {
    assert.ok(source.includes(fact), fact);
  }
});

test('host-specific lifecycle evidence never becomes snapshot or pin preservation proof', () => {
  assert.ok(source.includes('https://learn.chatgpt.com/docs/environments/git-worktrees'));
  assert.match(source, /archiving an associated chat deletes its managed worktree/);
  assert.match(source, /permanent worktree is not automatically deleted by chat archival/);
  assert.match(source, /Snapshot recovery does not establish preservation/);
  assert.match(source, /For Claude Code or Cursor, verify their/);
  assert.match(source, /no conversion, branch migration, private-file\s+copy, settings change or new-chat creation/);
  assert.match(source, /Do not archive\/delete a live tree as a test/);
});

// Instruction delivery scenarios, never live archival or environment-preservation proof.
const cases = [
  ['Needed Codex-managed tree would be deleted with old owner', 'Not safe to archive; keep old owner unarchived'],
  ['Needed permanent tree with verified lifecycle, exact state/setup and successor access; ownership reconciled', 'Safe to archive assessment'],
  ['Completed unit, reconciled inventory, no needed environment or live/dependent worker/lock remains', 'completion alone without the inventory would be unverified'],
  ['Attachment inventory unavailable/missing or required private setup preservation unknown', 'Unverified (treated as not safe); keep old owner unarchived'],
  ['Successor has a second attachment or a mismatched head/branch/setup', 'reconcile exact state and deletion ownership before dependent action'],
  ['Successor reconciles all needed preserved environments and ownership with current host evidence', 'Safe only when every condition above holds'],
];
for (const [scenario, disposition] of cases) {
  test(`archive safety instruction case: ${scenario}`, () => {
    const row = source.split('\n').find(line => line.startsWith(`| ${scenario} |`));
    assert.ok(row, scenario);
    assert.ok(row.includes(disposition), disposition);
  });
}