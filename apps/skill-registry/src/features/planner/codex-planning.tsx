import { PromptList } from "../../shared/ui/prompt-list";
import { CODEX_PLANNER } from "./codex-prompts";

export function CodexPlanning() {
  return <section className="panel" data-host="codex">
    <h2>Separate Codex Planner: direction → plan → dispatch</h2>
    <p>The architect defines the user problem and smallest useful outcome. The separate Planner owns kickoff and verification plans; the orch consumes settled plans and dispatches isolated workers. Reuse a sufficient settled plan. Return new gaps and exhausted repairs to the Planner.</p>
    <p>Use <a href="/skills/vl-plan-codex"><code>$vl-plan-codex</code></a>; <code>$vl-plan</code> remains compatible. Install complete sibling folders, including <a href="/skills/vl-plan">vl-plan</a> and its shared role, impact and verification resources. The raw SKILL.md route is manifest-only.</p>
    <p>Select approved GPT-6.1 Sol/medium in the Planner chat. Invocation cannot change the active chat model. Read the full <code>vl-orch-codex/references/model-routing.md</code> contract and preserve scoped overrides and exact resumed pins. Difficult architecture or optional risk review uses Sol/high; Luna/low is only for enumerated mechanical work. Astra requires a recorded Sol impasse or capability failure.</p>
    <p>Name starting state, actual UI/API/CLI action and observable result. Exercise the smallest complete workflow early. Map upstream assumptions and downstream effects; include affected persistence and integration boundaries. Green isolated tests cannot prove an unexercised workflow. Pure-function changes need no invented UI smoke.</p>
    <p>The Planner checks meaning within the existing plan. Settled wording needs no routine human confirmation; genuine decisions and required approvals remain. Separate Codex review is optional for a concrete unresolved risk. Stack Crucible remains mandatory.</p>
    <p>Use needs:plan → kickoff + verify plan → plan:ready. The orch consumes the issue artifacts without replanning. Preserve night-shift eligibility: plan:ready ∧ night-shift:ready. A ready plan grants no unattended execution authority.</p>
    <p><a href="/setup?host=codex">Setup</a>{" · "}<a href="/architect?host=codex">Architect</a>{" · "}<a href="/orch?host=codex">Orch handoff and dispatch</a>{" · "}<a href="/differences?host=codex">Host differences</a></p>
    <h3>Copy the Planner entry</h3><PromptList group={CODEX_PLANNER} />
    <p>Active-turn waits do not persist. Recurring intake needs a separately authorized Codex automation; unsupported silent model-free variable cadence remains unverified. After the second consecutive unsuccessful repair, stop before a third correction and preserve the ledger. Renamed gates do not reset counts.</p>
  </section>;
}
