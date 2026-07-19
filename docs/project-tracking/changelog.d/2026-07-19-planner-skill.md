### Added

- **`/planner` skill** — standing Fable plan loop: drain `needs:plan` (or an
  operator-named issue), write kickoff + verify plan (+ forks) on the issue,
  clear `needs:plan` / set `plan:ready`. Never implements, dispatches, merges,
  or arms monitors. Registry lists it under Autonomous. (#206, Refs #203)

### Changed

- **`/start-feature` Plan phase** — chip-flow defers planning to `/planner`
  (orchestrator enqueues `needs:plan` + arms a board Monitor for `plan:ready`);
  keeps a narrow single-session plan→execute footnote for solo daytime.
  Residual `auto:ready` wording replaced with `plan:ready` ∧
  `night-shift:ready`. (#206)
