import { PromptList } from "../../shared/ui/prompt-list";
import { CODEX_PROMPTS } from "./codex-prompts";

export function CodexOrchestration() {
  return <section id="codex-dispatch-path" data-host="codex">
    <h2>Codex desktop: plan → isolate → implement → verify</h2>
    <aside className="callout">
      <h3>Seat model: GPT-6.1 Sol · medium</h3>
      <p>Select Sol/medium in the Codex UI before invoking <code>$vl-orch-codex</code>. A skill cannot change the active chat&apos;s model or reasoning effort. The orchestrator can dispatch correctly pinned children for bounded phase work.</p>
    </aside>
    <p>The orch owns planning. The board preserves the plan, amendments and results. Workers implement in verified isolated checkouts; the operator owns decisions and merging.</p>
    <p><a href="/setup?host=codex">Setup and invocation</a>{" · "}<a href="/architect?host=codex">Architect entry</a>{" · "}<a href="/differences?host=codex">Capabilities and evidence</a>{" · "}<a href="/skills">Skill applicability</a></p>
    <p className="note">These cards are a menu. Paste the entry for the intended role and fill its placeholders; worker authorization belongs in each worker brief. Codex CLI and a new unattended backend are deferred. Runtime acceptance remains tracked in <a href="https://github.com/jerrodtuck/vilya/issues/329">#329</a>.</p>
    <p>For this operator, #357 routes normal planning, implementation and repair to Sol/medium; difficult architecture and separate independent review to Sol/high; enumerated mechanical operations with objective verification to Luna/low; and Astra/high or justified xhigh only after a recorded Sol impasse or capability failure. Route by uncertainty and consequence; small behavior changes do not qualify for Luna.</p>
    <p>Issue #356 keeps that model route fixed while reducing context overhead. Dispatch a bounded self-contained brief with exact source references instead of full conversation history. Reuse a viable worker and repair ledger for corrections. Initial review covers the full change; later repair review covers the delta plus affected boundaries and current amendments. Run required gates once per applicable head, repeating only for changed source, failure or unresolved risk. Batch independent reads, bound output and use quiet waits with backoff without ending active work.</p>
    <p>To test a context change, keep the fixture, phase models, efforts, gates and rubric constant. Compare acceptance, cached and uncached input, cache writes, output/reasoning counters, handoff rounds, repairs, elapsed time and cost per accepted change. Missing counters remain unavailable. Provider screenshots are historical evidence until their build, settings, date and metering basis are verified. A paid run still needs current authorization.</p>
    <p>At the end of a work unit choose continue here, use built-in Compact, or recommend a fresh chat, and explain briefly. Before recommending fresh chat, run <code>$vl-handoff</code> to save the complete handoff and ready-to-paste starter. It creates no chat and resets nothing.</p>
    <p>At the second consecutive unsuccessful repair of the same unresolved defect, stop before a third correction and return the stable ledger and current state to orch planning. Reruns, renames and resumes do not reset counts; earlier hard stops still apply. Every copied entry below loads the full bundled contract. Actual usage may be unavailable; no savings or runtime routing result is claimed.</p>
    {CODEX_PROMPTS.map(group => <section className="panel" key={group.node} style={{ marginTop: 16 }}><h3>{group.group}</h3><PromptList group={group} /></section>)}
  </section>;
}
