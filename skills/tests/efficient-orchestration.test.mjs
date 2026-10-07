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
test('#356 phase table routes only necessary bounded planning to Sol and concrete consequential questions to Astra', () => {
  const phases = table(section(contract, '## Select by uncertainty and consequence'));
  assert.deepEqual(phases.map(row => row.slice(1)), [
    ['latest supported Sol', 'medium'],
    ['latest supported Astra', 'high; xhigh only for justified hard analysis'],
    ['latest supported Sol', 'medium'],
    ['latest supported Luna', 'low'],
    ['latest supported Sol', 'high'],
    ['latest supported Astra', 'high; xhigh for justified hard analysis'],
  ]);
  assert.match(phases[0][0], /only when delegation is necessary; otherwise orch fills gaps/);
  assert.match(phases[1][0], /Named unresolved consequential architecture\/security question/);
  assert.match(phases[5][0], /not a topic label/);
  assert.doesNotMatch(phases.map(row => row[0]).join('\n'), /Normal planning|Astra.*routine/);
});

test('standalone orch seats and both brief paths resolve required full coordination resource in source and complete copies', () => {
  for (const prefix of ['skills', 'apps/skill-registry/content/skills']) {
    for (const slug of ['vl-orch-codex', 'vl-orch-claude', 'vl-orch-cursor', 'vl-start-feature', 'vl-chip']) {
      const source = read(prefix + '/' + slug + '/SKILL.md');
      const targets = [...source.matchAll(/\]\(([^)]+model-routing\.md#efficient-coordination-356)\)/g)];
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
  for (const fact of ['goal/acceptance', 'scope/ownership/exclusions', 'dependencies',
    'exact issue/comment references', 'immutable base/original-start', 'assigned absolute path/branch',
    'trusted human authorization/counterpart identity', 'model pin', 'exact tests/build/smoke/merge routing',
    'stop conditions', 'durable amendment/PR readback/completion requirements', 'full resource paths',
    'require reading', 'inaccessible', 'task-specific permissions and hard stops']) assert.ok(brief.includes(fact), fact);
  assert.match(brief, /Do not repeatedly paste contracts\/plans or pass full-history by default/);
  assert.match(brief, /configured defaults, scoped overrides and exact active\/resumed pins/);
  assert.match(brief, /revision\nis prospective/);
});

test('repair review and necessary rerun examples preserve prior full coverage and exact-head evidence', () => {
  const examples = new Map(table(section(contract, '## Acceptance examples — review semantically')));
  const settled = examples.get('Settled issue plan already resolves contracts/edge cases/gates');
  assert.match(settled, /without a planning delegate/);
  assert.match(examples.get('Routine gap is one missing bounded test command'), /Orch resolves\/records.*Sol\/medium, no automatic Astra/);
  const repaired = examples.get('Initial full review at head A; repair at head B');
  assert.match(repaired, /A\.\.B delta plus affected boundaries\/current amendments/);
  assert.match(repaired, /retain A full-review evidence and exact gate\/head provenance/);
  assert.match(examples.get('Repair has no earlier sufficient independent full review'), /Obtain missing full-change\/boundary coverage/);
  assert.match(examples.get('Changed source affects a passed gate'), /Repeat the affected required gate with reason and exact new head/);
  assert.match(examples.get('No change, failure or unresolved risk after required gates passed'), /no redundant full rerun\/review\/investigation/);
  assert.match(examples.get('New policy reaches an active Astra-pinned worker'), /Preserve the active\/resumed pin.*prospective/);
});

test('repair ledger, installed update route and historical ADR bytes remain intact', () => {
  const original = execFileSync('git', ['-C', root, 'show', '012220a83d11acf5c7c316dca36490152f9a8e90:' + reference], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
  for (const heading of ['## Repair ledger and stop', '## Installed update route']) assert.equal(section(contract, heading), section(original, heading));
  const adrPath = 'docs/DECISIONS.md';
  const adr = execFileSync('git', ['-C', root, 'show', '012220a83d11acf5c7c316dca36490152f9a8e90:' + adrPath], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
  assert.equal(read(adrPath), adr);
  const coordination = section(contract, '## Efficient coordination (#356)');
  assert.match(coordination, /No-change reruns and unrelated passes do not reset the same-defect repair count/);
  assert.match(coordination, /quiet output is not permission to end the task/);
  assert.match(coordination, /cached\/uncached input, output, reasoning and write counters where exposed/);
  assert.match(coordination, /Do not assume model changes always flush cache or\nrouting guarantees savings/);
  assert.match(coordination, /Subscription usage is separate from API cost estimates/);
  assert.match(coordination, /estimates do not establish actual subscription cost/);
  assert.match(coordination, /Preserve active pins without\nautomatic model bouncing/);
  assert.match(coordination, /adds no telemetry service/);
});
