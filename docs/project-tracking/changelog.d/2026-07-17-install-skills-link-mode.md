# install-skills: link mode — skill merges live on pull

`scripts/install-skills.(ps1|sh)` now **link** instead of copy:
`~/.claude/skills/<name>` is a directory junction (Windows, no admin) or
symlink (macOS/Linux) to the repo's `skills/<name>`, so merged skill changes
are live on `git pull` — the "re-run install-skills after merge" operator
chore is gone permanently, superseding the re-run reminders in earlier
fragments/PRs. Idempotent (already-correct link is a no-op), migrates old
copy-mode directories in place, never touches target entries without a
matching `skills/<name>` (curl-installed one-offs stay), and takes a
target-root override (`-TargetRoot` / `--target-root` /
`INSTALL_SKILLS_TARGET`) for testing. Setup page, registry copy, and README
updated to run-once-per-machine link language; the curl single-skill path
stays documented as the copy-mode exception. (#116)

**Operator action after merge (the actual last run):** from the main clone run
`powershell scripts/install-skills.ps1` once — it migrates the existing copies
to junctions and prints the linked/migrated/skipped summary. Verify with
`Get-Item ~/.claude/skills/chip | Select-Object LinkType, Target`.
