# Docs: chip lifecycle setup + Flows prompt audit

Three surfaces caught up with the diagnosed chip lifecycle (#99, #104): the Setup
page gained a "Background sessions (chips) — one-time setup" section covering the
`mcp__ccd_session_mgmt__send_message` allow rule (user-level recommended; without
it unattended chips silently cannot report), the "Auto-archive on PR close"
preference (fires at PR close, so pre-merge smoke is unaffected), and the periodic
prune cadence. The Flows orchestrator prompt dropped the stale "ping is
unreliable / poll-only" doctrine for report-primary with polling as the
verification backup, and its chip briefs now carry the dispatching session id,
the completion-report instruction, and the no-spawn_task rule. The prune skill
carries a cadence note: with auto-archive on, the rhythm is a periodic `--apply`
after a merge batch, not per-merge ceremony.
