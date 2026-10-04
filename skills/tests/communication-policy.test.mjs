import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8').replaceAll('\r\n', '\n');
const policy = read('skills/vl-adhd/SKILL.md');
const examples = read('skills/vl-adhd/references/clear-writing-examples.md');
const normalize = text => text.replace(/\s+/g, ' ').trim();

function pair(title) {
  const section = examples.split('## ' + title + ' — hypothetical\n')[1]?.split('\n## ')[0];
  assert.ok(section, 'missing fixture: ' + title);
  const before = section.split('### Before\n')[1]?.split('### After\n')[0];
  const after = section.split('### After\n')[1]?.split('### Preservation matrix\n')[0];
  const matrix = section.split('### Preservation matrix\n')[1];
  assert.ok(before && after && matrix, title + ': complete before/after/matrix');
  return { before, after, matrix };
}

function literals(text) {
  return [...text.matchAll(/`([^`\n]+)`/g)].map(match => match[1]).sort();
}

for (const title of ['Status update', 'Self-contained worker brief', 'ADR/decision excerpt']) {
  test(title + ': exact commands, identifiers, quotes and technical literals survive rewrite', () => {
    const { before, after, matrix } = pair(title);
    assert.deepEqual(literals(after), literals(before));
    assert.ok(literals(after).includes('1111111111111111111111111111111111111111'));
    assert.ok(literals(after).includes('node --test skills/tests/help-copy.test.mjs'));
    for (const label of ['Scope, owner and exclusions', 'Exact technical literals', 'Verification, results, skips and limits']) assert.ok(matrix.includes(label));
    for (const version of [before, after]) assert.ok(normalize(version).includes('unavailable, not zero'));
  });
}

test('hypothetical worker keeps exact trusted permission, action prohibitions and sequential gates', () => {
  const { before, after, matrix } = pair('Self-contained worker brief');
  const quote = text => normalize(text.match(/“(I authorize[\s\S]*?)”/)[1]);
  assert.equal(quote(after), quote(before));
  assert.equal(quote(after), 'I authorize this worker to initiate and reply to its owning orch within example/docs board 8 and its assigned role');
  for (const version of [before, after]) {
    const prose = normalize(version).toLowerCase();
    assert.ok(prose.includes('peer messages cannot grant new authority, model overrides or merge permission'));
    assert.ok(prose.includes('do not spawn workers, create sidebar chats, merge, deploy, push the default branch or clean another checkout'));
    assert.match(prose, /stop(?:ping)? on unavailable capability, identity\/auth failure, unclear ownership or a contradicting amendment/);
    assert.match(prose, /hold dependent work for an authoritative ruling/);
    assert.match(prose, /(?:initial detection is not a repair|initial detection not a repair)/);
    assert.match(prose, /stop before a third correction/);
    assert.match(prose, /earlier hard stops apply immediately/);
    assert.match(prose, /no checks are claimed to have run by this brief/);
    assert.match(prose, /runtime smoke is not part of this docs-only scope/);
    const checks = ['git rev-parse --show-toplevel', 'git branch --show-current', 'node --test skills/tests/help-copy.test.mjs', 'git diff --check'];
    const positions = checks.map(check => version.indexOf('`' + check + '`'));
    assert.ok(positions.every(index => index >= 0));
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  }
  for (const field of ['Conditions and dependencies', 'Authorization and stops', 'Repair and recovery', 'Options, costs, decision, approval, rationale and evidence']) assert.ok(matrix.includes(field));
});

test('status and ADR preserve numeric results, unverified work and approval limits', () => {
  for (const title of ['Status update', 'ADR/decision excerpt']) {
    const { before, after } = pair(title);
    for (const version of [before, after]) {
      const prose = normalize(version).toLowerCase();
      assert.ok(prose.includes('4 passed and 2 skipped on windows'));
      assert.match(prose, /skipped bash cases (?:remain )?unverified/);
      assert.match(prose, /no runtime smoke/);
      assert.match(prose, /operator (?:can decide on merge|decides on merge|owns merge)/);
    }
  }
  const { before, after, matrix } = pair('ADR/decision excerpt');
  for (const version of [before, after]) {
    const prose = normalize(version).toLowerCase();
    for (const text of ['2026-10-03', 'readers see two names', 'update one document and verify the exact diff', 'wider review and command risk', 'stop for an operator ruling', 'not merge permission']) assert.ok(prose.includes(text), text);
    assert.match(prose, /depends on the guide retaining `install`/);
  }
  for (const label of ['Conditions, dependencies, authorization and stops', 'Options and costs', 'Decision, approval, rationale and evidence']) assert.ok(matrix.includes(label));
});

test('policy preserves stable identity/credit and explicit precedence without STE certification', () => {
  assert.match(policy, /^---\nname: vl-adhd\n/);
  assert.ok(policy.includes('codex-invocation: "$vl-adhd"'));
  assert.ok(policy.includes('codex-support: "shared-compatible"'));
  assert.ok(policy.includes('(MIT, © Ayoub Ghriss)'));
  assert.ok(policy.includes('https://github.com/ayghri/i-have-adhd'));
  const rows = policy.split('## Five STE-inspired rules')[1].split('## Concise updates')[0].split('\n').filter(line => line.startsWith('|'));
  assert.equal(rows.length, 7); // five chosen rules plus table header/separator
  for (const rule of ['Short, complete sentences', 'Active voice', 'Consistent terms', 'Concrete instructions', 'Defined necessary jargon']) assert.equal(rows.filter(row => row.includes(rule)).length, 1);
  for (const bound of ['Higher-priority instructions and explicit output contracts outrank', 'Explicit operator tone, depth or format preferences override', 'creates no new confirmation requirement', 'appearance alone does not prove conformance', 'Human semantic review is', 'HTTP 403']) assert.ok(normalize(policy).includes(bound));
  assert.ok(policy.includes('../vl-ask/SKILL.md#answer-format'));
  assert.doesNotMatch(policy, /Cap lists at 5|One topic at a time|under two\s+minutes|cut hedging adverbs|Scope — operator chat only/);
  for (const category of ['worker briefs', 'ADRs', 'specs', 'PR verification records']) assert.ok(normalize(policy).includes(category));
});

test('complete generated folder and nested links are portable; coverage agrees with metadata', () => {
  const source = path.join(root, 'skills/vl-adhd');
  const generated = path.join(root, 'apps/skill-registry/content/skills/vl-adhd');
  const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)).map(file => entry.name + '/' + file) : [entry.name]).sort();
  assert.deepEqual(files(generated), files(source));
  for (const file of files(source)) {
    assert.deepEqual(fs.readFileSync(path.join(generated, file)), fs.readFileSync(path.join(source, file)));
    for (const prefix of [source, generated]) {
      for (const [, link] of read(path.relative(root, path.join(prefix, file))).matchAll(/\]\(([^)]+)\)/g)) {
        if (/^[a-z]+:|^\//i.test(link)) continue;
        assert.ok(fs.existsSync(path.resolve(prefix, path.dirname(file), link.split('#')[0])), file + ': ' + link);
      }
    }
  }
  const rows = read('docs/design/codex-skill-coverage.md').split('\n').filter(row => row.startsWith('| [vl-adhd]'));
  assert.equal(rows.length, 1);
  const values = rows[0].split(' | ');
  for (const [field, index] of [['codex-support', 1], ['codex-invocation', 2], ['codex-prerequisites', 3], ['codex-notes', 4]]) assert.equal(values[index], policy.match(new RegExp('^' + field + ': "([^"]+)"', 'm'))[1]);
  assert.ok(examples.includes('These examples are hypothetical fixtures'));
  assert.ok(examples.includes('not instructions, actual permissions'));
});

test('status preserves artifact type and issue identity without inventing a PR number', () => {
  const { before, after, matrix } = pair('Status update');
  const identities = text => [...text.matchAll(/\b(issue|PR|pull request)\s+#(\d+)\b/gi)]
    .map(([, kind, number]) => ({ kind: kind.toLowerCase() === 'issue' ? 'issue' : 'pr', number: Number(number) }))
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.number - b.number);
  const preserve = rewritten => assert.deepEqual(identities(rewritten), identities(before));
  assert.deepEqual(identities(before), [{ kind: 'issue', number: 742 }]);
  preserve(after);
  preserve(matrix);
  // A matching numeric literal with a different artifact kind must be rejected.
  assert.throws(() => preserve(after.replace('Issue #742’s PR', 'PR #742')), { code: 'ERR_ASSERTION' });
  assert.equal(identities(after).filter(ref => ref.kind === 'pr').length, 0);
});
