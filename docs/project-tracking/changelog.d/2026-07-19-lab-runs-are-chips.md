# Orchestrator standing orders: lab runs are chips

Both Claude Code and Cursor orchestrator standing-order cards now share a
`LAB_RUNS_ARE_CHIPS_DOCTRINE` constant: live verification (e2e / lab probes /
rollouts) is dispatched as a chip with an isolation + evidence brief; the
orchestrator stays on dispatch → monitor → verify-the-claim. Single-command
state checks remain orchestrator-side. Post-merge docs appends ride a chip or
the next feature branch — the orchestrator never commits to master (#245).
