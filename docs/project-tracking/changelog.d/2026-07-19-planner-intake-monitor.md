# Planner intake Monitor for needs:plan wake

Standing Planner owns an intake poller (REST + host wake, ≥120s, gain-only) so
idle sessions wake on new `needs:plan` without an operator ping. Softens “never
arm monitors” to: never arm process/completion self-watches; intake required.
Orchestrator still owns the completion board Monitor (`plan:ready` / kickoff).
Amends #203 idle/monitor clause only — ADR, `/vilya-planner`, planner-flow
spec, and Planner site standing orders. (#255)
