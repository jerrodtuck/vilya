### Changed

- **/merge-pr skill docs** — step 2 now says to install dependencies in the throwaway
  worktree before running the Test command (`npm ci` for Node; `dotnet test` restores
  automatically), and step 4 warns that merging from the PR branch's own worktree
  requires `--squash` without `--delete-branch`, deleting the remote branch separately.
  Found dogfooding the skill on its own PR. (#43)
