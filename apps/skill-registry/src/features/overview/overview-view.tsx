// Feature slice: overview — the methodology's front door (server component).
import Link from "next/link";
import { BoardStrip } from "@/shared/ui/board-strip";

export function OverviewView() {
  return (
    <>
      <div className="eyebrow">
        VSA + SOLID · .NET/Blazor · Next.js · Claude Code + Cursor
      </div>
      <h1>The Dev Loop</h1>
      <p className="mono-kicker">01 · system</p>
      <p className="lead">
        <b>Vilya is the Dev Loop</b> — the skills, board, and night-shift that
        turn you into the orchestrator across every product repo. You point them
        by day, decide at the forks, and keep the board honest. Night-shift runs
        that <b>same</b> chain unattended. One{" "}
        <code>GITHUB-PROJECTS.md</code> per repo; Claude Code and Cursor both
        speak the same skills.
      </p>

      <div className="chipstrip" aria-label="Daytime chain">
        <span className="lchip s">/start-feature</span>
        <span className="arrow">→</span>
        <span className="lchip">implement in the slice</span>
        <span className="arrow">→</span>
        <span className="lchip r">crucible review</span>
        <span className="arrow">⟲</span>
        <span className="lchip r">refactor</span>
        <span className="arrow">→</span>
        <span className="lchip f">/finish-feature</span>
        <span className="arrow">→</span>
        <span className="lchip f">/merge-pr</span>
        <span className="arrow">→</span>
        <span className="lchip f">Done</span>
      </div>

      <BoardStrip
        orchestratorHref="/orchestrator"
        hint={
          <>
            Status is the only native field that moves work:{" "}
            <b>Todo → In Progress → Blocked → Verifying → Done</b>. Skills read
            project ids and labels from that repo&apos;s{" "}
            <code>GITHUB-PROJECTS.md</code> — one file per product, skills stay
            generic.
          </>
        }
      />

      <div className="cards">
        <Link className="card" href="/orchestrator">
          <h3>Orchestrator</h3>
          <p className="desc">
            The interactive map. Light up any path — happy path,
            review↔refactor loop, PR merge, consult forks, bug-mid-work,
            blocked, verifying, epic fan-out, night shift.
          </p>
          <span className="more">Open the map →</span>
        </Link>
        <Link className="card" href="/skills">
          <h3>Skills</h3>
          <p className="desc">
            The instruments, read live from their <code>SKILL.md</code>{" "}
            files — what each does, its trigger, invocation, and full version
            history.
          </p>
          <span className="more">See the toolset →</span>
        </Link>
        <Link className="card" href="/setup">
          <h3>Setup</h3>
          <p className="desc">
            Install once at the user level; add one config file per repo.
            Shared-file rules, platform toggle, plan → execute flow.
          </p>
          <span className="more">Set up a project →</span>
        </Link>
        <Link className="card" href="/night-shift">
          <h3>Night shift</h3>
          <p className="desc">
            Same daytime chain, unattended. Actions on each product repo;
            personal per-repo runners or org pool later; Claude stays personal.
          </p>
          <span className="more">Run overnight →</span>
        </Link>
      </div>

      <div className="callout">
        <b>One body, two tools.</b> Cursor and Claude Code both speak the
        SKILL.md standard, so each skill is authored <b>once</b>. The shared
        fields — <code>name</code>, <code>description</code>,{" "}
        <code>disable-model-invocation</code> — behave identically in both;
        Claude Code&apos;s extra fields are additive and harmlessly ignored by
        Cursor. The only per-project variation lives in each repo&apos;s{" "}
        <code>GITHUB-PROJECTS.md</code>.
      </div>

      <div className="pagefoot">
        Instruments:{" "}
        <b>
          /start-feature · crucible-blazor · crucible-nextjs · /finish-feature
          · /merge-pr · /update-docs · /history · night-shift
        </b>
        .
      </div>
    </>
  );
}
