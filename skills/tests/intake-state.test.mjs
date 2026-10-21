import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialState, reconcile, revisionOf, markEmitted, restoreState, sinceBoundary, MAX_REVISIONS } from '../vl-orch-codex/resources/intake-state.mjs';

const issue = 'https://github.com/jerrodtuck/vilya/issues/384';
const time = '2026-10-21T12:00:00Z';
const revision = (source = 'comment:123', content = 'direction', updatedAt = time) => revisionOf({issue, source, updatedAt, content});
const tick = (state, changes = {}) => reconcile(state, {ok: true, complete: true, watermark: time, ...changes});

test('controlled clock: idle progression/cap/reset and independently scheduled active watch', () => {
  let state = initialState(), now = 0;
  const deadlines = [];
  for (let i = 0; i < 8; i++) {
    const result = tick(state); state = result.state;
    assert.deepEqual(result.wakes, []); now += result.delaySeconds; deadlines.push(now);
  }
  assert.deepEqual(deadlines, [30,150,270,570,870,1470,2070,2670]);
  const idleBefore = structuredClone(state);
  const active = tick(initialState(), {active: true});
  assert.equal(active.delaySeconds, 120);
  assert.deepEqual(state, idleBefore);
  const fresh = tick(state, {revisions:[{...revision(),mode:'dispatch'}]});
  assert.equal(fresh.delaySeconds, 30); assert.equal(fresh.state.emptyChecks, 0);
  assert.deepEqual(tick(markEmitted(fresh.state, fresh.wakes)).wakes, []);
});

test('pending survives watermark/restart; emitted is not consumed; only substantive exact ACK consumes', () => {
  const r = revision();
  const pending = tick(initialState(), {revisions:[{...r,mode:'dispatch'}]});
  assert.equal(pending.state.revisions[r.key].status, 'pending');
  const restarted = restoreState(JSON.stringify(pending.state));
  assert.equal(restarted.reconcileRequired, false);
  assert.deepEqual(tick(restarted.state, {watermark:'2026-10-22T00:00:00Z'}).wakes,[r.key]);
  const emitted = markEmitted(restarted.state, [r.key]);
  assert.equal(emitted.revisions[r.key].status,'emitted');
  const markerOnly = tick(emitted,{acknowledgments:[{key:r.key,substantive:false}]});
  assert.equal(markerOnly.state.revisions[r.key].status,'emitted');
  const consumed = tick(markerOnly.state,{acknowledgments:[{key:r.key,substantive:true}]});
  const saved = restoreState(JSON.stringify(consumed.state)).state;
  assert.deepEqual(tick(saved,{revisions:[r]}).wakes,[]);
  const edit = revision('comment:123','amended direction'); // same timestamp, changed bytes
  assert.deepEqual(tick(saved,{revisions:[{...edit,mode:'dispatch'}]}).wakes,[edit.key]);
});

test('publication ordering at adapter boundary: comment before label -> candidate -> source ACK -> restart silence', () => {
  // Normalized adapter fixture follows the documented full pending-label reconciliation.
  const normalize = (body, pending) => {
    const r = revision('comment:123',body);
    if(body.includes('<!-- vilya-handoff:v1 mode=dispatch -->')) return pending ? [{...r,mode:'dispatch'}] : [];
    return [{...r,mode:'record-only'}];
  };
  const body = '<!-- vilya-handoff:v1 mode=dispatch -->\nSettled direction';
  let result = tick(initialState(),{revisions:normalize(body,false)});
  assert.deepEqual(result.dispatchCandidates,[]);
  // The label adapter reads complete pending source comments even beyond its watermark.
  result = tick(result.state,{revisions:normalize(body,true),watermark:'2026-10-22T00:00:00Z'});
  const r = revision('comment:123',body);
  assert.deepEqual(result.dispatchCandidates,[r.key]);
  result = tick(markEmitted(result.state,result.wakes),{acknowledgments:[{key:r.key,substantive:true}]});
  const restarted = restoreState(JSON.stringify(result.state)).state;
  assert.deepEqual(tick(restarted,{revisions:normalize(body,true)}).wakes,[]);
  for(const record of ['unmarked direction','<!-- vilya-handoff:v1 mode=record-only -->\nRecord']) {
    assert.deepEqual(tick(initialState(),{revisions:normalize(record,true)}).dispatchCandidates,[]);
  }
});

