# `.worktreeinclude` shared list — Cursor shim + orch apply

- **Single list:** repo-root `.worktreeinclude` remains the declarative inventory of
  gitignored files to copy into new worktrees (Claude Code native).
- **Cursor shim:** `scripts/apply-worktreeinclude.(ps1|sh)` + `.cursor/worktrees.json`
  apply that same file when Cursor creates a worktree.
- **Orch path:** `/vl-start-feature` and Cursor orch run the adapter after bare
  `git worktree add` (Cursor setup does not run on orch-created trees).
- **Teaching:** Setup + `/differences` + canon paragraph — one list; no dual inventory.
  Product repos copy the shim once and extend `.worktreeinclude` only.

(#301)
