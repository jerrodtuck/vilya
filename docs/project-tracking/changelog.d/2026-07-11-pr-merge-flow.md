### Fixed

- **Dev-server styles dropping in and out** — a stray, gitignored root
  `package-lock.json` stub (the root `package.json` is a script proxy with no
  deps and must never have one) gave Turbopack two lockfiles, destabilizing its
  workspace-root inference: the dev server registered client modules under two
  different roots, poisoning `.next` manifests — random routes 500'd
  ("Manifest file is empty" / "not in the React Client Manifest") or served
  HTML without their CSS link. Deleted the stub and added a root `.npmrc` with
  `package-lock=false` so npm can never recreate it. (`.gitignore` was already
  hiding the symptom — line 3 ignores `/package-lock.json` — so this had
  happened before.)

### Added

- **PR Merge Flow** — new `skills/merge-pr/SKILL.md`, the operator-side close of
  the loop: triage the PR body/CI first, fast checkout via `gh pr checkout` or a
  throwaway worktree (`pull/<n>/head`) when a local test run is owed, **squash
  merge always** (one issue = one commit on the default branch,
  `gh pr merge --squash --delete-branch`), board confirmation
  (Done vs Verifying), and worktree/branch cleanup.
- Flow map: `/merge-pr` joins the spine between `/finish-feature` and Done; the
  Verifying branch now hangs off the merge (where it actually happens); new
  "Merge a PR" flow chip + prompt group in GitHub-merged purple.
- **Merge routing declared at kickoff** — `/start-feature`'s verify plan now
  states `tests-only` · `local-smoke` · `live-only` on the issue;
  `/finish-feature` picks `Closes #` vs `Refs #` from it, `/merge-pr` reads it
  at triage, `/night-shift` may never downgrade `live-only`. Decided once,
  read everywhere.
- **Manual-test path** — `/merge-pr` triage distinguishes where a hands-on test
  can run: locally from the branch → pre-merge smoke from the throwaway worktree
  (the agent preps the launch + click-path via the new **Manual smoke** key in
  `GITHUB-PROJECTS.md`, the operator does the clicking, PR stays `Closes #`);
  live/hardware-only → merge `Refs #` → Verifying → Done after live confirmation.
- `GITHUB-PROJECTS.md` PR close convention now records the squash-only merge
  method; `/finish-feature` and `/night-shift` cross-link `/merge-pr` as the
  only path that merges.
