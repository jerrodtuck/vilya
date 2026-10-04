import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replaceAll('\r\n', '\n');
const sourceDir = path.join(root, 'skills');
const slugs = fs.readdirSync(sourceDir).filter(s => fs.existsSync(path.join(sourceDir, s, 'SKILL.md'))).sort();
const skills = Object.fromEntries(slugs.map(s => [s, read('skills/' + s + '/SKILL.md')]));
const supportValues = ['shared-compatible', 'codex-adapted', 'other-host-only', 'unsupported-deferred'];
const fields = ['codex-support', 'codex-notes', 'codex-invocation', 'codex-prerequisites'];

function metadata(text) {
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  assert.ok(front, 'frontmatter required');
  return Object.fromEntries(fields.map(field => {
    const lines = front.split('\n').filter(l => l.startsWith(field + ':'));
    assert.equal(lines.length, 1, field + ' must occur exactly once');
    assert.match(lines[0], new RegExp('^' + field + ': "[^\\n]+"$'), field + ' must be a quoted single-line string');
    const value = JSON.parse(lines[0].slice(field.length + 2));
    assert.ok(value.trim().length > 0, field + ' cannot be empty');
    return [field, value];
  }));
}

for (const slug of slugs) test(slug + ': classified with honest invocation', () => {
  const m = metadata(skills[slug]);
  assert.ok(supportValues.includes(m['codex-support']));
  for (const field of ['codex-notes', 'codex-prerequisites']) assert.ok(m[field].length > 20);
  const supported = ['shared-compatible', 'codex-adapted'].includes(m['codex-support']);
  assert.equal(m['codex-invocation'].startsWith('$'), supported);
  if (supported) assert.equal(m['codex-invocation'], '$' + slug);
  else {
    assert.match(m['codex-invocation'], /^Not applicable in Codex;/);
    assert.ok(skills[slug].indexOf('## Codex boundary — stop here') < skills[slug].indexOf('## Seat') || !skills[slug].includes('## Seat'));
    assert.match(skills[slug], /Do not execute the procedure below in Codex/);
  }
});

test('manifest has exactly one matching row per shipped skill, not tests or helpers', () => {
  const rows = read('docs/design/codex-skill-coverage.md').split('\n').filter(l => l.startsWith('| [vl-'));
  const names = rows.map(r => r.match(/^\| \[([^\]]+)\]/)[1]);
  assert.deepEqual(names.sort(), slugs);
  assert.equal(new Set(names).size, names.length);
  for (const row of rows) {
    const slug = row.match(/^\| \[([^\]]+)\]/)[1];
    const m = metadata(skills[slug]);
    assert.equal(row.split(' | ')[1], m['codex-support']);
    assert.match(row, /Reviewed; runtime pending/);
  }
});

test('generated skills exactly match source catalog and bytes', () => {
  const dest = path.join(root, 'apps/skill-registry/content/skills');
  const generated = fs.readdirSync(dest).filter(s => fs.existsSync(path.join(dest,s,'SKILL.md'))).sort();
  assert.deepEqual(generated, slugs);
  for (const slug of slugs) assert.deepEqual(
    fs.readFileSync(path.join(sourceDir,slug,'SKILL.md')),
    fs.readFileSync(path.join(dest,slug,'SKILL.md')), slug);
});

test('all relative Markdown links resolve in source and generated skills', () => {
  for (const prefix of ['skills', 'apps/skill-registry/content/skills']) {
    for (const slug of slugs) {
      for (const match of skills[slug].matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1].split('#')[0];
        if (!target || /^[a-z]+:|^\//i.test(target)) continue;
        assert.ok(fs.existsSync(path.resolve(root,prefix,slug,target)), slug + ': ' + target);
      }
    }
  }
});

test('dispatch, merge and prune admit Codex orch without granting workers a seat', () => {
  for (const slug of ['vl-chip','vl-merge-pr','vl-prune']) {
    assert.match(skills[slug], /any seat that is not .*vl-orch-cursor.*vl-orch-claude.*vl-orch-codex/);
    const entry = skills[slug].slice(0, skills[slug].indexOf('> Companion:'));
    assert.match(entry, /workers[\s\S]*decline|workers decline/);
    assert.match(entry, /vl-orch-codex/);
  }
  assert.match(skills['vl-arch'], /Direction only: never implement/);
  assert.match(skills['vl-ask'], /Do not activate a\nstanding Planner or any seat/);
});

