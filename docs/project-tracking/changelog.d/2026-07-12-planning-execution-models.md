# Changelog fragment — 2026-07-12 — planning-execution-models

- **GITHUB-PROJECTS.md** — removed optional Planning/Execution **Models** keys
  (picker names are tool-local and change often; skills never invoked them).
- **/start-feature** — plan → execute is planning-model then execution-model
  (operator UI); Cursor Plan mode demoted to an optional helper. Unattended
  one-model runs skip the switch stop.
- **Setup / flows** — copy and orchestrator prompts aligned; regenerate no
  longer emits a Models table; legacy Models pastes are ignored.
