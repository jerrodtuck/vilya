# Prune owns night-shift daytime-style branches

- `/prune` treats `.claude/worktrees/` on `feat|fix|docs/<issue#>-*` as night-shift /
  Claude daytime leftovers (not chips-only `claude/*`), including Actions `_work` checkouts.
- Night-shift skill: detach worktree after each PR; morning report is an unreviewed triage
  queue (unlike chip as-they-open review). Canon + `/merge-pr` note the same.
