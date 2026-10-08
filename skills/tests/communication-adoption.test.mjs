import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const atBase=p=>execFileSync('git',['-C',root,'show','a015898e80898985d6e08a0938baaa536a6f9bf2:'+p],{encoding:'utf8'}).replaceAll('\r\n','\n');
const catalog=fs.readdirSync(path.join(root,'skills')).filter(slug=>fs.existsSync(path.join(root,'skills',slug,'SKILL.md'))).sort();
const adopters=catalog.filter(slug=>!['vl-adhd','vl-present'].includes(slug));
test('every shipped skill accounts for full shared contracts without changing their sources',()=>{
 assert.equal(adopters.length,22);
 for(const slug of adopters){const text=read('skills/'+slug+'/SKILL.md');assert.ok(text.search(/^# .+$/m)<text.indexOf('## Shared communication'),slug+' heading order');const adoption=text.split('## Shared communication')[1].split('\n## ')[0];for(const contract of ['../vl-adhd/SKILL.md','../vl-present/SKILL.md'])assert.ok(adoption.includes(contract),slug+contract);for(const phrase of ['Read and apply the full','all authored prose','permissions','stop/verification gates','Identify an unknown host'])assert.ok(adoption.includes(phrase),slug+phrase);}
 for(const slug of ['vl-adhd','vl-present'])assert.equal(read('skills/'+slug+'/SKILL.md'),atBase('skills/'+slug+'/SKILL.md'));
});
test('both complete worker brief paths load contracts and retain their operational gates',()=>{
 const chip=read('skills/vl-chip/SKILL.md');
 for(const body of [chip.split('### Codex self-contained worker brief')[1].split('After interruption')[0],chip.split('## 2. The self-contained brief')[1].split('## 2a.')[0]]){assert.ok(body.includes('full vl-adhd and vl-present'));for(const fact of ['OPEN','original-start','verif','issue','fork'])assert.ok(body.toLowerCase().includes(fact.toLowerCase()));}
 const ask=read('skills/vl-ask/SKILL.md');assert.equal(ask.split('## Answer format')[1].split('## Honesty bar')[0],atBase('skills/vl-ask/SKILL.md').split('## Answer format')[1].split('## Honesty bar')[0]);assert.ok(ask.includes('Do not add a visual, heading or extra line'));
});
test('communication edits preserve coordination while the authorized routing resource stays explicit',()=>{
 const routing=read('skills/vl-orch-codex/references/model-routing.md');
 for(const fact of ['Issue #357 revised the planning route','| Normal planning | latest supported Sol | medium |','recorded Sol impasse or capability failure','screen current independent benchmark'])assert.ok(routing.includes(fact),fact);
 assert.doesNotMatch(routing,/\| Normal planning \| latest supported Astra \| high \|/);
 for(const slug of adopters){const body=read('skills/'+slug+'/SKILL.md');assert.doesNotMatch(body,/operator-chat voice|Operator-facing chat.*follows|in plain chat(?: text)? before|stay[s]? long-form/);}
});
test('ADR insertion preserves the full preamble and every historical byte',()=>{
 const base=atBase('docs/DECISIONS.md'),current=read('docs/DECISIONS.md');const boundary=base.search(/^## \d{4}-\d{2}-\d{2} — /m);assert.ok(boundary>base.indexOf('## YYYY-MM-DD'));
 const entry=current.slice(boundary).split(/^## \d{4}-\d{2}-\d{2} — /m)[1];assert.ok(entry.startsWith('Shared clear writing and automatic presentation (#341)'));
 const oldStart=current.indexOf(base.slice(boundary));assert.ok(oldStart>boundary);assert.equal(current.slice(0,boundary)+current.slice(oldStart),base);
 for(const fact of ['strict ASD-STE100','restrictive vocabulary','controlled dictionary','design intent','untested at decision time','5974655990','separate from design intent'])assert.ok(current.slice(boundary,oldStart).toLowerCase().includes(fact.toLowerCase()));
});
test('only remaining coverage adoption statuses change while merged sibling rows stay exact',()=>{
 const base=atBase('docs/design/codex-skill-coverage.md'),current=read('docs/design/codex-skill-coverage.md');for(const slug of ['vl-adhd','vl-present'])assert.equal(current.split('\n').find(row=>row.startsWith('| ['+slug+']')),base.split('\n').find(row=>row.startsWith('| ['+slug+']')));
 assert.equal(current.replaceAll('Reviewed; runtime pending; shared contract references','Reviewed; runtime pending'),base);
});

test('complete generated folders preserve every regular resource byte and companion anchors',()=>{
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);assert.ok(!fs.lstatSync(full).isSymbolicLink());return entry.isDirectory()?walk(full).map(p=>entry.name+'/'+p):[entry.name];}).sort();
 for(const slug of catalog){const source=path.join(root,'skills',slug),copy=path.join(root,'apps/skill-registry/content/skills',slug);assert.deepEqual(walk(copy),walk(source));for(const file of walk(source))assert.deepEqual(fs.readFileSync(path.join(source,file)),fs.readFileSync(path.join(copy,file)),slug+'/'+file);}
 const companion=read('skills/vl-present/SKILL.md');for(const heading of ['Selection','Capabilities','Clarification','Evidence','Verification','Fallback','Accessibility'])assert.ok(companion.includes('## '+heading+'\n'));
});
