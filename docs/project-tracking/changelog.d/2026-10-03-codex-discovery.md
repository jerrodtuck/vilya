# Codex skill discovery and applicability (#331)

- Add opt-in Codex installer targets at ~/.agents/skills while preserving existing defaults, Cursor flags and custom targets. Preserve unrelated entries and reject source/target overlap during link migration.
- Derive registry and detail-page Codex applicability, prerequisites and invocation from canonical skill metadata. Incomplete or unsupported metadata never receives a runnable Codex command.
- Register the Codex orchestrator as a standing seat without changing unattended eligibility; preserve supporting skill resources in deployment bundles.
- Add disposable installer, metadata, resource-boundary and rendered-detail tests. Canonical skill metadata is supplied by #330; real Codex discovery and the complete desktop cycle remain #329 integration gates.
