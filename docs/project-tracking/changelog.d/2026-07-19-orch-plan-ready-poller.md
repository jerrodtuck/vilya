# Orchestrator standing plan:ready poller

Orchestrator owns a standing `plan:ready` poller (REST + host wake, ≥120s,
gain-only) so Planner finish wakes the seat without relying on same-turn
enqueue memory. Per-enqueue board Monitor softens to reinforcement, not the
sole wake path. Twin of Planner intake (#255). Amends #203 completion-monitor
clause — ADR, canon chip-chain paragraph, planner-flow spec, and orchestrator
standing orders. (#261)
