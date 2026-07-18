Product repos' `GITHUB-PROJECTS.md` is now **config-only + canon pointer** — the per-repo
process-prose sync is dead, the same way #116 killed the skills sync. Vilya's
`docs/project-tracking/GITHUB-PROJECTS.md` stays the single fat canon (config + process).
The Setup page's Regenerate tool still parses old full copies (and slim ones) but always
emits the slim format: Repo config table, status/field ids, area labels, a per-repo
night-shift note, and a pointer header to the canon. Skills audited: every one reads only
config keys from the product file; night-shift's SKILL.md was repointed at the canon for
process. (#119)
