import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replaceAll('\r\n', '\n');
const reference = 'skills/vl-orch-codex/references/model-routing.md';
const contract = read(reference);
const section = (text, heading) => text.split(heading)[1].split('\n## ')[0];
const table = text => text.split('\n').filter(line => line.startsWith('|')).slice(2)
  .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

// Instruction-delivery/data regressions, not a runtime model selector or semantic proof.
test('#356 preserves the approved Sol-first phase table while optimizing context separately', () => {
  const phases = table(section(contract, '## Select by uncertainty and consequence'));
  assert.deepEqual(phases.map(row => row.slice(1)), [
    ['latest supported Sol', 'medium'],
    ['latest supported Sol', 'high first'],
    ['latest supported Sol', 'medium'],
    ['latest supported Luna', 'low'],
    ['latest supported Sol', 'high'],
    ['latest supported Astra', 'high; xhigh for justified hard analysis'],
  ]);
  assert.match(phases[0][0], /Normal planning/);
  assert.match(phases[1][0], /Difficult architecture/);
  assert.match(phases[5][0], /recorded Sol impasse or capability failure/);
});

test('standalone orch seats and both brief paths resolve required full coordination resource in source and complete copies', () => {
  for (const prefix of ['skills', 'apps/skill-registry/content/skills']) {
    for (const slug of ['vl-orch-codex', 'vl-orch-claude', 'vl-orch-cursor', 'vl-start-feature', 'vl-chip']) {
      const source = read(prefix + '/' + slug + '/SKILL.md');
      const targets = [...source.matchAll(/\]\(([^)]+model-routing\.md(?:#efficient-coordination-356)?)\)/g)];
      assert.ok(targets.length, slug + ': mandatory full coordination source');
      for (const [, target] of targets) {
        const resolved = path.resolve(root, prefix, slug, target.split('#')[0]);
        assert.equal(fs.readFileSync(resolved, 'utf8').replaceAll('\r\n', '\n'), contract);
      }
    }
    const chip = read(prefix + '/vl-chip/SKILL.md');
    for (const entry of [section(chip, '### Codex self-contained worker brief'), section(chip, '## 2. The self-contained brief')]) {
      assert.match(entry, /full vl-adhd and vl-present/);
      assert.match(entry, /original-start/);
      assert.match(entry, /OPEN/);
      assert.match(entry, /full[^.]*resource\s+paths/);
      assert.match(entry, /reading/);
      assert.match(entry, /fork/);
      assert.doesNotMatch(entry, /paste the kickoff|copy them into/);
    }
  }
});

test('compact brief contract retains task-specific authority and gates instead of an optional history shortcut', () => {
  const brief = section(contract, '## Efficient coordination (#356)');
  for (const fact of ['goal and acceptance', 'scope and exclusions', 'ownership', 'dependencies',
    'exact issue/comment references', 'immutable base and original-start', 'absolute checkout and branch',
    'trusted authorization', 'exact model pin', 'gates, stops', 'required contract paths']) assert.ok(brief.includes(fact), fact);
  assert.match(brief, /Do not pass full conversation history by default/);
  assert.match(brief, /Reuse a viable worker for repair/);
  assert.match(brief, /Replacement never resets repair counts or required gates/);
});

test('repair review and necessary rerun examples preserve prior full coverage and exact-head evidence', () => {
  const examples = new Map(table(section(contract, '## Acceptance examples — review semantically')));
  assert.match(examples.get('Same model and fixture, different context strategy'), /acceptance, counters, handoffs, repairs, elapsed time and accepted-change cost/);
  assert.match(examples.get('Repair needs the same checkout and pin'), /Reuse the viable worker and ledger/);
  assert.match(examples.get('Required gate passed and source is unchanged'), /Reuse the exact-head evidence/);
  assert.match(examples.get('Clean issue/PR completion and the next task is unrelated'), /Recommend a fresh chat/);
  assert.match(examples.get('Long active repair still benefits from current evidence'), /Continue; length alone/);
  assert.match(examples.get('Topic changes after a complete handoff'), /do not create it without explicit authorization/);
  assert.match(examples.get('Context usage is not exposed'), /do not invent a percentage, timer or threshold/);
  assert.match(examples.get('Replacement resumes an unresolved defect'), /Reconcile ownership, live workers, dispatch lock and ledger/);
});

test('repair ledger, installed update route and historical ADR bytes remain intact', () => {
  const original = execFileSync('git', ['-C', root, 'show', 'origin/master:' + reference], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
  for (const heading of ['## Repair ledger and stop', '## Installed update route']) assert.equal(section(contract, heading), section(original, heading));
  const coordination = section(contract, '## Efficient coordination (#356)');
  assert.match(coordination, /cached input, uncached input/);
  assert.match(coordination, /handoff rounds/);
  assert.match(coordination, /Separate subscription usage from dated API-equivalent estimates/);
  assert.match(coordination, /No paid run starts without current authorization/);
  const checkpoint = section(contract, '## Fresh-chat checkpoint (#356)');
  assert.match(checkpoint, /Do not infer a token percentage or impose a universal timer/);
  assert.match(checkpoint, /Replacement or\ncompaction never resets gates, locks, authority, review independence or repair counts/);
  assert.match(checkpoint, /New sidebar chats still require explicit human authorization/);
});
