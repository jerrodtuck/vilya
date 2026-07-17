# Prune skill: session-liveness gate for chip worktrees

`/prune` can no longer false-positive on a live chip's worktree (the #99
incident: a freshly started chip — no PR, no commits, clean tree — looked
identical to a dead one by git evidence, and prune deleted its branch out from
under the running session). The §3 eligibility table now requires, for every
`.claude/worktrees/*` row, querying `mcp__ccd_session_mgmt__list_sessions` and
skipping any worktree whose path or branch matches a **non-archived** session —
regardless of `isRunning`, since sessions report `isRunning: false` between
turns while still holding their worktree. §5a notes the corollary ("Device or
resource busy" on a chip tree usually means a not-yet-archived session; archive
it, don't force-delete), and the Honesty bar forbids treating
"no PR + no commits + clean" as death evidence for a chip tree. Operators must
re-run `scripts/install-skills.ps1` after merge to refresh installed copies.
