### Changed

- **Overview "Ask Vilya" panel** — one-liner teaching that standing seats
  (`/vl-orch-claude`, `/vl-orch-cursor`, `/vl-arch`, `/vl-plan`, `/vl-merge-pr`,
  `/vl-ask`) load `/vl-adhd` automatically for replies to the operator; the
  operator invokes it directly only as a one-time fallback if a host skipped
  the load. Added `adhd: "vl-adhd"` to `SKILL_SLUGS` / `SKILL_INVOKES` so the
  teaching copy can't drift from the slug. (#299)

### Fixed

- **Live `/skills/vl-adhd` 404 / missing from index** — confirmed already
  resolved: Railway's latest deploy on `master` (commit `3b7f536`, the `#295`
  vl-adhd skill commit) is `SUCCESS` and live; `/skills/vl-adhd` returns 200
  with the full skill body and `/skills` lists `vl-adhd`. No redeploy needed
  by the time this chip ran — the 404 in the issue was a stale snapshot from
  before that deploy landed. (#299)
