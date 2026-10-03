import { PromptList } from "../../shared/ui/prompt-list";
import { CODEX_PROMPTS } from "./codex-prompts";

export function CodexOrchestration() {
  return <section id="codex-dispatch-path" data-host="codex">
    <h2>Codex desktop: plan → isolate → implement → verify</h2>
    <p>The orch owns planning. The board preserves the plan, amendments and results. Workers implement in verified isolated checkouts; the operator owns decisions and merging.</p>
    <p><a href="/setup?host=codex">Setup and invocation</a>{" · "}<a href="/architect?host=codex">Architect entry</a>{" · "}<a href="/differences?host=codex">Capabilities and evidence</a>{" · "}<a href="/skills">Skill applicability</a></p>
    <p className="note">These cards are a menu. Paste the entry for the intended role and fill its placeholders; worker authorization belongs in each worker brief. Codex CLI and a new unattended backend are deferred. Runtime acceptance remains tracked in <a href="https://github.com/jerrodtuck/vilya/issues/329">#329</a>.</p>
    {CODEX_PROMPTS.map(group => <section className="panel" key={group.node} style={{ marginTop: 16 }}><h3>{group.group}</h3><PromptList group={group} /></section>)}
  </section>;
}
