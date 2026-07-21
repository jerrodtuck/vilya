### Fixed

- **`/vl-chip` §0 board-membership check** — before writing a brief, confirm the issue is on the
  project board (`gh issue view <n> --json projectItems`); if empty, run `gh project item-add`.
  Idempotent, single call — not a hot-path poll loop. Catches ad-hoc `gh issue create` calls that
  silently skip step 2 of `GITHUB-PROJECTS.md`'s "Creating an issue (two commands)" pattern,
  regardless of how the issue was created.
- **`vl-orch-claude` + `vl-orch-cursor` house rule** — ad-hoc issue creation (not via
  `/vl-start-feature` / `/vl-update-docs`) must use the two-command pattern, cited directly on
  both seats, not Claude-only. (#291)
