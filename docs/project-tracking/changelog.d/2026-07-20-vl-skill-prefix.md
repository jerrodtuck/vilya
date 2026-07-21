# Skill prefix hard-cut: `vilya-*` → `vl-*` (#289)

Every Dev Loop skill folder, frontmatter `name`, and slash invoke is now
`vl-<rest>` (e.g. `/vl-chip`, `/vl-orch-cursor`, `/vl-crucible-nextjs`). Front
door: `vilya-ask-vilya` → `vl-ask`. Repo name `jerrodtuck/vilya` and Dev Loop /
Vilya site brand unchanged. Skills + registry mirrors + site + tests + canon
swept; historical changelog.d may keep old names.

After merge: re-run `scripts/install-skills` and remove stale
`~/.claude/skills/vilya-*` junctions (install does not delete unmatched
entries). (#289, Refs #280)
