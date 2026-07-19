# 2026-07-19 — chain-promote REST issue-dependencies

- **`chain-promote.yml` uses REST only** — `GET …/dependencies/blocking` for
  dependents and `…/dependencies/blocked_by` for open-blocker checks; no
  `gh api graphql` in the promote path (Closes #240, Refs #214).
- Spec + Chain promote canon note github.com / GHE Cloud availability; GHES
  still waits on those endpoints. Night-shift skill stays eligibility-only.
