# Seats return to main clone after merge

- **Mandatory return, not a warning:** `/vl-merge-pr` §5 ("Return to main clone, then board +
  prune handoff") now requires the session to leave a just-merged feature worktree before the
  turn ends — Cursor via `move_agent_to_root` (cursor-app-control MCP), Claude Code by leaving
  the worktree / re-opening the main clone's cwd. The old "don't `git worktree remove` the tree
  you stand in" text is now belt-and-suspenders, not the only control.
- **Orch house rule:** `/vl-orch-cursor` and `/vl-orch-claude` both gain an explicit
  drift-restore rule — if the session's workspace/cwd drifts into a feature worktree, restore
  the main clone before the next board/merge/prune/kickoff action.
- **Failure closed:** after the #301 squash-merge, the orch session stayed in
  `301-worktreeinclude-shim` until the operator caught it. This closes that gap.

(#303)