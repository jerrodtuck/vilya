# Vilya — Skill Registry

A git-native registry for the Vilya skills. **The repo is the store**: skills
live as `SKILL.md` files, versions are git commits, and edits happen in your
editor and flow through the normal start → crucible → finish loop. The app reads
and renders them — it doesn't own a separate copy.

This app is itself a **Next.js vertical-slice** project, so it's the first real
repo the toolset governs: install `crucible-nextjs`, add a `GITHUB-PROJECTS.md`,
and run the loop on it.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

`npm run build && npm run start` for a production build.

## How it works

- **Source of truth:** the canonical repo-root `skills/` folder (via `SKILLS_DIR`, default `../../skills`). Drop a skill folder in
  and it appears in the registry automatically.
- **Frontmatter:** parsed with `gray-matter`; `references` and any Claude Code
  extension fields are preserved and shown.
- **Versions:** derived live from `git log` on each file (`src/shared/git`). Once
  the app runs inside a git repo, each skill's history renders on its page. No
  database — git *is* the version store.
- **Rendering:** `marked` turns the SKILL.md body into HTML.

## Structure (vertical slices)

```
src/
  app/                     # thin routing — dispatches into features
    page.tsx               #   /            → registry
    skills/[slug]/page.tsx #   /skills/:slug → detail
  features/                # the slices
    registry/              #   list + group skills
    skill-detail/          #   one skill + its git history
  shared/                  # kernel — no feature logic
    skills/                #   load-skills, types, meta
    git/                   #   history (git log)
content/GITHUB-PROJECTS.md # bundled template for Setup → Regenerate (synced from docs/)
```

No cross-feature imports; features compose the shared kernel. Data loading is in
server components (no client fetch). That's the `crucible-nextjs` bar applied to
its own registry.

## Roadmap (v1 → later)

- **v1 (this):** read-only registry — browse skills, frontmatter, body, git history.
- **Next:** diff two versions side by side; project-specific variants (a repo can
  override a skill); a "publish" action that syncs the canonical files out to
  `~/.claude/skills` and `~/.cursor/skills`.
- **Later:** in-browser editing (would add a small DB or write-back via the
  GitHub API); pull the static Flows / Setup pages in as routes.

## Deploy

Deploy-agnostic. Runs anywhere Next.js runs — Vercel is zero-config; Cloudflare
via `@opennextjs/cloudflare`; or a plain Node host. (History needs the `.git`
directory present at runtime, so a server/runtime deploy — not a pure static
export — keeps live version history.)
