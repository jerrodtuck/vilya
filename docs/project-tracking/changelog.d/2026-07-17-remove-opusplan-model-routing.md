# Remove opusplan, document per-IDE model routing

Drop `opusplan` as the recommended plan→execute mechanism — directly tested
2026-07-17 and it did not reliably drive the split; the docs now say so
plainly. The verified story replaces it everywhere: the chip flow already is
the split (orchestrator plans on its `/model` pick, chips inherit `model`
from the `.claude/settings.local.json` copied in via `.worktreeinclude`).
Setup page rewritten around the `{ "model": "claude-sonnet-5" }` file plus a
Claude-Code-only callout; /differences gets a corrected routing row and a new
"Where the model choice lives" row (Cursor side per the Cloud Agents API:
per-dispatch `model.id`, account-level defaults, no repo-file model config);
GITHUB-PROJECTS.md intro (docs + served template) points models per tool.
