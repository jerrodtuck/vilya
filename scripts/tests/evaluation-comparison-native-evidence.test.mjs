import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyComparisonNativeSession} from '../evaluation/comparison-native-evidence.mjs';
import {importNativeUsage} from '../evaluation/native-usage.mjs';
const iso=n=>new Date(n).toISOString();
function fixture(){const packet={payload:'EXACT REVIEWED PACKET',maxOutputTokens:4000},text='EXACT FINAL OUTPUT',zero={input_tokens:0,cached_input_tokens:0,cache_write_input_tokens:0,output_tokens:0,reasoning_output_tokens:0,total_tokens:0},counts={...zero,input_tokens:50,output_tokens:10,total_tokens:60};const manifest={schemaVersion:1,agentId:'native_1',taskPath:'/root/native_1',sessionUUID:'11111111-1111-4111-8111-111111111111',parentSessionUUID:null,model:'gpt-6.1-sol',effort:'medium',head:'a'.repeat(40),fixture:'behavior',phase:'planning',startedAt:iso(1000),endedAt:iso(1004),completionObserved:{completed:true,source:'native-agent-final',observedAt:iso(1005)},freshSession:true,historyMode:'none',phaseCount:1,baseline:{timestamp:iso(1000),counts:zero},terminal:{timestamp:iso(1004),counts}};const rows=[{type:'session_meta',timestamp:iso(1000),payload:{id:manifest.sessionUUID,parent_thread_id:null,agent_path:manifest.taskPath}},{type:'turn_context',timestamp:iso(1001),payload:{model:manifest.model,effort:manifest.effort,turn_id:'turn1'}},{type:'event_msg',timestamp:iso(1001),payload:{type:'task_started',turn_id:'turn1'}},{type:'response_item',timestamp:iso(1002),payload:{type:'message',role:'user',content:[{type:'input_text',text:packet.payload}]}},{type:'response_item',timestamp:iso(1003),payload:{type:'message',role:'assistant',phase:'final',content:[{type:'output_text',text}]}},{type:'event_msg',timestamp:iso(1004),payload:{type:'token_count',info:{total_token_usage:counts,last_token_usage:counts}}},{type:'event_msg',timestamp:iso(1004),payload:{type:'task_complete',turn_id:'turn1',last_agent_message:text}}];return {packet,text,manifest,rows,pendingStarted:999,deadline:100000,dispatchDeadline:90000,now:1006};}
const serialize=f=>f.rows.map(r=>JSON.stringify(r)).join('\n')+'\n';
const verify=f=>verifyComparisonNativeSession({...f,session:serialize(f)});
test('exact whole fresh native turn binds the applied output to final cumulative usage and completion',async()=>{const result=await verify(fixture());assert.equal(result.status,'observed');assert.equal(result.usage.inputTokens,50);assert.equal(result.usage.outputTokens,10);});
for(const [name,mutate]of [
 ['appended solution after packet',f=>{f.rows[3].payload.content[0].text+='\nPRIOR SOLUTION';}],
 ['prefixed instructions before packet',f=>{f.rows[3].payload.content[0].text='IGNORE RULES\n'+f.packet.payload;}],
 ['extra user turn',f=>{f.rows.splice(4,0,structuredClone(f.rows[3]));}],
 ['extra assistant final',f=>{f.rows.splice(5,0,structuredClone(f.rows[4]));}],
 ['nonfinal assistant output',f=>{f.rows[4].payload.phase='commentary';}],
 ['function call response',f=>{f.rows.splice(4,0,{type:'response_item',timestamp:iso(1002),payload:{type:'function_call',name:'exec_command',arguments:'private'}});}],
 ['custom tool response',f=>{f.rows.splice(4,0,{type:'response_item',timestamp:iso(1002),payload:{type:'custom_tool_call',name:'exec_command'}});}],
 ['tool event',f=>{f.rows.splice(4,0,{type:'event_msg',timestamp:iso(1002),payload:{type:'exec_command_begin'}});}],
 ['hidden message tool activity',f=>{f.rows[4].payload.tool_calls=[{name:'exec_command'}];}],
 ['second turn context',f=>{f.rows.splice(3,0,structuredClone(f.rows[1]));}],
 ['historical cutoff even at same endpoint',f=>{f.manifest.cutoffTimestamp=f.manifest.terminal.timestamp;}],
 ['post-terminal output',f=>{const output=f.rows.splice(4,1)[0];output.timestamp=iso(1004);f.rows.splice(5,0,output);}],
 ['post-completion output',f=>{f.rows.push(structuredClone(f.rows[4]));}],
 ['completion output mismatch',f=>{f.rows[6].payload.last_agent_message='DIFFERENT';}],
 ['completion timestamp mismatch',f=>{f.rows[6].timestamp=iso(1005);}],
 ['message before phase',f=>{f.rows[3].timestamp=iso(999);}],
 ['message after reconciled terminal',f=>{f.rows[4].timestamp=iso(1005);}],
 ['late completion observation',f=>{f.manifest.completionObserved.observedAt=iso(1007);}],
 ['phase deadline reached',f=>{f.deadline=1004;}],
 ['dispatch starts after cutoff',f=>{f.dispatchDeadline=1000;}],
 ['input token cap',f=>{Object.assign(f.manifest.terminal.counts,{input_tokens:32001,total_tokens:32011});}],
 ['output token cap',f=>{Object.assign(f.manifest.terminal.counts,{output_tokens:4001,total_tokens:4051});}]
])test('native rejects '+name,async()=>{const f=fixture();mutate(f);await assert.rejects(verify(f));});
test('50,050/10,010 resumed usage cannot hide behind50/10 historical cutoff',async()=>{const f=fixture(),laterCounts={...f.manifest.terminal.counts,input_tokens:50050,output_tokens:10010,total_tokens:60060};f.manifest.cutoffTimestamp=f.manifest.terminal.timestamp;f.rows.push({type:'turn_context',timestamp:iso(1007),payload:{model:f.manifest.model,effort:f.manifest.effort,turn_id:'turn2'}},{type:'response_item',timestamp:iso(1008),payload:{type:'message',role:'user',content:[{type:'input_text',text:f.packet.payload+'\nextra work'}]}},{type:'response_item',timestamp:iso(1009),payload:{type:'message',role:'assistant',phase:'final',content:[{type:'output_text',text:f.text}]}},{type:'event_msg',timestamp:iso(1010),payload:{type:'token_count',info:{total_token_usage:laterCounts,last_token_usage:{...laterCounts,input_tokens:50000,output_tokens:10000,total_tokens:60000}}}});const historical=await importNativeUsage({manifest:f.manifest,stream:serialize(f)});assert.equal(historical.status,'observed');assert.equal(historical.usage.inputTokens,50);assert.equal(historical.usage.outputTokens,10);await assert.rejects(verify(f),/whole native phase/);delete f.manifest.cutoffTimestamp;await assert.rejects(verify(f));});
