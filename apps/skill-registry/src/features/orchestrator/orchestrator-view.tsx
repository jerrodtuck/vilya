// Feature slice: orchestrator — page composition (server component). The
// host toggle + map + path + prompt library live in OrchHostPanel (client).
import Link from "next/link";
import { Suspense } from "react";
import { BoardStrip } from "@/shared/ui/board-strip";
import { SITE_TAGLINE } from "@/shared/ui/site-tagline";
import { OrchHostPanel } from "./orch-host-panel";

export function OrchestratorView() {
  return (
    <>
      <header>
        <div className="eyebrow">{SITE_TAGLINE}</div>
        <h1>
          <span className="you">You</span> are the orch
        </h1>
        <p className="lead">
          <b>Orchestrator</b> is the seat/job — dispatch, monitor, merge, prune.{" "}
          <code>/vl-orch-claude</code> and <code>/vl-orch-cursor</code> are
          which desktop skill. Pick your host below; the skills are your
          instruments. Everything reports into one shared state: the GitHub
          Projects board. Click a <b>flow</b> to light its path, or click any{" "}
          <b>node</b> to see what that skill does.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link className="setupbtn" href="/setup">
            Per-project setup
          </Link>
        </div>
      </header>

      <BoardStrip
        hint={
          <>
            Every skill reads its repo/project/label values from that
            repo&apos;s <code>GITHUB-PROJECTS.md</code> config block — one file
            per repo, skills stay generic.{" "}
            <b>Blocked</b> holds design forks; <b>Verifying</b> is for
            live-only confirmation after merge.
          </>
        }
      />

      <Suspense fallback={<p className="muted">Loading orch desktop…</p>}>
        <OrchHostPanel />
      </Suspense>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Autonomous · your runbook</div>
        <h3>Night shift — same chain, unattended</h3>
        <p className="muted" style={{ margin: "6px 0 12px", lineHeight: 1.55 }}>
          Full setup lives on the{" "}
          <Link href="/night-shift">Night shift</Link> page (Actions or Desktop
          routines). Short version: prep with Planner to <code>plan:ready</code>,
          label <code>night-shift:ready</code>, fire the launcher, wake to PRs —
          never auto-merge. Actions path: self-hosted runner +{" "}
          <code>CLAUDE_CODE_OAUTH_TOKEN</code>; Bypass rides in workflow{" "}
          <code>claude_args</code>. Desktop: enable Allow bypass in Settings, set
          that routine to Bypass (not a user-global default).
        </p>
        <div className="note" style={{ marginTop: 8 }}>
          Template:{" "}
          <a
            href="https://github.com/jerrodtuck/vilya/blob/master/docs/project-tracking/templates/night-shift.yml"
            target="_blank"
            rel="noreferrer"
          >
            <code>docs/project-tracking/templates/night-shift.yml</code>
          </a>
          {" "}
          (one file for every stack — Stack / Crucible / Test command stay in
          each product&apos;s <code>GITHUB-PROJECTS.md</code>). Manual{" "}
          <code>workflow_dispatch</code> until a green run; then optional cron.
        </div>
      </div>

      <div className="pagefoot">
        Skills read every repo-specific value (owner · project # · ids ·{" "}
        <b>stack</b> · <b>test command</b> · <code>area:*</code>{" "}
        labels) from
        that repo&apos;s <code>GITHUB-PROJECTS.md</code>. Drop the process
        skills + the matching <code>vl-crucible-&lt;stack&gt;</code>{" "}
        into any repo
        and the whole loop works. &nbsp;·&nbsp; Instruments:{" "}
        <b>
          /vl-start-feature · /vl-crucible-{"{blazor,nextjs}"} · /vl-finish-feature ·
          /vl-merge-pr · /vl-update-docs · /vl-history · /vl-night-shift
        </b>{" "}
        over the GitHub Projects board.
      </div>
    </>
  );
}
