import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const resource = 'vl-orch-codex/references/model-routing.md';
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replaceAll('\r\n', '\n');
const contract = read('skills/' + resource);
const scenarios = new Map(contract.split('## Acceptance examples')[1].split('## Installed update route')[0].split('\n').filter(s => s.startsWith('|')).slice(2).map(row => row.split('|').slice(1,3).map(s => s.trim())));
test('completion scenarios distinguish pending evidence, related repair and new unrelated work', () => {
  assert.match(scenarios.get('PR opened, native completion received, independent review still owed'), /pending.*not accepted completion/);
  assert.match(scenarios.get('Related review finding before accepted completion'), /viable worker, exact pin and ledger/);
  assert.match(scenarios.get('Unit independently accepted; unrelated issue is next'), /compact result.*new compact brief/);
  assert.match(scenarios.get('Accepted unit still has a needed checkout/setup or dependent lock'), /Preserve environment[/]ownership.*no dependency/);
  assert.match(scenarios.get('Completed child history remains inspectable'), /No disposal.*idle-charge.*exposed lifecycle/);
});
test('every applicable canonical entry resolves the same complete accepted-boundary resource', () => {
  for (const prefix of ['skills', 'apps/skill-registry/content/skills']) {
    for (const slug of ['vl-orch-codex','vl-orch-claude','vl-orch-cursor','vl-chip','vl-start-feature','vl-finish-feature']) {
      const source = read(prefix + '/' + slug + '/SKILL.md');
      const target = [...source.matchAll(/\]\(([^)]+model-routing\.md#accepted-worker-completion-368)\)/g)][0]?.[1];
      assert.ok(target, slug);
      assert.equal(read(path.relative(root, path.resolve(root, prefix, slug, target.split('#')[0]))), contract);
    }
  }
});
test('result includes acceptance evidence and environment obligations without disposal guarantees', () => {
  const boundary = contract.split('## Accepted worker completion (#368)')[1].split('## Repair ledger')[0];
  for (const term of ['exact head', 'gate/review evidence references', 'remaining obligations', 'setup', 'lock/dependency state', 'Operator merge authority is separate', 'no active or dependent work', 'histories are isolated', 'summaries return', 'ongoing charges', 'continue/Compact/fresh-chat']) assert.ok(boundary.includes(term), term);
});
