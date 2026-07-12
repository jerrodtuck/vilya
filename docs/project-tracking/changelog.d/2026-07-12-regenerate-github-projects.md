# Fix Setup Regenerate GITHUB-PROJECTS.md on deploy

Ship `apps/skill-registry/content/GITHUB-PROJECTS.md` (synced on prebuild) so
Regenerate does not depend on monorepo-relative `../../docs` paths at runtime.
Live-on-paste status strip under the paste box makes checklist updates visible
without scrolling.
