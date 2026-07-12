### Changed

- **/prune** — documents the Windows/Cursor `cursor-agent-worker` lock recipe
  (§5a): identify `node.exe` whose cmdline holds `--worker-dir` / the worktree
  path; kill only when the operator authorizes; never auto-kill. `/merge-pr`
  handoff and Flows MERGE/ORCH prompts point at the same step. (#64)
