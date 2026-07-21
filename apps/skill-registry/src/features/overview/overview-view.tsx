// Feature slice: overview — the methodology's front door (server component).
import Link from "next/link";
import { SKILL_INVOKES } from "@/shared/skills/invokes";
import { BoardStrip } from "@/shared/ui/board-strip";
import { PromptList } from "@/shared/ui/prompt-list";
import { SITE_TAGLINE } from "@/shared/ui/site-tagline";
import { ASK_VILYA } from "./ask-vilya";
import { BoardMoverMap } from "./board-mover-map";
import { BoardScreenshot } from "./board-screenshot";
import { CardinalityDiagram } from "./cardinality-diagram";
import { FoundingWhy } from "./founding-why";

export function OverviewView() {
  return (
    <>
      <div className="eyebrow">{SITE_TAGLINE}</div>
      <h1>The Dev Loop</h1>
      <p className="mono-kicker">01 · system</p>
      <p className="lead">
        <b>Vilya is the Dev Loop</b> — the skills, board, and night-shift that
        turn you into the <b>architect</b> who sets direction, the{" "}
        <b>planner</b> who plans onto the board, and the{" "}
        <b>orchestrator</b> who dispatches it: one architect seat per product
        board, one orchestrator per repo, and one Planner per repo on Claude
        Code chip-flow (Cursor daytime Planner is optional — see{" "}
        <Link href="/differences">Two desktops</Link>). You point them by day,
        decide at the forks, and keep the board honest. Night-shift runs that{" "}
        <b>same</b> chain unattended. One <code>GITHUB-PROJECTS.md</code> per
        repo; Claude Code and Cursor both speak the same skills.
      </p>

      <div className="rolestrip" aria-label="Role order">
        <span className="rolechip" style={{ ["--rc" as string]: "var(--arch)" }}>
          <b>Architect</b>
          <span>direction: issues · ADRs · specs</span>
        </span>
        <span className="arrow">→</span>
        <span
          className="rolechip"
          style={{ ["--rc" as string]: "var(--planner)" }}
        >
          <b>Planner</b>
          <span>plan loop: needs:plan → plan:ready</span>
        </span>
        <span className="arrow">→</span>
        <span className="rolechip" style={{ ["--rc" as string]: "var(--orch)" }}>
          <b>Orchestrator</b>
          <span>dispatch: chips · board · merges</span>
        </span>
        <span className="arrow">→</span>
        <span className="rolechip" style={{ ["--rc" as string]: "var(--start)" }}>
          <b>The chain</b>
          <span>daytime loop, below</span>
        </span>
      </div>

      <div className="chipstrip" aria-label="Daytime chain">
        <span className="lchip s">/vl-start-feature</span>
        <span className="arrow">→</span>
        <span className="lchip">implement in the slice</span>
        <span className="arrow">→</span>
        <span className="lchip r">crucible review</span>
        <span className="arrow">⟲</span>
        <span className="lchip r">refactor</span>
        <span className="arrow">→</span>
        <span className="lchip f">/vl-finish-feature</span>
        <span className="arrow">→</span>
        <span className="lchip f">/vl-merge-pr</span>
        <span className="arrow">→</span>
        <span className="lchip f">Done</span>
      </div>

      <FoundingWhy />

      <BoardStrip
        moversHref="#movers"
        orchestratorHref="/orch"
        figure={<BoardScreenshot />}
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

      <CardinalityDiagram />

      <BoardMoverMap />

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Front door</div>
        <h3>Ask Vilya</h3>
        <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          Who handles this — architect, planner, orchestrator, or you? Run{" "}
          <code>{SKILL_INVOKES.askVilya}</code> with your question (or paste
          the card below); the answer comes back in a fixed shape:{" "}
          <b>lane · exact next prompt · one-line why</b> with its canon
          citation. It routes — it never creates issues or dispatches.
        </p>
        <div
          className="libcard"
          style={{ ["--lc" as string]: `var(${ASK_VILYA.c})`, marginTop: 14 }}
        >
          <h4>{ASK_VILYA.group}</h4>
          <PromptList group={ASK_VILYA} />
        </div>
      </div>

      <div className="cards">
        <Link className="card" href="/architect">
          <h3>Architect</h3>
          <p className="desc">
            Decides and documents — direction, ADRs, specs. Recalls
            what&apos;s been tried, grounds every claim, and stops at every
            fork with a stated recommendation.
          </p>
          <span className="more">Open the architect map →</span>
        </Link>
        <Link className="card" href="/planner">
          <h3>Planner</h3>
          <p className="desc">
            Standing Fable plan loop — drains <code>needs:plan</code>, writes
            kickoff + verify plan, marks <code>plan:ready</code>. Never
            implements, dispatches, or merges.
          </p>
          <span className="more">Open the planner map →</span>
        </Link>
        <Link className="card" href="/orch">
          <h3>Orch</h3>
          <p className="desc">
            The interactive map per desktop. Light up any path — happy path,
            review↔refactor loop, PR merge, consult forks, bug-mid-work,
            blocked, verifying, epic fan-out, night shift.
          </p>
          <span className="more">Open the orch map →</span>
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
        <b>One board, two desktops.</b> Cursor and Claude Code share the board
        contract (issues, Status, verify plan, merge routing) and the{" "}
        SKILL.md body — skills are authored <b>once</b>. Chip spawn, Planner
        seat, and cloud/local gates diverge by host; learn the paths on{" "}
        <Link href="/differences">Two desktops</Link>. Per-repo variation lives
        in each repo&apos;s <code>GITHUB-PROJECTS.md</code>.
      </div>

      <div className="callout">
        <b>One method, per-stack dialects.</b> SOLID and vertical-slice
        architecture apply to <i>every</i>{" "}
        stack — they&apos;re the method, and
        the crucible review carries them everywhere. What differs per stack is
        the <b>dialect</b> the review speaks: Next.js is reviewed against{" "}
        <b>Bulletproof React</b> (feature folders, one-way{" "}
        <code>shared → features → app</code>{" "}
        imports, lint-enforced boundaries
        — VSA in React&apos;s vocabulary); .NET/Blazor is reviewed against{" "}
        <b>plain VSA</b> (feature slices, shared kernel as contracts only). One
        crucible variant per repo, matched to its stack — same bar, native
        accent. Today that spans the frontend dialects (<b>Bulletproof React</b>{" "}
        · <b>VSA/Blazor</b>) and the backend/Python dialects (<b>FastAPI</b> ·{" "}
        <b>Django</b> · <b>ML</b>) — all enumerated live on the{" "}
        <Link href="/skills">Skills page</Link>. The method itself is inspired
        by Cursor&apos;s &quot;thermonuclear code review&quot; prompt — credit
        where the lineage runs.
      </div>

      <div className="pagefoot">
        Instruments:{" "}
        <b>
          /vl-start-feature · per-stack crucibles · /vl-finish-feature · /vl-merge-pr
          · /vl-update-docs · /vl-history · /vl-night-shift
        </b>
        .
      </div>
    </>
  );
}
