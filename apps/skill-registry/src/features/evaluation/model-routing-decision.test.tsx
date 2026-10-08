import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it} from 'vitest';
import {ModelRoutingDecision} from './model-routing-decision';
import evidence from './model-routing-evidence.json';

describe('model routing decision',()=>{
  it('publishes the evidence-led route and bounded accounting',()=>{
    const html=renderToStaticMarkup(<ModelRoutingDecision/>);
    const exposure='$'+evidence.localProbe.accountedExposureUsd.toFixed(2)+' total accounted exposure';
    for(const fact of ['Use GPT-6.1 Sol as the default Vilya workhorse','GPT-6.1 Sol · medium','GPT-6.1 Sol · high','GPT-6 Astra · high or higher',exposure,'does not establish accepted-quality superiority','Sol High vs Astra High'])expect(html).toContain(fact);
    expect(evidence.localProbe.acceptedComparisonEstablished).toBe(false);
  });
});