test('parked answer and edited old comment are visible across overlapping time boundary', () => {
  const question = revision('parked:comment:4','pending question');
  const first = tick(initialState(),{revisions:[question]});
  const state = markEmitted(first.state,first.wakes);
  assert.deepEqual(tick(state,{revisions:[question]}).wakes,[]);
  const updated = '2026-10-21T12:02:00Z';
  const answer = revision('parked:comment:5','required ruling',updated);
  const edit = revision('parked:comment:4','question amended',updated);
  const result = tick(state,{revisions:[answer,edit],watermark:updated});
  assert.deepEqual(result.wakes,[answer.key,edit.key]);
  assert.equal(sinceBoundary(result.state.watermark),'2026-10-21T12:01:59.000Z');
  assert.deepEqual(tick(markEmitted(result.state,result.wakes),{revisions:[answer,edit]}).wakes,[]);
});

test('partial pagination/API failures preserve state; provider backoff overrides cadence', () => {
  const state = tick(initialState()).state;
  for(const failure of [{ok:false},{complete:false}]) {
    const result=tick(state,{...failure,revisions:[revision()],watermark:'2026-10-22T00:00:00Z',retryAfterSeconds:900});
    assert.deepEqual(result.state,state); assert.deepEqual(result.wakes,[]);
    assert.equal(result.delaySeconds,900); assert.equal(result.retry,true);
  }
  assert.equal(tick(state,{minimumSeconds:180}).delaySeconds,180);
});

test('simulated watcher loss restores saved emissions; corrupt state requests bounded reconciliation', () => {
  const r=revision();const result=tick(initialState(),{revisions:[r]});
  const saved=JSON.stringify(markEmitted(result.state,result.wakes));
  // Loss of host process, then one reconciliation before re-arm. This is not host wake evidence.
  const recovered=restoreState(saved);
  assert.deepEqual(tick(recovered.state,{revisions:[r]}).wakes,[]);
  for(const raw of ['broken',JSON.stringify({version:2}),JSON.stringify({...initialState(),revisions:{bad:{status:'consumed'}}})]) {
    const lost=restoreState(raw);assert.equal(lost.reconcileRequired,true);
    assert.deepEqual(tick(lost.state,{revisions:[r]}).wakes,[r.key]);
  }
});

test('capacity never evicts pending work and retirement requires durable consumption', () => {
  const r=revision();const pending=tick(initialState(),{revisions:[r]}).state;
  assert.throws(()=>tick(pending,{retiredIssues:[issue]}),/unconsumed/);
  const consumed=tick(pending,{acknowledgments:[{key:r.key,substantive:true}]}).state;
  assert.deepEqual(tick(consumed,{retiredIssues:[issue]}).state.revisions,{});
  const full=initialState();
  for(let i=0;i<MAX_REVISIONS;i++){const entry=revision(`comment:${i}`);full.revisions[entry.key]={...entry,mode:'record-only',status:'pending'};}
  const before=JSON.stringify(full);
  assert.throws(()=>tick(full,{revisions:[revision('overflow')]}),/capacity/);
  assert.equal(JSON.stringify(full),before);
});

test('shared contract/helper and callers resolve in canonical and generated complete folders', () => {
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  for(const prefix of ['skills','apps/skill-registry/content/skills']) {
    const base=path.join(root,prefix);
    for(const file of ['references/board-intake.md','resources/intake-state.mjs']) {
      assert.equal(fs.readFileSync(path.join(base,'vl-orch-codex',file),'utf8'),fs.readFileSync(path.join(root,'skills/vl-orch-codex',file),'utf8'));
    }
    for(const slug of ['vl-arch','vl-orch-codex','vl-orch-cursor','vl-orch-claude','vl-plan-codex','vl-plan-claude','vl-chip']) {
      const manifest=fs.readFileSync(path.join(base,slug,'SKILL.md'),'utf8');
      const target=manifest.match(/\]\(([^)]+board-intake\.md)\)/)?.[1];
      assert.ok(target,slug); assert.ok(fs.existsSync(path.resolve(base,slug,target)),slug);
    }
  }
});
