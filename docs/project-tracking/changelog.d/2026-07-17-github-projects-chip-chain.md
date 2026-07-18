# GITHUB-PROJECTS.md: drop --delete-branch, document the chip chain

Fix the merge-command contradiction in the PR close convention: the template
told operators `gh pr merge <n> --squash --delete-branch`, which `/merge-pr`
§4 forbids (deleting a branch checked out in a chip worktree leaves
Permission-denied husks). The line now reads `gh pr merge <n> --squash` with
the doctrine spelled out — remote branch removal is the repo's
`delete_branch_on_merge` setting; local branch + worktree cleanup is
`/prune`'s job, never merge-time. The Process section gains a "Chip chain
(dispatched)" subsection alongside the daytime chain (dispatch →
implement → crucible → finish-feature → send_message report → operator
/merge-pr → auto-archive → periodic /prune --apply), the
one-issue-one-branch line now covers both `feat|fix|docs/<issue#>-slug` and
`claude/*` namings, and a one-line pointer states the chip rules (never
merge, never spawn sessions, report via send_message — detail on the Setup
page and `/chip`). Both copies (docs + served template) stay byte-identical.
