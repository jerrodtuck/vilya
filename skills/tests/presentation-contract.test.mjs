import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n');
const skill = read('skills/vl-present/SKILL.md');
const examples = read('skills/vl-present/references/examples.md');
const section = heading => examples.split('## ' + heading + '\n')[1]?.split('\n## ')[0];
const stable = ['Selection', 'Capabilities', 'Clarification', 'Evidence', 'Verification', 'Fallback', 'Accessibility'];

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    assert.ok(!fs.lstatSync(full).isSymbolicLink(), 'portable resource: ' + full);
    return entry.isDirectory() ? files(full).map(file => entry.name + '/' + file) : [entry.name];
  }).sort();
}

function anchors(markdown) {
  return [...markdown.matchAll(/^#{1,6} (.+)$/gm)].map(([, title]) => title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-'));
}

test('portable companion has stable public sections and metadata/coverage agreement', () => {
  assert.match(skill, /^---\nname: vl-present\n/);
  assert.deepEqual([...skill.matchAll(/^## (.+)$/gm)].map(match => match[1]), stable);
  const rows = read('docs/design/codex-skill-coverage.md').split('\n').filter(row => row.startsWith('| [vl-present]'));
  assert.equal(rows.length, 1);
  const row = rows[0].split(' | ');
  for (const [field, index] of [['codex-support', 1], ['codex-invocation', 2], ['codex-prerequisites', 3], ['codex-notes', 4]]) {
    const entries = [...skill.matchAll(new RegExp('^' + field + ': "([^"\\n]+)"$', 'gm'))];
    assert.equal(entries.length, 1);
    assert.equal(row[index], entries[0][1]);
    if (field === 'codex-notes' || field === 'codex-prerequisites') assert.ok(entries[0][1].length > 20);
  }
  assert.equal(row[1], 'shared-compatible');
  assert.equal(row[2], '$vl-present');
  assert.ok(row[5].includes('Reviewed; runtime pending'));
  assert.deepEqual(anchors(skill).filter(anchor => stable.map(s => s.toLowerCase()).includes(anchor)), stable.map(s => s.toLowerCase()));
});

test('complete source/generated folders match and resource links/anchors resolve', () => {
  const source = path.join(root, 'skills/vl-present');
  const generated = path.join(root, 'apps/skill-registry/content/skills/vl-present');
  assert.deepEqual(files(generated), files(source));
  for (const file of files(source)) {
    assert.deepEqual(fs.readFileSync(path.join(source, file)), fs.readFileSync(path.join(generated, file)));
    for (const directory of [source, generated]) for (const [, link] of fs.readFileSync(path.join(directory, file), 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
      if (/^[a-z]+:|^\//i.test(link)) continue;
      const [target, anchor] = link.split('#');
      const resolved = path.resolve(directory, path.dirname(file), target || path.basename(file));
      assert.ok(fs.existsSync(resolved), file + ': ' + link);
      if (anchor) assert.ok(anchors(fs.readFileSync(resolved, 'utf8')).includes(anchor), link);
    }
  }
});

test('architecture diagram preserves exact supplied nodes, edges, labels and directions', () => {
  const flow = section('Architecture flow');
  const diagram = flow.match(/```mermaid\n([\s\S]*?)```/)[1];
  const sourceNodes = flow.split('Source nodes:')[1].split('Source edges')[0];
  const nodes = [...sourceNodes.matchAll(/^\| (\w+) \| ([^|]+) \|$/gm)].filter(([, id]) => id !== 'ID').map(([, id, label]) => [id, label.trim()]).sort();
  const diagramNodes = [...diagram.matchAll(/(\w+)\["([^"]+)"\]/g)].map(([, id, label]) => [id, label]).sort();
  assert.equal(nodes.length, 5);
  assert.deepEqual(diagramNodes, nodes);
  const sourceEdges = flow.split('Source edges')[1].split('Editable diagram source')[0];
  const edges = [...sourceEdges.matchAll(/^\| (\w+) \| (\w+) \| ([^|]+) \|$/gm)].filter(([, from]) => from !== 'From').map(([, from, to, meaning]) => [from, to, meaning.trim()]);
  const parseEdges = source => [...source.matchAll(/^\s*(\w+)(?:\["[^"]+"\])? -->\|([^|]+)\| (\w+)(?:\["[^"]+"\])?/gm)].map(([, from, meaning, to]) => [from, to, meaning]);
  assert.equal(edges.length, 4);
  assert.deepEqual(parseEdges(diagram), edges);
  assert.notDeepEqual(parseEdges(diagram.replace('api -->|enqueues task| queue', 'api -->|enqueues task| store')), edges);
  const text = flow.split('Text equivalent:')[1].split('Expected checks:')[0];
  for (const [, label] of nodes) assert.ok(text.includes(label));
  assert.ok(text.includes('No ordering, retry, security or exactly-once'));
  // Topology/source accuracy only, not observed diagram rendering.
});

test('scenario initial/changed cases agree with fixed source assumptions and derived arithmetic', () => {
  const scenario = section('Scenario exploration');
  const demand = Number(scenario.match(/demand is (\d+) jobs\/hour/i)[1]);
  const perWorker = Number(scenario.match(/Capacity per worker is (\d+) jobs\/hour/)[1]);
  const rows = [...scenario.matchAll(/^\| (\d+) \| (\d+) \| ([\d.]+) \| (\d+) \|$/gm)].map(match => match.slice(1).map(Number));
  assert.deepEqual(rows.map(row => row[0]), [1, 2, 3]);
  for (const [workers, capacity, load, backlog] of rows) {
    assert.equal(capacity, workers * perWorker);
    assert.equal(load, Math.round(demand / capacity * 10000) / 100);
    assert.equal(backlog, Math.max(0, demand - capacity));
  }
  assert.ok(scenario.includes('Initial state: 2 workers'));
  assert.ok(scenario.includes('change from 2 to 1 worker'));
  assert.ok(scenario.includes('not a product setting or an issue decision'));
  assert.ok(scenario.includes('No retry, startup delay, variance, scaling cost or service guarantee'));
  assert.ok(scenario.includes('not measured CPU use'));
  assert.ok(scenario.includes('do not establish a render path'));
  // This evaluates illustrative arithmetic, not interactive or keyboard behavior.
});

test('selection examples preserve preference, uncertainty, one material question and honest fallback', () => {
  const status = section('Short status');
  assert.ok(status.includes('Expected choice: prose'));
  assert.ok(status.includes('Issue #742’s PR'));
  assert.doesNotMatch(status, /PR #742/);
  assert.ok(status.includes('no merge authorization'));
  const comparison = section('Fixed comparison');
  for (const fact of ['One scheduled job and delayed results', 'Peak completion time is unmeasured', 'Continuous workers and ongoing operations', 'Retry load is unmeasured']) assert.ok(comparison.includes(fact));
  assert.equal([...comparison.matchAll(/Operator decision pending/g)].length, 2);
  assert.ok(section('Explicit text-only override').includes('No visual dependency or capability question'));
  const clarification = section('Material clarification');
  assert.equal([...clarification.matchAll(/Ask: “[^”]+”/g)].length, 1);
  assert.ok(clarification.includes('chat, or need a portable file'));
  const fallback = section('Unsupported or unverified path').replace(/\s+/g, ' ');
  for (const phrase of ['SDK X is unavailable', 'not as a measured unsupported capability', 'Source inspection is not runtime acceptance', 'owning spec', 'export format that remains unmet']) assert.ok(fallback.includes(phrase));
});

test('capability, evidence and accessibility rules separate expectations from observed acceptance', () => {
  const prose = skill.replace(/\s+/g, ' ');
  for (const phrase of ['sole shared writing policy', 'explicit format wins', 'Read the selected capability\'s full instructions', 'does not prove rendering support', 'incompatible canvas, fragment or document recipes', 'Do not invent a Windows bridge', 'not prerequisites', 'do not make a second tracker', 'adjacent prose', 'not exercised/unverified']) assert.ok(prose.toLowerCase().includes(phrase.toLowerCase()), phrase);
  const checks = section('Accessibility verification record');
  for (const label of ['Reading order', 'Named native control and focus', 'Keyboard input', 'Hover/color independence', 'Narrow width', 'Reduced motion']) assert.ok(checks.includes('| ' + label + ' |'));
  assert.ok(examples.includes('not observed project results or host acceptance'));
  assert.ok(skill.includes('essential facts must not exist only in animated content'));
  assert.ok(checks.includes('never be reported as a passed runtime check'));
});
