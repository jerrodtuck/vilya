import Link from 'next/link';
import styles from './evaluation.module.css';

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
    <h2>Why this route wins</h2>
    <p>Artificial Analysis scores GPT-6.1 Sol High at 50 and Astra High at 51 on its Intelligence Index. Its estimated task cost is $0.32 for Sol and $1.73 for Astra. Astra Xhigh reaches 52 at an estimated $2.31 per task. The small general-quality gain does not justify an unconditional 5–7× workflow charge.</p>
    <p>Luna High is much cheaper, but its Intelligence Index score is 33 versus Sol High at 50, and its Terminal-Bench 4.0 result is 5% versus 52%. That supports a narrow high-volume lane, not the main implementation lane.</p>
    <h2>Vilya-specific check</h2>
    <p>The matched migration-planning probe compared a complete Sol plan with a flow that added one bounded Astra consultation. Two fresh Sol plans completed for about $0.03 combined. Astra High then consumed the full 3,500-token consultation allowance as reasoning, returned no answer text, took 100 seconds and cost about $0.32. An earlier 1,200-token Astra attempt also returned no answer text.</p>
    <p>The retained pilot accounting contains $0.43 of observed calls plus a conservative $2 hold for the earlier incomplete Astra call: <b>$2.43 total accounted exposure</b>. It remains below the $25 campaign ceiling and $2 per-call ceiling. No retry loop ran.</p>
    <h2>What this proves</h2>
    <p>The external screen establishes the candidate ladder. The local probe shows that mandatory Astra consultation made this Vilya flow slower and less reliable without producing a usable decision. It does not prove Astra is never useful. It changes Astra from a standing step to a conditional escalation.</p>
    <p>When a new model appears, compare it with the lowest applicable seat using current independent benchmark data. Run a small matched Vilya check only where the external evidence cannot answer skill adherence, repair rate or native transfer. Promote on accepted workflow cost, not model reputation.</p>
    <p className={styles.muted}>Evidence checked 2026-10-08 · <a href="https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-astra-high">Sol High vs Astra High</a> · <a href="https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-luna-high">Sol High vs Luna High</a> · <a href="https://developers.openai.com/api/docs/models/gpt-6.1-sol">OpenAI Sol pricing</a> · <a href="https://developers.openai.com/api/docs/models/gpt-6-astra">OpenAI Astra pricing</a></p>
    <p><Link href="/evaluation/policy">See the recalibration policy</Link></p>
  </section>;
}
