import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const resource='vl-orch-codex/references/seat-entry.md';
test('applicable seat entries and both worker briefs require the complete reminder contract',()=>{
 for(const slug of ['vl-orch-codex','vl-arch','vl-orch-cursor','vl-orch-claude','vl-plan','vl-cursor-handoff','vl-handoff'])assert.ok(read('skills/'+slug+'/SKILL.md').includes(resource),slug);
 const chip=read('skills/vl-chip/SKILL.md');
 for(const section of ['### Codex self-contained worker brief','## 2. The self-contained brief'])assert.ok(chip.split(section)[1].split('## 2a.')[0].includes(resource),section);
 assert.equal(read('skills/'+resource),read('apps/skill-registry/content/skills/'+resource));
});
test('host examples preserve manual setup differences and unknown architect preferences',()=>{
 const body=read('skills/'+resource);
 for(const text of ['$vl-orch-codex','$vl-arch','GPT-6.1 Sol / Medium','GPT-6.1 Sol / High','/vl-orch-cursor',"conversation's model dropdown",'/vl-orch-claude','.claude/settings.local.json','.worktreeinclude','claude --model fable','/vl-cursor-handoff','/vl-start-feature','approved architect model is unknown','Name reasoning/effort only when the host supports it'])assert.ok(body.includes(text),text);
 for(const text of ['Do not repeat it per turn','explicit reseating','scoped explicit operator override wins','exact active/resumed worker pin','never change the parent chat','Do not claim to have checked or changed a UI','resolve only that missing choice','No new confirmation gate'])assert.ok(body.includes(text),text);
});
test('helper/router fixed output sources remain intact',()=>{
 for(const slug of ['vl-ask','vl-present','vl-adhd'])assert.equal(read('skills/'+slug+'/SKILL.md'),execFileSync('git',['-C',root,'show','24f7f9be6f0e977a795d7e5243ae6d5743f5b361:skills/'+slug+'/SKILL.md'],{encoding:'utf8'}).replaceAll('\r\n','\n'));
});