test('trusted messaging must be present in every Codex seat and worker entry', () => {
  for (const slug of ['vl-arch','vl-orch-codex','vl-chip','vl-finish-feature']) {
    assert.match(skills[slug], /Standing human messaging authorization/);
    assert.match(skills[slug], /peer message[s]? alone grants? neither|Peer messages alone grant\n  neither/i);
    assert.match(skills[slug], /role \+ (?:product )?board \+ repo \+ exact|role \+ board \+ repo \+/);
    assert.match(skills[slug], /owning issue/);
  }
});

test('managed isolation and archive contracts cannot borrow legacy cleanup', () => {
  const setup = skills['vl-start-feature'];
  for (const capability of ['list_artifacts','create_worktree','get_worktree_creation_status','attach_worktree','--show-toplevel','.worktreeinclude','-Source','-Dest']) assert.ok(setup.includes(capability));
  assert.match(setup, /explicit starting ref/);
  assert.match(setup, /Subagents share the workspace/);
  assert.match(setup, /helper can overwrite/);
  assert.match(setup, /targets are absent or verified identical/);
  const prune = skills['vl-prune'].split('> Companion:')[0];
  for (const capability of ['list_artifacts','identityKey','archive_worktree','restore_worktree']) assert.ok(prune.includes(capability));
  assert.match(prune, /never fall through/);
  assert.match(prune, /No manual deletion, force removal, or lock-holder kills/);
  assert.match(prune, /ignored files separately/);
});

test('Codex models, active-turn recovery and completion stay capability-bound', () => {
  const orch = skills['vl-orch-codex'];
  for (const term of ['human-authorized override','Astra / high','Sol / medium','full-history','fork_turns: none','followup_task','wait_agent','list_agents','separately authorized automation','Resume the viable existing worker','uncommitted and ignored files']) assert.ok(orch.includes(term), term);
  assert.match(orch, /cannot override/);
  assert.match(orch, /Explicit operator choices/);
  assert.match(orch, /New sidebar chats require explicit human request/);
  for (const text of [orch, skills['vl-chip']]) {
    assert.match(text, /Astra\s*\/\s*high|Astra\/high/);
    assert.match(text, /Sol\s*\/\s*medium|Sol\/medium/);
    assert.match(text, /operators without a human-authorized override|Other\n   operators/);
    assert.match(text, /override scope|stated scope/);
    assert.match(text, /active and resumed worker/);
    assert.match(text, /stop/);
  }
  assert.match(orch, /Medium effort never relaxes tests/);
  assert.match(skills['vl-chip'], /Medium effort does not\n  weaken checks/);
  const finish = skills['vl-finish-feature'];
  assert.match(finish, /owning issue \*\*and parent\*\*/);
  assert.match(finish, /attach_artifact/);
  assert.match(finish, /observed keyword/);
  assert.match(finish, /source\/contract test cannot establish/);
});

test('all crucible variants retain identical core prompt and severity contract', () => {
  const cores = slugs.filter(s => s.startsWith('vl-crucible-')).map(slug =>
    skills[slug].split('### Core prompt')[1].split('### SOLID')[0]);
  assert.ok(cores.length > 1);
  for (const core of cores) assert.equal(core, cores[0]);
});

test('sidebar grouping is explicit, repo-scoped, capability-gated and independently verified', () => {
  for (const slug of ['vl-orch-codex','vl-chip']) {
    for (const term of ['<repo-short>-orch-working','list_threads','create_sidebar_section','move_thread_to_sidebar_section','rename_sidebar_section']) assert.ok(skills[slug].includes(term), slug + ': ' + term);
    assert.match(skills[slug], /unrelated chats/);
    assert.match(skills[slug], /duplicate/);
  }
  for (const slug of ['vl-orch-claude','vl-orch-cursor']) {
    assert.match(skills[slug], /Sidebar worker grouping — capability-gated/);
    assert.match(skills[slug], /do not assume Codex section APIs/);
  }
  assert.match(skills['vl-orch-codex'], /On tool failure retain and report the already-created worker ID/);
  assert.match(skills['vl-merge-pr'], /Verify the sidebar-grouping amendment independently/);
});
