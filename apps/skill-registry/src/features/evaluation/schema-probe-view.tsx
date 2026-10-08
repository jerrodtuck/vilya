import result from './schema-probe-result.json';
import styles from './evaluation.module.css';

const dollars=(value:number)=>`$${(value/1000000).toFixed(6)}`;

export function SchemaProbeView(){
  return <section className={styles.evaluation} aria-labelledby="schema-probe-title">
    <h2 id="schema-probe-title">Terminal financial schema probe</h2>
    <p role="status">The one-shot probe completed. The count returned {result.countInputTokens} input tokens, and generation returned HTTP {result.generationHttpStatus}. The financial schema remains unresolved, so the generation cost and billed usage are unknown.</p>
    <p>One trial slot and one count call were consumed. The new {dollars(result.newHeldMicrodollars)} reservation remains held; no retry ran.</p>
    <p>Cumulative accounting: {dollars(result.knownCostMicrodollars)} known API cost, {dollars(result.heldMicrodollars)} held reservations, {dollars(result.exposureMicrodollars)} accounted exposure.</p>
    <p>Financial contract {result.financialContractVersion} and diagnostic projection {result.diagnosticProjectionVersion} observed a <code>billing</code> object and {result.unclassifiedEnvelopeFields} unclassified envelope fields. This diagnostic observation does not reconcile the charge.</p>
    <p>No production recommendation or native transfer proof is established.</p>
    <p><a href="/evaluation/schema-probe.json" download>Download sanitized probe result</a></p>
    <details><summary>Evidence digests</summary><p className={styles.codes}>Probe source {result.provenance.sourceHead}<br/>Ledger SHA-256 {result.provenance.ledgerSha256}<br/>Diagnostics SHA-256 {result.provenance.diagnosticsSha256}<br/>Prior public results SHA-256 {result.provenance.predecessorResultsSha256}</p></details>
  </section>;
}
