### Added

- **/prune skill** — orchestrator hygiene for Cursor feature worktrees under
  `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-*`. Dry-run by default;
  `--apply` removes eligible trees + paired local branches after squash-merge.
  Documents that Cursor Archive / Claude delete do not own this path. (#59)

### Changed

- **/merge-pr** — daytime smoke is operator-owned by default (agent launches only
  when asked). Post-squash cleanup is a handoff to `/prune` from the main clone,
  not an in-place delete from inside the feature worktree. Flows MERGE/ORCH copy
  and prompts updated to match. (#59)
