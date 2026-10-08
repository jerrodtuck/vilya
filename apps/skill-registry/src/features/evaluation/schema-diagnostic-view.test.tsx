import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SchemaDiagnosticView} from './schema-diagnostic-view';
import result from './schema-diagnostic-result.json';

it('publishes the terminal diagnostic without treating observed counters as billed usage',()=>{
  const html=renderToStaticMarkup(createElement(SchemaDiagnosticView));
  for(const fact of ['response completed','billed usage and generation cost are unknown','developer','17 input','7 output','24 total tokens','0 cached input','0 cache write','0 reasoning output','7 count calls','6 trial slots','$0.000203','$0.010929','$0.401897','$0.412826','frequency_penalty','presence_penalty','tool_usage','financial scope','no retry ran','No production recommendation or native transfer proof'])expect(html).toContain(fact);
  expect(result.knownCostMicrodollars+result.heldMicrodollars).toBe(result.exposureMicrodollars);
  expect(result.heldMicrodollars-401694).toBe(result.newHeldMicrodollars);
  expect(result.cumulativeCountCalls).toBe(6+result.newCountCalls);
  expect(result.cumulativeTrialSlots).toBe(5+result.newTrialSlots);
  expect(result.observedUsage.inputTokens+result.observedUsage.outputTokens).toBe(result.observedUsage.totalTokens);
  expect(result.resolvedEnvelopeFieldShapes).toEqual([
    {name:'frequency_penalty',type:'number',method:'public-candidate-hash-match'},
    {name:'presence_penalty',type:'number',method:'public-candidate-hash-match'},
    {name:'tool_usage',type:'object',method:'public-candidate-hash-match'}
  ]);
  expect(result.retries).toBe(0);
  expect(result.nativeTransferProof).toBe(false);
  expect(result.productionRecommendation).toBe(false);
  for(const forbidden of ['promptText','responseText','apiKey','privatePath','providerRequestId'])expect(JSON.stringify(result)).not.toContain(forbidden);
});
