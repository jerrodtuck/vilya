# Canon: chip smoke contract for shared app hosts — probe, never manage

Closed a gap surfaced by an anduin architect session (#294): a chip smoking against a shared
long-lived app host (e.g. Anduin.App) had no rule telling it the running instance might belong to
the operator, another chip, or the orchestrator's own pre-merge check. `/vl-chip` gains §2b: probe
the repo-configured smoke endpoint before smoking, never start the host in-process, kill it, or
restart it — a config need discovered mid-smoke is a fork on the issue, not a "restart to pick up
config." A down host is a fail-fast Verification note ("smoke owed — host not up at `<port>`") with
a named remedy, not a silent skip; a repo-provided **start-only** bring-up script (no stop verb) is
the one exception, since it cannot interfere with an instance it doesn't own. Where the host exposes
build identity, Verification records "smoked against host @ `<commit>`" and flags staleness against
the default branch. `/vl-finish-feature` step 6 carries the matching Verification wording, and
Vilya's `GITHUB-PROJECTS.md` process section points at the full contract so it's visible from either
canon file. Refs: anduin#282 (health build identity) · anduin#283 (start-only bring-up script) ·
anduin-admin#18 (smoke port precedent).
