### Added

- **Night-shift overnight runner** — `.github/workflows/night-shift.yml` runs
  the autonomous loop on a self-hosted runner on the operator's always-on dev
  machine. **Manual-only by default** (`workflow_dispatch`); the nightly cron
  (~2–3am America/Chicago) ships commented out, ready to opt in.
  Follows `skills/night-shift/SKILL.md`: `auto:ready` gate, crucible-nextjs
  review bar, PRs only, never merges, morning report. (#23)
- Reusable template for CygNet C# repos at
  `docs/project-tracking/templates/night-shift-dotnet-cygnet.yml` — the
  self-hosted runner has live CygNet access, so overnight runs can do the live
  retests that GitHub-hosted runners never could. (#23)
