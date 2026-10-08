// Project only the terminal ledger and sanitized diagnostics into public facts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../..',import.meta.url));
const workspace=path.join(root,'scripts/evaluation/runtime/campaign-schema-probe-1');
const output=path.join(root,'apps/skill-registry/src/features/evaluation/schema-probe-result.json');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const ledgerBytes=fs.readFileSync(path.join(workspace,'pilot-budget.json'));
const diagnosticBytes=fs.readFileSync(path.join(workspace,'pilot-budget.json.diagnostics.jsonl'));
const {state,sha256}=JSON.parse(ledgerBytes);
const rows=diagnosticBytes.toString('utf8').trim().split(/\r?\n/).map(line=>JSON.parse(line));
const request=state.requests[0],count=state.preflights[0];
const received=rows.find(row=>row.kind==='generation'&&row.stage==='http-received');
const terminal=rows.find(row=>row.kind==='generation'&&row.stage==='schema-rejected');
const projection=terminal?.diagnosticProjection;
if(state.status!=='stopped'||state.blocked!==true||state.requests.length!==1||state.preflights.length!==1||
  request?.id!=='probe1_schema_1_generation_1'||request.status!=='unknown'||request.cost!==null||request.usage!==null||request.reservation!==40048||
  count?.status!=='complete'||count.inputTokens!==19||received?.httpStatus!==200||terminal?.billingValidated!==false||
  terminal.billingFailureCode!=='unsupported-financial-scope'||terminal.financialContractVersion!==3||projection?.version!==2||
  JSON.stringify(projection.recognizedRejectedFields)!=='["billing"]'||projection.envelopeFields?.billing!=='object'||
  projection.envelopeExtras?.count!==3||state.carry?.known!==10929||state.carry?.held!==361646||
  state.consumedSlotHistory?.length!==4||state.carry?.countCalls!==5||state.carry?.consumedTrialSlots!==4||
  sha256!==digest(JSON.stringify(state)))throw Error('Terminal schema-probe evidence did not match the public projection');
const result={schemaVersion:1,campaignId:'357-schema-probe-1',status:'complete',countInputTokens:19,generationHttpStatus:200,
  financialSchema:'unresolved',newCountCalls:1,newTrialSlots:1,newHeldMicrodollars:40048,
  knownCostMicrodollars:state.carry.known,heldMicrodollars:state.carry.held+request.reservation,
  exposureMicrodollars:state.carry.known+state.carry.held+request.reservation,
  financialContractVersion:3,diagnosticProjectionVersion:2,recognizedRejectedField:'billing',recognizedRejectedShape:'object',unclassifiedEnvelopeFields:3,
  retries:0,nativeTransferProof:false,productionRecommendation:false,
  provenance:{sourceHead:state.binding.head,ledgerSha256:digest(ledgerBytes),diagnosticsSha256:digest(diagnosticBytes),predecessorResultsSha256:'f985c0c8d4e9163c9167337b2d90fe89545ed03b086272f12ba7d0f3675ef1b9'}};
const projected=JSON.stringify(result,null,2)+'\n';
if(process.argv[2]==='--check'){
  const committed=JSON.parse(fs.readFileSync(output,'utf8'));
  if(JSON.stringify(committed)!==JSON.stringify(result))throw Error('Committed public schema-probe result differs from sanitized evidence: '+Object.keys(result).filter(key=>JSON.stringify(result[key])!==JSON.stringify(committed[key])).join(',')+'; provenance '+Object.keys(result.provenance).filter(key=>result.provenance[key]!==committed.provenance?.[key]).join(','));
}else if(process.argv[2]==='--write')fs.writeFileSync(output,projected);
else throw Error('Use --check or --write');
