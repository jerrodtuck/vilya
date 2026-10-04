import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contractPath = 'vl-orch-codex/references/model-routing.md';
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replaceAll('\r\n', '\n');
const contract = read('skills/' + contractPath);

test('full routing resource ships byte-identically in the complete generated folder', () => {
  assert.deepEqual(fs.readFileSync(path.join(root, 'skills', contractPath)), fs.readFileSync(path.join(root, 'apps/skill-registry/content/skills', contractPath)));
  for (const prefix of ['skills', 'apps/skill-registry/content/skills']) {
    // Follow the actual required entry link, including the close-out and worker entries.
    for (const slug of ['vl-orch-codex', 'vl-chip', 'vl-finish-feature']) {
      const manifest = read(prefix + '/' + slug + '/SKILL.md');
      const target = [...manifest.matchAll(/\]\(([^)]+model-routing\.md)\)/g)][0]?.[1];
      assert.ok(target, slug + ': required full contract link');
      const resolved = path.resolve(root, prefix, slug, target);
      assert.equal(resolved, path.join(root, prefix, contractPath));
      assert.equal(fs.readFileSync(resolved, 'utf8').replaceAll('\r\n', '\n'), contract);
    }
    // Resource links must also be portable; manifest-only link checks miss these.
    for (const [, target] of contract.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^[a-z]+:|^\//i.test(target)) continue;
      assert.ok(fs.existsSync(path.resolve(root, prefix, path.dirname(contractPath), target.split('#')[0])), target);
    }
  }
});

test('reference has one phase table and distinct reviewable acceptance dispositions', () => {
  const phaseRows = contract.split('## Select by uncertainty and consequence')[1].split('Route by uncertainty')[0].split('\n').filter(line => line.startsWith('|'));
  assert.equal(phaseRows.length, 8); // header + separator + six authorized initial routes
  assert.equal(phaseRows.filter(line => line.includes('Luna')).length, 1);
  const examples = contract.split('## Acceptance examples')[1].split('## Installed update route')[0].split('\n').filter(line => line.startsWith('|')).slice(2);
  assert.equal(examples.length, 16);
  assert.equal(new Set(examples.map(row => row.split('|')[1].trim())).size, examples.length);
  // Instruction/content integrity only; independent semantic review remains required.
  for (const phrase of ['Initial detection/reproduction is not a repair attempt', 'no-change rerun', 'STOP before a third correction', 'unavailable, not zero', 'preserving history', 'actual PR head/diff', 'reload', 'raw SKILL.md']) assert.ok(contract.toLowerCase().includes(phrase.toLowerCase()), phrase);
  assert.doesNotMatch(contract, /gpt-[0-9]/); // resolve current IDs at dispatch, not a permanent catalog
});

test('ADR preserves heading example in preamble and places refinement first', () => {
  const adr = read('docs/DECISIONS.md');
  assert.ok(adr.startsWith('# Decisions\n\nAppend-only ADR log — newest at top, \x60## YYYY-MM-DD — Title\x60. Grep by topic or issue #; captured via /vl-adr.\n\n'));
  const headings = [...adr.matchAll(/^## (\d{4}-\d{2}-\d{2}) — (.*)$/gm)];
  assert.ok(headings[0][2].includes('Codex routing by phase, uncertainty and consequence (#347)'));
  assert.ok(headings[1][2].includes('Repo-owned component baselines'));
});
