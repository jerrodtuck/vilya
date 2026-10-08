// Immutable prospective pilot configuration. No publisher or live entrypoint.
import crypto from 'node:crypto';
import {SCHEMA_DIAGNOSTIC_ORIGIN,SCHEMA_DIAGNOSTIC_POLICY} from './schema-diagnostic-campaign.mjs';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const prior='scripts/evaluation/runtime/campaign-schema-diagnostic-1/';
export const COMPARISON_ORIGIN=freeze({...SCHEMA_DIAGNOSTIC_ORIGIN,
 [prior+'pilot-budget.json']:'b1d83b805f1628deaa58034f9495ff3966cb288bff0893e1bd5b7a478e72aec3',
 [prior+'pilot-budget.json.diagnostics.jsonl']:'87a87f4ee6354c14d7b82c3a1715f126f0f3712daf50278fac0377c478822d23',
 [prior+'execution.attempt.json']:'9ea1d2b6434ab69eb20a1bad66b436c8a7d504efa0b7112d03c07ca0eadbe0db',
 'scripts/evaluation/runtime/schema-diagnostic-357-1.claim.json':'7cc2c7fa0ecad8f7cc06ba81efc44e4d9e8325acbdb803a58fc0f998a8665d15',
 'scripts/evaluation/runtime/schema-diagnostic-357-1.authorization.json':'61df2c405673ac8e9569d9f009c910c04f2fd9da8f9ddffd09eef0c8b3541cd0',
 'apps/skill-registry/src/features/evaluation/schema-diagnostic-result.json':'24a7834738382a33fe2bf70e82a27f3cf429dbf0ec9eb8b23fde636db2bf17ec'
});
const schedule=[['api','behavior','A'],['api','behavior','B'],['api','instruction','B'],['api','instruction','A'],['api','migration','A'],['api','migration','B'],['native','behavior','B'],['native','behavior','A'],['native','instruction','A'],['native','instruction','B'],['native','migration','B'],['native','migration','A']];
export const COMPARISON_POLICY=freeze({
 schemaVersion:1,scope:'current-357-pilot-only',campaignId:'357-comparison-1',namespace:'compare1_',sourceBase:'fbfc25ec6502ee3f7a9007bd7f67bf5847df930e',
 priorReviewedHead:'40c55a0cf17e5f7d66848594a0cd99433275ba6b',priorStateChecksum:'29f2083837add086481016c83d2f57a610ca18a89c0e33bf606a9d53d871bc65',priorPolicyDigest:'ca17fe7685d88be3f94778af32ff55add51747eb526de56f7a3b9d2136d17a8b',priorModuleManifestDigest:'9319b9b52d3376f03148a941d83d8d14607231c8472267099c36f7f42e1a11ee',schemaSource:structuredClone(SCHEMA_DIAGNOSTIC_POLICY.schemaSource),
 workspace:'scripts/evaluation/runtime/campaign-comparison-1',claim:'scripts/evaluation/runtime/comparison-357-1.claim.json',authorization:'scripts/evaluation/runtime/comparison-357-1.authorization.json',
 financialContractVersion:4,diagnosticProjectionVersion:4,carry:{known:10929,held:401897,exposure:412826,countCalls:7,consumedTrialSlots:6},
 consumedSlotHistory:[...structuredClone(SCHEMA_DIAGNOSTIC_POLICY.consumedSlotHistory),{segment:'357-schema-diagnostic-1',trial:'diag1_schema_1',slots:1}],
 limits:{totalMicrodollars:25000000,trialMicrodollars:2000000,totalMinutes:180,dispatchMinutes:174,finalMinutes:6,trialMinutes:14,phaseMinutes:{planning:3,implementation:8,review:3},maximumNewTrials:12,cumulativeTrialSlots:18,maximumApiCountCalls:18,maximumNewPaidGenerations:18,paidOverheadMicrodollars:0,reservedAcrossTrialsMicrodollars:24000000,unallocatedHeadroomMicrodollars:587174},
 trials:schedule.map(([environment,task,arm],index)=>({id:'compare1_'+environment+'_'+task+'_'+arm,environment,task,arm,seedPair:environment==='api'?1:2,order:index+1,planning:{model:arm==='A'?'gpt-6.1-sol':'gpt-6-astra',effort:arm==='A'?'medium':'high'},implementation:{model:'gpt-6.1-sol',effort:'medium'},review:{model:'gpt-6.1-sol',effort:'high'},reservationMicrodollars:2000000})),
 retries:0,replacementTrials:0,replayAllowed:false,resetAllowed:false,separateDiagnosticTrial:false,firstApiTrialConfirmsContract4:true,stopEntireCampaignOnUnknown:true,unknownRetainsFullReservation:true,nativeTransferRequiresSeparateProof:true,
 activationRequirements:{separateFixedAuthorization:true,userAuthorized:true,windowMinutes:180,newTrialSlots:12,exactCurrentReviewedHead:true,readyReviews:2,firstCountStartsClock:true,initializeStartsClock:false}
});
export function createComparisonScaffold(){return freeze({policy:structuredClone(COMPARISON_POLICY),predecessorDigests:structuredClone(COMPARISON_ORIGIN),activation:null,executionWindow:null,paidRequests:0});}
export function validateComparisonScaffold(value){if(JSON.stringify(value)!==JSON.stringify(createComparisonScaffold()))throw Error('Immutable comparison scaffold changed');return true;}
export function verifyComparisonPredecessor(bytes){if(!bytes||Object.keys(bytes).sort().join('|')!==Object.keys(COMPARISON_ORIGIN).sort().join('|'))throw Error('Exact comparison predecessor required');for(const [file,digest]of Object.entries(COMPARISON_ORIGIN))if(!Buffer.isBuffer(bytes[file])||crypto.createHash('sha256').update(bytes[file]).digest('hex')!==digest)throw Error('Frozen comparison predecessor changed');return true;}
// Product recalibration is configurable; pilot numbers are never product defaults.
export function incrementalChallengePlan({model,lowestRelevantSeat,provenUpperTiers,fixturesChanged=false,capabilityBoundary=false,tierCrossed=false,limits}){
 if(typeof model!=='string'||!model||typeof lowestRelevantSeat!=='string'||!lowestRelevantSeat||!Array.isArray(provenUpperTiers)||provenUpperTiers.some(tier=>typeof tier!=='string')||!limits||Object.keys(limits).sort().join('|')!==['budgetMicrodollars','minutes','maximumTrials'].sort().join('|')||Object.values(limits).some(value=>!Number.isSafeInteger(value)||value<=0)||[fixturesChanged,capabilityBoundary,tierCrossed].some(value=>typeof value!=='boolean'))throw Error('Explicit recalibration configuration required');
 return freeze({model,firstChallenge:lowestRelevantSeat,preserveUpperTiers:structuredClone(provenUpperTiers),broaden:fixturesChanged||capabilityBoundary||tierCrossed,broadenReasons:[...(tierCrossed?['tier-crossed']:[]),...(fixturesChanged?['fixtures-changed']:[]),...(capabilityBoundary?['capability-boundary']:[])],limits:structuredClone(limits),scope:'necessary-comparisons-only'});
}
