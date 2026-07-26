### Changed

- **Prune nag threshold** — `/vl-merge-pr` and the orch seats (`/vl-orch-claude`,
  `/vl-orch-cursor`) no longer push `/vl-prune` as required hygiene after every squash-merge.
  `/vl-prune`'s Cadence section sets the bar: urge `--apply` only once a dry-run would show
  **≥5 eligible worktrees/orphans** for that repo; below 5, cleanup stays optional/silent.
  Mirrored to the registry via `sync:skills`. (#316)