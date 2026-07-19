Autonomy labels become `needs:plan` · `plan:ready` · `night-shift:ready` ·
`needs:decision`; `auto:ready` is retired (rename path documented). Chip chain
gains the optional Planner enqueue → `plan:ready` step; night-shift eligibility
requires `night-shift:ready` ∧ `plan:ready`. Model pointer: Planner = Fable;
orchestrator + chips = Sonnet via `settings.local.json`. `sync-labels` scripts
updated. (#205, Refs #203)
