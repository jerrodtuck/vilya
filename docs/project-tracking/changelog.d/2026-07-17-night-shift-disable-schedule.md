### Changed

- **Night-shift `schedule:` trigger disabled** — the daily cron in
  `.github/workflows/night-shift.yml` is re-commented, leaving
  `workflow_dispatch` as the only active trigger, per the documented
  manual-only default. Run history 2026-07-14 → 2026-07-17 showed every
  scheduled run sitting queued (24h+) and being cancelled without the
  self-hosted runner picking it up. A comment in the workflow points at the
  re-enable condition: a proven green manual run first (night-shift section
  of `docs/project-tracking/GITHUB-PROJECTS.md`). (#100)
