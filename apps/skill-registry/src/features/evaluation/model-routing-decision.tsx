import Link from 'next/link';
import styles from './evaluation.module.css';
import evidence from './model-routing-evidence.json';
const firstProbe=evidence.localProbe.attempts[0]!;
const secondProbe=evidence.localProbe.attempts[1]!;

export function ModelRoutingDecision() {
  return <section className={styles.evaluation}>
    <h1>Model routing decision</h1>
    <p className={styles.notice}><b>Use GPT-6.1 Sol as the default Vilya workhorse.</b> Use medium effort for planning, implementation and repair. Use high effort for consequential review. Escalate to GPT-6 Astra only after Sol reports an unresolved consequential decision or the task requires a capability that Sol did not satisfy.</p>
    <div className={styles.cards}>
      <article className={styles.card}><h3>Default</h3><p><b>GPT-6.1 Sol · medium</b></p><p>Planning, implementation, repair and ordinary orchestration.</p></article>
      <article className={styles.card}><h3>Quality gate</h3><p><b>GPT-6.1 Sol · high</b></p><p>Independent crucible review and difficult, bounded decisions.</p></article>
      <article className={styles.card}><h3>Escalation</h3><p><b>GPT-6 Astra · high or higher</b></p><p>Use after a recorded Sol impasse or a capability-specific failure. Do not add it to every workflow.</p></article>
      <article className={styles.card}><h3>High-volume candidate</h3><p><b>GPT-6 Luna</b></p><p>Use only for bounded routine tasks that pass their own Vilya acceptance check. Do not use it as the general coding agent.</p></article>
    </div>
    <h2>Why this route is the default</h2>
    <p>Artificial Analysis scores GPT-6.1 Sol High at {evidence.external.solHigh.intelligence} and Astra High at {evidence.external.astraHigh.intelligence} on its Intelligence Index. Its estimated task cost is ${evidence.external.solHigh.estimatedCostPerTaskUsd.toFixed(2)} for Sol and ${evidence.external.astraHigh.estimatedCostPerTaskUsd.toFixed(2)} for Astra. Astra Xhigh reaches {evidence.external.astraXhigh.intelligence} at an estimated ${evidence.external.astraXhigh.estimatedCostPerTaskUsd.toFixed(2)} per task. The small general-quality gain does not justify an unconditional 5–7× workflow charge.</p>
    <p>Luna High is much cheaper, but its Intelligence Index score is {evidence.external.lunaHigh.intelligence} versus Sol High at {evidence.external.solHigh.intelligence}, and its Terminal-Bench 4.0 result is {evidence.external.lunaHigh.terminalBenchPercent}% versus {evidence.external.solHighTerminalBenchPercent}%. That supports a narrow high-volume lane, not the main implementation lane.</p>
    <h2>Vilya-specific check</h2>
    <p>The migration-planning probe attempted a complete Sol plan and a flow with one bounded Astra consultation. Two fresh Sol calls completed for about ${secondProbe.solObservedCostUsd.toFixed(2)} combined. Astra High then consumed the full {secondProbe.astraReasoningTokens!.toLocaleString('en-US')}-token consultation allowance as reasoning, returned no answer text, took {Math.round(secondProbe.astraElapsedMs! / 1000)} seconds and cost about ${secondProbe.astraObservedCostUsd!.toFixed(2)}. An earlier {firstProbe.astraMaxOutputTokens.toLocaleString('en-US')}-token Astra attempt also returned no answer text.</p>
    <p>The retained pilot accounting contains ${evidence.localProbe.observedCostUsd.toFixed(2)} of observed calls plus a conservative ${evidence.localProbe.unresolvedHoldUsd.toFixed(0)} hold for the earlier incomplete Astra call: <b>${evidence.localProbe.accountedExposureUsd.toFixed(2)} total accounted exposure</b>. It remains below the $25 campaign ceiling and $2 per-call ceiling. No automatic retry loop ran.</p>
    <h2>What this proves</h2>
    <p>The external screen establishes the candidate ladder. The local probe shows that mandatory Astra consultation failed twice and added latency and cost without producing a usable decision. Because Flow B and blind judgments never completed, this probe does not establish accepted-quality superiority. It changes Astra from a standing step to a conditional escalation.</p>
    <p>When a new model appears, compare it with the lowest applicable seat using current independent benchmark data. Run a small matched Vilya check only where the external evidence cannot answer skill adherence, repair rate or native transfer. Require accepted workflow evidence before claiming one route has better accepted quality.</p>
    <p className={styles.muted}>Evidence checked 2026-10-08 · <a href="https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-astra-high">Sol High vs Astra High</a> · <a href="https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-luna-high">Sol High vs Luna High</a> · <a href="https://developers.openai.com/api/docs/models/gpt-6.1-sol">OpenAI Sol pricing</a> · <a href="https://developers.openai.com/api/docs/models/gpt-6-astra">OpenAI Astra pricing</a></p>
    <p><Link href="/evaluation/policy">See the recalibration policy</Link></p>
  </section>;
}
