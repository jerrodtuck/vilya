import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const slug = 'vl-crucible-python';
const skill = read('skills/' + slug + '/SKILL.md');
const core = text => text.slice(text.indexOf('### Core prompt'), text.indexOf('### SOLID'));

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? files(path.join(dir, entry.name)).map(file => path.join(entry.name, file)) : [entry.name]).sort();
}

test('general Python preserves raw core/reporting bytes and complete generated folder', () => {
  assert.equal(core(skill), core(read('skills/vl-crucible-ml/SKILL.md')));
  const source = path.join(root, 'skills', slug);
  const bundle = path.join(root, 'apps/skill-registry/content/skills', slug);
  assert.deepEqual(files(bundle), files(source));
  for (const file of files(source)) assert.deepEqual(fs.readFileSync(path.join(bundle, file)), fs.readFileSync(path.join(source, file)));
});

test('general Python contract retains import exceptions and proportional boundary checks', () => {
  assert.match(skill, /Entrypoints import features; features import\s+shared primitives/);
  assert.match(skill, /Shared code imports neither features\s+nor entrypoints/);
  assert.match(skill, /Cross-feature internal imports or dependency cycles/);
  assert.match(skill, /explicit public contract[\s\S]*allowed with justification/);
  assert.match(skill, /Independence is appropriate[\s\S]*only for features that must have/);
  assert.match(skill, /missing automated enforcement alone is 🟠, not proof of a violation/);
  assert.match(skill, /Type hints and dataclasses describe contracts but do not themselves validate runtime input/);
  assert.match(skill, /no mandatory Pydantic, framework, ORM\/service layer or ML scaffold/);
  assert.match(skill, /small\s+single-purpose script does not need artificial packages or a wholesale reorganization/);
  assert.match(skill, /Permitted composition[\s\S]*from tool.exporting.api import export_report[\s\S]*from tool.reporting.api import build_report/);
  assert.match(skill, /Prohibited inside[\s\S]*from tool.reporting._storage import load_rows/);
  assert.match(skill, /blanket independence contract would wrongly ban this permitted exception/);
});

test('general Python ADR is newest and preserves the prior log after one exact insertion', () => {
  const base = execFileSync('git', ['-C', root, 'show', '1b8e15f1b58fd2b419656c1f3dc79fc3c7454fce:docs/DECISIONS.md'], { encoding: 'utf8' }).replaceAll('\r\n', '\n');
  const current = read('docs/DECISIONS.md').replaceAll('\r\n', '\n');
  const boundary = base.search(/^## \d{4}-\d{2}-\d{2} — /m);
  const heading = '## 2026-10-09 — General Python crucible with feature boundaries (#376)';
  const history = current.indexOf(base.slice(boundary));
  assert.ok(current.slice(boundary).startsWith(heading));
  assert.equal(current.split(heading).length, 2);
  assert.ok(history > boundary);
  assert.equal(current.slice(0, boundary) + current.slice(history), base);
});
