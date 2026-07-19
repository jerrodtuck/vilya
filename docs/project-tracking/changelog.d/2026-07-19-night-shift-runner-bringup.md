### Fixed

- **Night-shift Windows runner bring-up** — docs and workflows no longer assume
  `svc.cmd` is the only start path. Document `.\run.cmd` for bring-up, optional
  service install for always-on, label edits without reconfig, and the bash
  trap (`System32\bash.exe` / docker-desktop-only). Prefer Git Bash pinned in the
  workflow (`GITHUB_PATH` + `CLAUDE_CODE_GIT_BASH_PATH`); optional host fixes are
  Git\bin first on PATH or `wsl --set-default Ubuntu`. Standard labels are
  `self-hosted,windows` for all product repos — no required `cygnet` (or other
  stack) label under personal per-repo registration; CygNet is a machine/SDK
  requirement, not an Actions label. Site `/night-shift` and templates match.
