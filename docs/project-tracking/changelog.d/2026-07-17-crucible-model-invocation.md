### Changed

- **Crucible skills are now model-invocable** — dropped
  `disable-model-invocation: true` from the frontmatter of `crucible-nextjs`
  and `crucible-blazor` (source `skills/` plus the sync-regenerated served
  copies under `apps/skill-registry/content/skills/`). The `/chip` flow
  requires chips to run the crucible gate, but the flag blocked Skill-tool
  invocation, forcing every chip into a read-the-file workaround; the flag
  arrived in the initial bulk import with no recorded rationale. Chips can now
  invoke the gate as a normal skill once the operator re-runs
  `scripts/install-skills.ps1`. (#91)
