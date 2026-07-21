# Night-agent visualization

**Created:** 2026-07-12  
**Last updated:** 2026-07-19  
**Issue:** [#36](https://github.com/jerrodtuck/vilya/issues/36)  
**Status:** Shipped — PR #58 merged 2026-07-12, #36 closed; page live at `/night-shift`

## Intent

Elevate `/night-shift` into a Flows-quality interactive pipeline that teaches how the
unattended night agent works — distinct from the daytime Dev Loop map on `/flows`.
Below the map: per-repo overnight setup for **two launchers** (Actions canonical;
Desktop routines with explicit Bypass — never user-global `defaultMode`).

## Stage model

Happy-path spine (left → right):

1. **Dispatch** — `workflow_dispatch` + optional cron `0 8 * * *` (commented in template until enabled)
2. **Runner** — self-hosted Windows Listener; fresh full-history clone in `_work`
3. **Identity** — OIDC → Claude GitHub App (`claude[bot]`) + `CLAUDE_CODE_OAUTH_TOKEN`
4. **Loop** — `claude-code-action@v1`, `timeout-minutes` + high `--max-turns`, Read/Write/Edit/Bash
5. **Steering** — `skills/vl-night-shift/SKILL.md` gates (`auto:ready` at ship; now `night-shift:ready`, crucible, `needs:decision`, never-merge)
6. **Outputs** — branch as `claude[bot]`, PR, board moves, morning report

Safety / failure (visually distinct):

7. **Failure layer** — bring-up ledger (WSL bash stub → `id-token: write` → App install →
   Windows CLI → pre-installed exe → expired OAuth + shared `~/.claude`)

Steering safety gates (`needs:decision`, never-merge) share the distinct styling with Failure.

## Accuracy notes

- Source of truth: `.github/workflows/night-shift.yml` as merged (cron **enabled**).
- Runner / `_work` mechanics are GitHub Actions self-hosted behavior, not named in YAML.
- Bring-up walls documented in #23 / PRs #31–33; shared-profile caveat from #36.

## Operator decision (2026-07-12)

Setup strip under the map documents both launchers (**B**): Actions (`claude_args`
Bypass) and Desktop routines (Settings → Allow bypass + per-routine Bypass). Do not
default Bypass in `~/.claude/settings.json`.

## Verify

- Vitest on stage model; `npm test && npm run build` in `apps/skill-registry`
- Merge routing: **local-smoke** — click each stage on `/night-shift`; confirm setup
  strip names both launchers; PR `Closes #36`
