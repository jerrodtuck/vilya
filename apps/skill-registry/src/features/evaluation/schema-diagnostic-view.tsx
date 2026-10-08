import result from './schema-diagnostic-result.json';
import styles from './evaluation.module.css';

const dollars=(value:number)=>`$${(value/1000000).toFixed(6)}`;

export function SchemaDiagnosticView(){
  const usage=result.observedUsage;
  return <section className={styles.evaluation} aria-labelledby="schema-diagnostic-title">
    <h2 id="schema-diagnostic-title">Terminal financial schema diagnostic</h2>
    <p role="status">The diag1 response completed. Its financial scope remains unresolved, so billed usage and generation cost are unknown. The billing payer was <code>{result.billingPayer}</code>.</p>
    <p>Observed response usage: {usage.inputTokens} input, {usage.outputTokens} output, {usage.totalTokens} total tokens; {usage.cachedInputTokens} cached input, {usage.cacheWriteInputTokens} cache write, and {usage.reasoningOutputTokens} reasoning output. These are observed counters, not validated billed usage.</p>
    <p>One count call and one trial slot were consumed, bringing the cumulative totals to {result.cumulativeCountCalls} count calls and {result.cumulativeTrialSlots} trial slots. The new {dollars(result.newHeldMicrodollars)} reservation remains held; no retry ran.</p>
    <p>Cumulative accounting: {dollars(result.knownCostMicrodollars)} known API cost, {dollars(result.heldMicrodollars)} held reservations, {dollars(result.exposureMicrodollars)} accounted exposure.</p>
    <p>Public candidate hash matches resolved the envelope field shapes as <code>frequency_penalty</code>: number, <code>presence_penalty</code>: number, and <code>tool_usage</code>: object. The financial scope of <code>tool_usage</code> remains unresolved; these matches do not reconcile the charge.</p>
    <p>No production recommendation or native transfer proof is established.</p>
    <p><a href="/evaluation/schema-diagnostic.json" download>Download sanitized diagnostic result</a></p>
  </section>;
}
