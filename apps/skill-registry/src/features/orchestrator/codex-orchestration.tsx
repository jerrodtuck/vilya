import { PromptList } from "../../shared/ui/prompt-list";
import { CODEX_PROMPTS } from "./codex-prompts";

export function CodexOrchestration() {
  return <section id="codex-dispatch-path" data-host="codex">
    <h2>Codex desktop: plan → isolate → implement → verify</h2>
    <p>The orch owns planning. The board preserves the plan, amendments and results. Workers implement in verified isolated checkouts; the operator owns decisions and merging.</p>
    <p><a href="/setup?host=codex">Setup and invocation</a>{" · "}<a href="/architect?host=codex">Architect entry</a>{" · "}<a href="/differences?host=codex">Capabilities and evidence</a>{" · "}<a href="/skills">Skill applicability</a></p>
    <p className="note">These cards are a menu. Paste the entry for the intended role and fill its placeholders; worker authorization belongs in each worker brief. Codex CLI and a new unattended backend are deferred. Runtime acceptance remains tracked in <a href="https://github.com/jerrodtuck/vilya/issues/329">#329</a>.</p>
    <p>For this operator, #347 routes normal planning to Astra/high, hard planning to justified Astra/xhigh, settled implementation to Sol/medium, enumerated mechanical operations with objective verification to Luna/low, separate independent review to Sol/high, and consequential design/security review to Astra/high or justified xhigh. Route by uncertainty and consequence; small behavior changes do not qualify for Luna.</p>
    <p>At the second consecutive unsuccessful repair of the same unresolved defect, stop before a third correction and return the stable ledger and current state to orch planning. Reruns, renames and resumes do not reset counts; earlier hard stops still apply. Every copied entry below loads the full bundled contract. Actual usage may be unavailable; no savings or runtime routing result is claimed.</p>
    {CODEX_PROMPTS.map(group => <section className="panel" key={group.node} style={{ marginTop: 16 }}><h3>{group.group}</h3><PromptList group={group} /></section>)}
  </section>;
}
