### Changed

- **One generic night-shift workflow** — replaced the CygNet-specific template with
  `docs/project-tracking/templates/night-shift.yml`. Stack, Crucible variant, and
  Test command stay in each product’s `GITHUB-PROJECTS.md`; the YAML only needs
  `path_to_claude_code_executable`. Workflow pins Git Bash; host PATH tweaks are
  optional/unnecessary. Site + canon bring-up updated; Anduin aligned to the
  same prompt.

### Added

- **/night-shift workflow generator** — type `owner/repo` (or short name) +
  `claude.exe` path; copy or download a filled `night-shift.yml`. Template synced
  into `content/` for deploy.
