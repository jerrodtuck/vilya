# Vilya

> *The Ring of Air — mightiest of the Three. The workflow that orchestrates every project.*

Your VSA + SOLID orchestration system — skills, the registry app, the reference
site, and the tracking model, in one repo. Built for **Claude Code + Cursor**,
across **.NET/Blazor and Next.js**.

```
vilya/
├── skills/                     # canonical source of truth — the 7 SKILL.md skills
│   ├── start-feature/          # process: issue → branch → consult
│   ├── finish-feature/         # process: tests → PR → changelog
│   ├── update-docs/            # process: route work (issue vs files)
│   ├── history/                # recall: reconstruct what we tried
│   ├── crucible-blazor/        # review: strict VSA+SOLID+Blazor (manual-only)
│   ├── crucible-nextjs/        # review: same for feature-slice + server/client
│   └── night-shift/            # autonomous: overnight loop → opens PRs
├── apps/
│   └── skill-registry/         # Next.js (VSA) app — browses skills + git history
├── site/                       # static, GitHub-Pages-ready reference site
├── docs/project-tracking/      # GITHUB-PROJECTS.md — the per-repo config template
└── scripts/
    ├── install-skills.sh       # sync skills → ~/.claude/skills + ~/.cursor/skills
    └── install-skills.ps1      # (Windows)
```

See **HANDOFF.md** for the exact steps to bootstrap this in Claude Code.

## The model

- **Skills are user-level** — install once (`scripts/install-skills.*`) to both
  Claude Code and Cursor; the same `SKILL.md` runs in both.
- **Per-repo config is the only thing that varies** — each project you run the
  loop on gets its own `docs/project-tracking/GITHUB-PROJECTS.md`.
- **The registry app** reads `skills/` as its source of truth (via `SKILLS_DIR`)
  and surfaces each skill's version history from git.

## Deployment

The site + registry deploy to **Railway** as one service from the **repo root**
(the app reads `../../skills` and git history, so the service must not be
scoped to `apps/skill-registry`). Config-as-code: `railway.json` (build/start
commands, healthcheck), `nixpacks.toml` (adds `git` to the image), root
`package.json` (proxy scripts). Live at **https://vilya.jerrodtuck.com**.

## The name

Narya and Anduin are projects; **Vilya** is the ring that rules the process that
builds them. You are its bearer — the orchestrator. The skills are your
instruments; the board is the one shared state; the loop turns.
