### Changed

- **/prune `--apply`** — implies scoped kill of lock-holder processes on
  **eligible** rows only (no second operator ask). Dry-run previews
  `would kill PID … for <path>`; never kills. Orchestrator prune/MERGE
  prompt cards, `/merge-pr` handoff, and Setup prune note match. (#227)
