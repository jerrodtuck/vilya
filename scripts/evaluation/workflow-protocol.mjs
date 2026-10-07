import {WORKFLOW_PROTOCOL_V2,expectedWorkflowProtocol} from '../../apps/skill-registry/src/features/evaluation/workflow-contract.mjs';
export {WORKFLOW_PROTOCOL_V2};
import {boundedPacket,sha256} from './context.mjs';
export class WorkflowProtocolError extends Error{constructor(code){super(code);this.name='WorkflowProtocolError';}}
const fail=code=>{throw new WorkflowProtocolError(code);};
const bytes=text=>Buffer.byteLength(text,'utf8');
const text=(value,limit,code)=>{if(typeof value!=='string'||!value.trim()||bytes(value)>limit)fail(code);return value;};
const exact=(value,keys,code)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!==keys.sort().join())fail(code);return value;};
const parse=(raw,keys,code)=>{try{return exact(JSON.parse(raw),keys,code);}catch{fail(code);}};
export function protocolDescriptor(manifest,arm){if(!['A','B'].includes(arm)||!Object.hasOwn(WORKFLOW_PROTOCOL_V2.questions,manifest.name))fail('protocol-v2-unsupported-fixture');const question=WORKFLOW_PROTOCOL_V2.questions[manifest.name];return expectedWorkflowProtocol(manifest.name,arm,manifest.seed);}

export function planningSteps(manifest,arm){return protocolDescriptor(manifest,arm).questionId?['draft-plan','consultation','synthesis']:['complete-plan'];}
const consultationEnvelope=(manifest,draft)=>JSON.stringify({role:'Answer only this one declared consequential question. No tools, implementation or recursive escalation. Return exactly {questionId,resolution:"resolved"|"unresolved",answer:string}, at most 2000 UTF-8 bytes.',...WORKFLOW_PROTOCOL_V2.questions[manifest.name],task:manifest.taskPrompt,rubric:manifest.rubric,draft});
// A JSON control character costs six serialized bytes for each UTF-8 input byte.
// Reserve that worst case so both arms admit exactly the same first outputs.
export function firstPlanCapacity(manifest){return WORKFLOW_PROTOCOL_V2.questions[manifest.name]?Math.min(5000,Math.floor((6000-bytes(consultationEnvelope(manifest,'')))/6)):5000;}
export function buildPlanningStepPacket(step,manifest,baseline,{draft,answer}={}){
 const question=WORKFLOW_PROTOCOL_V2.questions[manifest.name];
 if(['complete-plan','draft-plan'].includes(step))return boundedPacket({role:`Resolve the complete implementation contract, edge cases and verification. No tools or code. Return plain text at most ${firstPlanCapacity(manifest)} UTF-8 bytes.`,task:manifest.taskPrompt,rubric:manifest.rubric,source:baseline,...(question??{})});
 text(draft,5000,'protocol-v2-invalid-plan');if(!question)fail('protocol-v2-unsupported-step');
 if(step==='consultation'){const packet=consultationEnvelope(manifest,draft);if(bytes(packet)>6000)fail('protocol-v2-consult-packet-too-large');return packet;}
 if(step!=='synthesis')fail('protocol-v2-unsupported-step');
 const validated=validatePlanningStepOutput('consultation',JSON.stringify(answer),{manifest});
 return boundedPacket({role:'Settle the complete plan using the actual draft and validated answer. Return exactly {status:"settled"|"unresolved",plan:string,answerDigest:string}. Echo supplied answerDigest; plan at most 5000 UTF-8 bytes. Unresolved disagreement must return unresolved. No tools or code.',task:manifest.taskPrompt,rubric:manifest.rubric,source:baseline,draft,questionId:question.questionId,answer:validated.answer,answerDigest:sha256(validated.answer)});
}
export function validatePlanningStepOutput(step,raw,{manifest,answer}={}){
 if(['complete-plan','draft-plan'].includes(step)){const value=text(raw,manifest?firstPlanCapacity(manifest):5000,'protocol-v2-invalid-plan');if(step==='draft-plan'&&manifest)buildPlanningStepPacket('consultation',manifest,null,{draft:value});return value;}
 if(step==='consultation'){text(raw,2000,'protocol-v2-invalid-consultation');const value=parse(raw,['questionId','resolution','answer'],'protocol-v2-invalid-consultation');if(value.questionId!==WORKFLOW_PROTOCOL_V2.questions[manifest.name]?.questionId||!['resolved','unresolved'].includes(value.resolution))fail('protocol-v2-invalid-consultation');text(value.answer,2000,'protocol-v2-invalid-consultation');if(value.resolution!=='resolved')fail('protocol-v2-unresolved-consultation');return value;}
 if(step!=='synthesis')fail('protocol-v2-unsupported-step');const value=parse(raw,['status','plan','answerDigest'],'protocol-v2-invalid-synthesis');if(!['settled','unresolved'].includes(value.status)||typeof answer?.answer!=='string'||value.answerDigest!==sha256(answer.answer))fail('protocol-v2-invalid-synthesis');text(value.plan,5000,'protocol-v2-invalid-synthesis');if(value.status!=='settled')fail('protocol-v2-unresolved-synthesis');return value.plan;
}
export async function prepareProtocolPlan({manifest,baseline,arm,call}){
 let draft,answer,plan;
 for(const step of planningSteps(manifest,arm)){const raw=await call('planning',buildPlanningStepPacket(step,manifest,baseline,{draft,answer}),{workflowStep:step,model:step==='consultation'?'gpt-6-astra':'gpt-6.1-sol',effort:step==='consultation'?'high':'medium'});const value=validatePlanningStepOutput(step,raw,{manifest,answer});if(step==='draft-plan')draft=value;else if(step==='consultation')answer=value;else plan=value;}
 return plan;
}
