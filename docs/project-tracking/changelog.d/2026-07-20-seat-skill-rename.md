# Seat skill rename: orch / arch / plan (#283)

Hard-cut rename of standing seat skills:

| Old | New |
|-----|-----|
| `vilya-orchestrator` | `vilya-orch-claude` |
| `vilya-orchestrator-cursor` | `vilya-orch-cursor` |
| `vilya-architect` | `vilya-arch` |
| `vilya-planner` | `vilya-plan` |

Folder name = frontmatter `name` = slash invoke. Skills + registry mirrors + site + tests + canon swept. After merge, re-run `scripts/install-skills` so `~/.claude/skills` junctions track new folder names. Historical changelog.d rows may keep old names. (#283, Refs #280)
