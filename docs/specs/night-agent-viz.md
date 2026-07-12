# Night-agent visualization

**Created:** 2026-07-12  
**Last updated:** 2026-07-12  
**Issue:** [#36](https://github.com/jerrodtuck/vilya/issues/36)  
**Status:** Shipped on branch — awaiting PR merge + local-smoke

## Intent

Elevate `/night-shift` into a Flows-quality interactive pipeline that teaches how the
unattended night agent works — distinct from the daytime Dev Loop map on `/flows`.

## Stage model

Happy-path spine (left → right):

1. **Dispatch** — `workflow_dispatch` + active cron `0 8 * * *`
2. **Runner** — self-hosted Windows Listener; fresh full-history clone in `_work`
3. **Identity** — OIDC → Claude GitHub App (`claude[bot]`) + `CLAUDE_CODE_OAUTH_TOKEN`
4. **Loop** — `claude-code-action@v1`, `--max-turns 60`, Read/Write/Edit/Bash
5. **Steering** — `skills/night-shift/SKILL.md` gates (`auto:ready`, crucible, `needs:decision`, never-merge)
6. **Outputs** — branch as `claude[bot]`, PR, board moves, morning report

Safety / failure (visually distinct):

7. **Failure layer** — bring-up ledger (WSL bash stub → `id-token: write` → App install →
   Windows CLI → pre-installed exe → expired OAuth + shared `~/.claude`)

Steering safety gates (`needs:decision`, never-merge) share the distinct styling with Failure.

## Accuracy notes

- Source of truth: `.github/workflows/night-shift.yml` as merged (cron **enabled**).
- Runner / `_work` mechanics are GitHub Actions self-hosted behavior, not named in YAML.
- Bring-up walls documented in #23 / PRs #31–33; shared-profile caveat from #36.

## Verify

- Vitest on stage model; `npm test && npm run build` in `apps/skill-registry`
- Merge routing: **local-smoke** — click each stage on `/night-shift`; PR `Closes #36`
