import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const reference=read('skills/vl-handoff/references/seat-naming.md');
const handoff=read('skills/vl-handoff/SKILL.md');
test('naming ships as a complete shared resource and seat entry links resolve',()=>{
 assert.equal(reference,read('apps/skill-registry/content/skills/vl-handoff/references/seat-naming.md'));
 for(const slug of ['vl-arch','vl-orch-codex','vl-orch-claude','vl-orch-cursor','vl-chip','vl-start-feature','vl-cursor-handoff']){
 const p=`skills/${slug}/SKILL.md`,body=read(p);
 assert.ok(body.includes('../vl-handoff/references/seat-naming.md'),slug);
 assert.equal(body,read(`apps/skill-registry/content/skills/${slug}/SKILL.md`));
 }
});
test('handoff carries exact identity and reconciliation before canonical naming without weakening archive safety',()=>{
 for(const fact of ['exact source host/chat ID/observed title','intended successor title','before canonical naming','Ownership conflicts STOP','Rename only verified source/successor IDs','Source title: <observed title>','Successor: <host + exact ID, or pending>'])assert.ok(handoff.includes(fact),fact);
 for(const fact of ['live ownership, workers, locks, active pins, repair','ledger, worktrees/setup and authority **before taking the canonical title**','Unresolved ownership conflicts STOP takeover','Keep the source unarchived','preservation/safety is unverified','Names grant no archive/delete'])assert.ok(reference.includes(fact),fact);
});
test('host boundaries and observed evidence cannot become invented rename/readback capabilities',()=>{
 for(const fact of ['set_thread_title','list_threads','read_thread','Tool acceptance alone is not success','directory is not a rename API','Claude CLI and Cursor','automatic visible-title rename/readback is unverified','manual instruction with resolved values','rename is pending/unverified','if the host has no visible-title control','unknown successor ID stays','An inaccessible source remains'])assert.ok(reference.includes(fact),fact);
 assert.match(reference,/preserve an explicit human title preference/i);
 assert.match(reference,/source\/successor IDs as identity after rename/);
 assert.match(reference,/short-chat-ID from that exact source/);
 assert.match(reference,/No bulk title search or unrelated rename/);
 assert.match(reference,/native child task name is not proof of a sidebar chat/i);
});
// These reviewable instruction scenarios verify delivery, not runtime/lifecycle execution.
for(const [scenario,result] of [
 ['First seat has verified repo/role and no override','supported exact-ID rename plus observed readback, else exact manual fallback'],
 ['Human selected a custom title','do not overwrite it with canonical or previous naming'],
 ['Handoff title matches but live ownership conflicts','STOP takeover/dispatch before canonical naming'],
 ['Verified retained source and reconciled successor','Rename only the two verified IDs'],
 ['Source inaccessible or rename/readback unavailable','No guessed chat or success claim'],
 ['Source still owns needed managed environment or safety unknown','Keep source unarchived and retain archive-safety verdict'],
])test(`naming instruction scenario: ${scenario}`,()=>{
 const row=reference.split('\n').find(line=>line.startsWith(`| ${scenario} |`));assert.ok(row?.includes(result),result);
});
