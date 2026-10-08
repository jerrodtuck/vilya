import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SchemaProbeView} from './schema-probe-view';
import result from './schema-probe-result.json';

it('publishes the terminal probe without claiming reconciled billing or native transfer',()=>{
  const html=renderToStaticMarkup(createElement(SchemaProbeView));
  for(const fact of ['19 input tokens','HTTP 200','financial schema remains unresolved','$0.040048','$0.010929','$0.401694','$0.412623','contract 3','projection 2','3 unclassified envelope fields','no retry ran','No production recommendation or native transfer proof'])expect(html).toContain(fact);
  expect(result.knownCostMicrodollars+result.heldMicrodollars).toBe(result.exposureMicrodollars);
  expect(result.newCountCalls).toBe(1);
  expect(result.newTrialSlots).toBe(1);
  expect(result.retries).toBe(0);
  expect(result.nativeTransferProof).toBe(false);
  expect(result.productionRecommendation).toBe(false);
  const publicFields=JSON.stringify(result);
  for(const forbidden of ['promptText','responseText','apiKey','privatePath','providerRequestId'])expect(publicFields).not.toContain(forbidden);
});
