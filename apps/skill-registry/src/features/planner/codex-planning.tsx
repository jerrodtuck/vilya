export function CodexPlanning() {
  return <section className="panel" data-host="codex">
    <h2>Codex planning belongs to the orchestrator</h2>
    <p>No standing Codex Planner seat is required. The orch plans or delegates a bounded planning stage, reviews it and records kickoff + verify plan on the issue, moving needs:plan → plan:ready.</p>
    <p>The approved model policy selects the latest supported highest-capability planning family, then the balanced coding/workhorse family for implementation. Validate current models, reasoning and fork combinations; explicit operator overrides win. See the <a href="/orch?host=codex">phase preference and planning cards</a>.</p>
    <p>Preserve night-shift eligibility: plan:ready ∧ night-shift:ready. A ready plan alone does not authorize unattended execution. Existing Claude Code/Cursor paths remain below when their host is selected; a new Codex unattended backend and Codex CLI are deferred.</p>
  </section>;
}
