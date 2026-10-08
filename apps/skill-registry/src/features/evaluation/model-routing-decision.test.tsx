import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it} from 'vitest';
import {ModelRoutingDecision} from './model-routing-decision';

describe('model routing decision',()=>{
  it('publishes the evidence-led route and bounded accounting',()=>{
    const html=renderToStaticMarkup(<ModelRoutingDecision/>);
    for(const fact of ['Use GPT-6.1 Sol as the default Vilya workhorse','GPT-6.1 Sol · medium','GPT-6.1 Sol · high','GPT-6 Astra · high or higher','$2.43 total accounted exposure','conditional escalation','Sol High vs Astra High'])expect(html).toContain(fact);
  });
});
