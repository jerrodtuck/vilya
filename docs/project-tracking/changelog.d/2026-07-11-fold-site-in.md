### Added

- **The Dev Loop site, served by the app** — the registry app now carries the
  whole methodology site: overview at `/`, the interactive flows map at
  `/flows` (9 selectable flows, per-node detail + prompts), the setup guide at
  `/setup` (Claude Code ⇄ Cursor toggle), and the skills reference at
  `/skills` rendered live from `skills/`. (#4, #5, #6, #7, #8)
- **Orchestrator prompt library** as structured data with copy-to-clipboard —
  defined once, rendered in the library grid and each node's drawer. (#8)

### Changed

- Registry list moved from `/` to `/skills`; skill detail crumbs follow.
- The flows page's per-project setup modal was removed in favor of the real
  `/setup` page.
