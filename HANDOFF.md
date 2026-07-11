# Handoff → Claude Code

Everything to pick this up on your machine and drive it from Claude Code. A
fresh Claude Code session has no memory of the Cowork chat, so this file (plus
the kickoff prompt at the bottom) is the context bridge.

## What's in the box

- **7 skills** (`skills/`) — generalized, stack-neutral where possible, reading
  all repo-specific values from `GITHUB-PROJECTS.md`. Crucible reviews carry
  `disable-model-invocation: true` (invoke-only); `night-shift` intentionally
  does not (a scheduled task must be able to fire it).
- **skill-registry app** (`apps/skill-registry/`) — Next.js, vertical-slice
  structure, git-native versioning. Builds clean. Reads `../../skills`.
- **Reference site** (`site/`) — 4 static pages, GitHub-Pages-ready.
- **Tracking model** (`docs/project-tracking/GITHUB-PROJECTS.md`) — per-repo config template.

## Bootstrap (once)

```bash
# 1. Get it into git — this is what makes the registry's version history light up
cd vilya
git init && git add -A && git commit -m "chore: import vilya system"

# 2. Install skills to Claude Code + Cursor (pick your shell)
bash scripts/install-skills.sh          # macOS / Linux / Git Bash
pwsh scripts/install-skills.ps1         # Windows PowerShell

# 3. Run the registry
cd apps/skill-registry
npm install
npm run dev                             # http://localhost:3000
```

## Make vilya its own tracked project (so the loop runs on itself)

1. Create a GitHub repo (e.g. `jerrodtuck/vilya`) and push.
2. Create a GitHub Project (one per product) and fill the **Repo config** block
   in `docs/project-tracking/GITHUB-PROJECTS.md` (owner, project #, ids, stack =
   `nextjs`, crucible variant = `crucible-nextjs`, test command =
   `npm test && npm run build`, area labels).
3. Add the two autonomy labels: `auto:ready`, `needs:decision`.
4. From here, `/start-feature` etc. work on this repo like any other.

## Open roadmap (good first slices)

- **Dedupe the store** — the registry now reads `skills/` via `SKILLS_DIR`; make
  sure nothing re-bundles a copy. (A tidy first `crucible-nextjs` exercise.)
- **Version diff view** — compare two commits of a skill side by side.
- **Publish/sync action** — a UI button that runs `install-skills` to push the
  canonical files to both tools.
- **Project-specific variants** — let a repo override a skill.
- **night-shift auth** — wire the scheduled runner (cloud+token or a GitHub
  Action) so overnight runs actually fire.
- **Fold the site in** — serve `site/` pages as app routes, or deploy separately.

## Kickoff prompt (paste into a fresh Claude Code session at the repo root)

> I'm continuing a project called **vilya** — a VSA + SOLID skill
> orchestration system for my .NET/Blazor and Next.js work, used across Claude
> Code and Cursor. Read `HANDOFF.md` and `README.md`, then: (1) confirm the repo
> is git-initialized with a first commit; (2) run `scripts/install-skills` for my
> platform; (3) help me set up this repo as its own tracked project per
> `docs/project-tracking/GITHUB-PROJECTS.md`, including the GitHub Project, labels
> (`auto:ready`, `needs:decision`), and filling the config block; (4) then let's
> pick the first slice from the roadmap — I'm leaning toward the version-diff
> view. Hold the `crucible-nextjs` bar as we go.
