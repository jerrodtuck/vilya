Orchestrator standing orders, `/chip`, and `/night-shift` now read Planner
autonomy labels: enqueue `needs:plan` with a board Monitor for `plan:ready`,
daytime may chip without a plan when the issue is clear, and night-shift
eligibility is `night-shift:ready` ∧ `plan:ready` (retired `auto:ready`).
Minimal night-shift page label strings updated to match. (#207, Refs #203)
