# Copy-paste REST bash cards for the plan:ready / needs:plan pollers

Orch/Plan doctrine already banned `gh pr list` on the standing poller hot
path, but nothing stopped a seat from freestyling `gh issue list --json`
(GraphQL under the hood, same shared user bucket) instead of the REST
`search/issues` recipe the doctrine actually specifies. Two fixes:

- **Explicit ban:** `gh issue list --json` is now named alongside `gh pr
  list` and `gh project item-list` everywhere the standing plan:ready /
  needs:plan poller doctrine lives — `GRAPHQL_QUOTA_DOCTRINE`,
  `HOST_MONITOR_MECHANISMS`, `ORCH_PLAN_READY_POLLER`,
  `CURSOR_DISPATCH_MONITOR` (orchestrator prompts.ts), the Planner intake
  recipe (planner prompts.ts), and the matching bullets in
  `/vl-orch-claude`, `/vl-orch-cursor`, and `/vl-plan`.
- **Copy-paste bash:** new `ORCH_PLAN_READY_POLLER_BASH` (orch) and
  `PLANNER_NEEDS_PLAN_INTAKE_BASH` (planner) constants render the doctrine
  as a runnable recipe — REST `search/issues`, always re-seed `last-seen`,
  gain-only `WAKE:` sentinel, `>=120s` cadence — surfaced as new
  standing-orders cards on `/orch` and `/planner` so a seat can paste the
  poller instead of inventing one. The three SKILL.md files point at these
  cards by name.

No new architectural decision — this makes the existing #255/#261/#267/#270
doctrine copy-paste-able and closes the one GraphQL loophole those ADRs
didn't name. Extended `cursor-rest-monitor.test.ts` and
`planner-doctrine.test.ts`.

(#311)