// Feature slice: flows — page composition (server component). The interactive
// map is the client island; everything else renders on the server.
import Link from "next/link";
import { FlowsMap } from "./flows-map";
import { PromptList } from "./prompt-list";
import { PROMPTS } from "./prompts";

export function FlowsView() {
  return (
    <>
      <header>
        <div className="eyebrow">
          VSA + SOLID · .NET/Blazor · Next.js · Claude Code + Cursor
        </div>
        <h1>
          <span className="you">You</span> are the orchestrator
        </h1>
        <p className="lead">
          The skills are your instruments. You don&apos;t write the boilerplate
          — you point the skills, decide at the forks, and keep the board
          honest. Everything reports into one shared state: the GitHub Projects
          board. Click a <b>flow</b> to light its path, or click any{" "}
          <b>node</b> to see what that skill does.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link className="setupbtn" href="/setup">
            ⚙ Per-project setup
          </Link>
        </div>
      </header>

      <div className="board">
        <div className="blabel">
          ▸ <b>GitHub&nbsp;Projects&nbsp;board</b> — the one shared state
        </div>
        <div className="pills">
          <span className="pill todo">Todo</span>
          <span className="pill inprog">In Progress</span>
          <span className="pill blk">Blocked</span>
          <span className="pill ver">Verifying</span>
          <span className="pill dn">Done</span>
        </div>
        <div className="hint">
          Every skill reads its repo/project/label values from that repo&apos;s{" "}
          <code>GITHUB-PROJECTS.md</code> config block — one file per repo,
          skills stay generic.
        </div>
      </div>

      <FlowsMap
        aside={
          <div className="panel">
            <div className="kicker">How you multitask</div>
            <h3>Orchestrator modes</h3>
            <div className="modes" style={{ marginTop: 12 }}>
              <div className="mode" style={{ ["--m" as string]: "var(--start)" }}>
                <b>Serial</b>
                <span>
                  One issue = one branch = one worktree. The default clean unit
                  of work.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--epic)" }}>
                <b>Parallel (fan-out)</b>
                <span>
                  An Epic splits into sub-issues; each is an isolated slice in
                  its own worktree. You context-switch between independent
                  streams with no collisions.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--review)" }}>
                <b>Looped</b>
                <span>
                  review → refactor → re-review runs until <code>Ready</code>,
                  then auto-hands to <code>/finish-feature</code>. The inner
                  loop you can automate.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--refactor)" }}>
                <b>Parallel lenses</b>
                <span>
                  One review fans out into VSA · SOLID · stack · Simplify
                  passes at once, then merges findings — faster than a single
                  sweep.
                </span>
              </div>
            </div>
            <div className="kicker" style={{ marginTop: 16 }}>
              Review output
            </div>
            <div className="sev">
              <span className="sevpill" style={{ color: "#ff6b8a", borderColor: "#5c2e38" }}>
                🔴 Blocker — merge waits
              </span>
              <span className="sevpill" style={{ color: "var(--refactor)", borderColor: "#5c4a2e" }}>
                🟠 Should-fix
              </span>
              <span className="sevpill" style={{ color: "#e8d24f", borderColor: "#565028" }}>
                🟡 Consider (stack)
              </span>
            </div>
          </div>
        }
      />

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Copy-paste</div>
        <h3>Orchestrator prompt library</h3>
        <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          The words you actually say to drive each skill. Fill the{" "}
          <code>&lt;placeholders&gt;</code> and paste. Every prompt also shows
          up in its node&apos;s detail panel above — click <b>Copy</b> on any
          of them.
        </p>
        <div className="lib">
          {PROMPTS.map((g) => (
            <div
              key={g.group}
              className={`libcard${g.wide ? " wide" : ""}`}
              style={{ ["--lc" as string]: `var(${g.c})` }}
            >
              <h4>{g.group}</h4>
              <PromptList items={g.items} />
              {g.noteHtml ? (
                <div
                  className="note"
                  style={{ marginTop: 10, fontSize: 12 }}
                  dangerouslySetInnerHTML={{ __html: g.noteHtml }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Autonomous · your runbook</div>
        <h3>🌙 Night shift — how you actually run it</h3>
        <p className="muted" style={{ margin: "6px 0 12px", lineHeight: 1.55 }}>
          Wired as a GitHub Actions workflow (
          <code>.github/workflows/night-shift.yml</code>) on a{" "}
          <b>self-hosted runner</b> on your always-on dev box.{" "}
          <b>Manual-only by default</b> — nothing fires until you say so, and a
          run only ever touches <i>this</i> repo&apos;s board.
        </p>
        <div className="modes">
          <div className="mode" style={{ ["--m" as string]: "var(--start)" }}>
            <b>1 · Before bed — pick the work</b>
            <span>
              Label well-specified issues <code>auto:ready</code>. That label
              is the only opt-in the loop honors — epics and{" "}
              <code>needs:decision</code> issues are skipped. No label, no
              work.
            </span>
          </div>
          <div className="mode" style={{ ["--m" as string]: "var(--orch)" }}>
            <b>2 · Fire the run</b>
            <span>
              Actions → <b>night-shift</b> → <b>Run workflow</b>, or{" "}
              <code>gh workflow run night-shift</code>. It takes up to 3
              eligible issues, highest priority first — then walk away.
            </span>
          </div>
          <div className="mode" style={{ ["--m" as string]: "var(--review)" }}>
            <b>3 · While you sleep — the guarantees</b>
            <span>
              Same loop as daytime: build in the slice, crucible until{" "}
              <b>Ready</b>, tests green. At a real design fork it never guesses
              — it comments its recommendation, labels{" "}
              <code>needs:decision</code>, moves the issue to Blocked. Opens
              PRs, <b>never merges</b>.
            </span>
          </div>
          <div className="mode" style={{ ["--m" as string]: "var(--finish)" }}>
            <b>4 · Morning — triage the report</b>
            <span>
              One digest: ✅ PRs opened (review &amp; merge via{" "}
              <code>/merge-pr</code>) · 🟡 needs your
              call (answer the fork, relabel) · 🔴 stuck (WIP branch pushed) ·
              ⏭️ skipped (and why). You wake to a review queue, not a mystery.
            </span>
          </div>
        </div>
        <div className="note" style={{ marginTop: 14 }}>
          <b>Plug in another repo:</b> copy the template at{" "}
          <code>
            docs/project-tracking/templates/night-shift-dotnet-cygnet.yml
          </code>{" "}
          (or adapt this repo&apos;s workflow) into that repo, register the
          self-hosted runner there, and add its <code>ANTHROPIC_API_KEY</code>{" "}
          secret. Each copy works only its own board. Want it truly nightly?
          Uncomment the <code>schedule:</code> block — that&apos;s the
          deliberate opt-in to autopilot.
        </div>
      </div>

      <div className="pagefoot">
        Skills read every repo-specific value (owner · project # · ids ·{" "}
        <b>stack</b> · <b>test command</b> · <code>area:*</code> labels) from
        that repo&apos;s <code>GITHUB-PROJECTS.md</code>. Drop the process
        skills + the matching <code>crucible-&lt;stack&gt;</code> into any repo
        and the whole loop works. &nbsp;·&nbsp; Instruments:{" "}
        <b>
          /start-feature · crucible-{"{blazor,nextjs}"} · /finish-feature ·
          /merge-pr · /update-docs · /history · /night-shift
        </b>{" "}
        over the GitHub Projects board.
      </div>
    </>
  );
}
