# Prune gated Cursor probe worktrees (#287)

- `/vilya-prune` treats `.cursor/worktrees/<repo>/` rows as probe candidates when the
  folder matches `*-probe-*` / `bon-probe-*` / `model-switch-probe-*` **or** the branch is
  `probe/*` — same closed-out + clean + not-cwd gates as normal rows.
- Dry-run verdict `eligible (probe)`; `--apply` removes them. Arbitrary BoN / Parallel
  pools stay skipped. Setup prune note + orch prune cards match; testable helper
  `isCursorProbeCandidate`.
