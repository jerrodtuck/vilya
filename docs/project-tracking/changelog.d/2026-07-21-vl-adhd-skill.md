### Added

- **`/vl-adhd` skill** — ADHD-friendly operator-chat voice (action first, numbered
  steps, no preamble essays, restate state, visible wins), adapted from
  [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT). Scope is
  operator chat only — chip briefs, kickoffs, ADRs, and PR Verification sections
  stay long-form. Operator does not slash-invoke it in normal flow; fallback is a
  one-time `/vl-adhd` if a host skipped the load.

### Changed

- **`/vl-orch-claude`, `/vl-orch-cursor`, `/vl-arch`, `/vl-plan`, `/vl-merge-pr`,
  `/vl-ask` honesty bars** — cite `/vl-adhd` as the operator-chat voice these seats
  load and apply. Mirrored to the registry via `sync:skills`. (#295)
