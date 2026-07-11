// Feature slice: flows — node and flow definitions for the orchestration map.
// Node bodies are trusted, hand-authored HTML (same posture as the markdown
// pipeline in skill-detail).

export interface FlowNode {
  kicker: string;
  title: string;
  /** CSS custom property for the node's accent color. */
  c: string;
  bodyHtml: string;
}

export interface FlowDef {
  label: string;
  descHtml: string;
  /** null = "everything": nothing faded, nothing lit. */
  nodes: string[] | null;
  edges: string[] | null;
}

export const NODES: Record<string, FlowNode> = {
  ORCH: {
    kicker: "The orchestrator",
    title: "You",
    c: "--orch",
    bodyHtml: `
    <p>You don't run the boilerplate — you <b>aim</b> the skills. Your real job is the three things a skill can't decide for you:</p>
    <ul><li>Which issue is next, and how it's scoped.</li>
    <li>The call at each design <b>fork</b> (see Consult).</li>
    <li>When a review's refactors are worth another loop vs. shipping.</li></ul>
    <p>Everything else — issue creation, labels, branch naming, board status, PR body — is mechanical and belongs to the skills.</p>`,
  },
  START: {
    kicker: "/start-feature",
    title: "Kick off the work",
    c: "--start",
    bodyHtml: `
    <p>Turns intent into a tracked, branched, ready-to-build unit.</p>
    <ul><li>The <b>issue is the brief</b> — view it or create + add it to the board.</li>
    <li>Branch <code>feat|fix|docs/&lt;issue#&gt;-slug</code>; one issue = one worktree.</li>
    <li>Non-trivial design → a <code>docs/specs/</code> doc linked from the issue.</li>
    <li>Verify plan on the issue declares the <b>merge routing</b>: <code>tests-only</code> · <code>local-smoke</code> · <code>live-only</code> — finish and merge read it, nobody re-decides at PR time.</li>
    <li>Move the issue to <b>In Progress</b>.</li></ul>
    <p>Reads owner / project # / <code>area:*</code> labels from <code>GITHUB-PROJECTS.md</code>.</p>`,
  },
  IMPL: {
    kicker: "Implementation",
    title: "Build in the slice",
    c: "--impl",
    bodyHtml: `
    <p>The VSA non-negotiables while you build:</p>
    <ul><li>Feature logic lives in its <b>owning vertical slice</b> — no app-wide Controllers/Services/Repositories layer-cake.</li>
    <li>Shared kernel = contracts/ports only.</li>
    <li>No <code>ProjectReference</code> into a sibling product.</li></ul>
    <p>Surfaced a bug here? → <code>/update-docs</code>, don't derail the branch.</p>`,
  },
  REVIEW: {
    kicker: "crucible-{blazor,nextjs}",
    title: "Refactor-oriented review",
    c: "--review",
    bodyHtml: `
    <p>Not a pass/fail gate. It returns <b>findings + the fix</b>, each tagged by severity:</p>
    <ul><li>🔴 Blocker · 🟠 Should-fix · 🟡 Consider (stack guidance).</li>
    <li>Closes with a <b>merge-readiness signal</b> — Ready / Ready after blockers / Needs rework — and the <b>top 1–3 refactors by leverage</b>.</li></ul>
    <p>Can fan out into four lenses at once: <b>VSA · SOLID · stack · Simplify</b>.</p>`,
  },
  REFACTOR: {
    kicker: "Apply refactors",
    title: "Refactor, then re-review",
    c: "--refactor",
    bodyHtml: `
    <p>Take the review's top 1–3 refactors — the biggest complexity <i>deletes</i> first — apply them, then send it back through the review.</p>
    <p>This is the loop's turn of the crank: keep cycling until the signal reads <b>Ready</b>.</p>`,
  },
  FINISH: {
    kicker: "/finish-feature",
    title: "Close it out",
    c: "--finish",
    bodyHtml: `
    <p>Runs in order, honestly:</p>
    <ul><li>The repo's <b>test command</b> — report exact counts; failing = not finished.</li>
    <li>Rebase onto the fresh default branch.</li>
    <li>Spec + issue reflect shipped vs. remaining (follow-ups as issues).</li>
    <li>One <code>changelog.d/</code> fragment — never edit <code>CHANGELOG.md</code> on the branch.</li>
    <li><b>Crucible — do not skip:</b> run <code>/crucible-&lt;stack&gt;</code>, remediate 🔴/🟠 until <b>Ready</b>.</li>
    <li>Open the PR: <b>Summary · Remaining · Verification · Operator actions</b> — crucible + remediations go in Verification.</li></ul>`,
  },
  MERGE: {
    kicker: "/merge-pr",
    title: "Review & merge",
    c: "--merge",
    bodyHtml: `
    <p>The operator's side of the handshake — <b>nothing merges without you</b>. Finish (or night-shift) leaves an open PR; this skill lands it:</p>
    <ul><li><b>Triage first</b> — CI status, the crucible signal + test counts in the PR's Verification section, diff size. Most loop PRs merge on review alone.</li>
    <li><b>Checkout owed?</b> Fastest: <code>gh pr checkout &lt;n&gt;</code>. Isolated: fetch <code>pull/&lt;n&gt;/head</code> into a <b>throwaway worktree</b>, run the repo's test command, remove it.</li>
    <li><b>Manual test owed?</b> If it runs locally, launch the app from that worktree (the repo's <b>Manual smoke</b> config) — the skill preps the click-path, <b>you do the clicking</b>, merge stays <code>Closes #</code>. Live-only (hardware, brokers)? Merge <code>Refs #</code> → <b>Verifying</b>.</li>
    <li><b>Squash, always</b> — one issue = one commit on the default branch: <code>gh pr merge --squash --delete-branch</code>. The PR body (with <code>Closes #</code>) becomes the commit message.</li>
    <li>Confirm the board moved; prune the local worktree + branch.</li></ul>`,
  },
  DONE: {
    kicker: "Merged",
    title: "Done",
    c: "--done",
    bodyHtml: `
    <p>PR body says <code>Closes #&lt;issue&gt;</code>; on merge the board workflow moves it to <b>Done</b>.</p>
    <p>If a live retest was owed, you go through <b>Verifying</b> first (see that node).</p>`,
  },
  CONSULT: {
    kicker: "Decision fork",
    title: "Consult before implementing",
    c: "--consult",
    bodyHtml: `
    <p>For scoped/complex work, the skill surfaces <b>2–3 viable mechanisms</b>, their costs, and the silent breakages of each — and recommends one.</p>
    <p><b>You decide.</b> Trivial work skips this and goes straight to build.</p>`,
  },
  BLOCKED: {
    kicker: "Board state",
    title: "Blocked",
    c: "--blocked",
    bodyHtml: `
    <p>Can't finish yet because of an <b>external dependency</b> (hardware, a broker, a third-party, someone else's PR).</p>
    <p>Status → <b>Blocked</b> so it's visible on the board; resume into Implement once it clears.</p>`,
  },
  VERIFY: {
    kicker: "Board state",
    title: "Verifying",
    c: "--verify",
    bodyHtml: `
    <p>Merged, but a <b>live / integration retest is owed</b>. The PR uses <code>Refs #&lt;issue&gt;</code> (not <code>Closes</code>) so merge doesn't auto-close it.</p>
    <p>After live confirmation → move to <b>Done</b>.</p>`,
  },
  DOCS: {
    kicker: "/update-docs",
    title: "The router",
    c: "--docs",
    bodyHtml: `
    <p>Answers one question: <b>where does this go?</b></p>
    <ul><li>New <b>work</b> → a GitHub issue on the board (never a markdown tracker).</li>
    <li>Design <b>intent</b> → <code>docs/specs/</code> or <code>DECISIONS.md</code>.</li>
    <li>History → <code>changelog.d/</code>.</li></ul>
    <p>Keeps a surfaced bug from hijacking the current branch.</p>`,
  },
  BUG: {
    kicker: "Captured",
    title: "Bug issue",
    c: "--bug",
    bodyHtml: `
    <p>A defect found mid-work becomes its <b>own Bug issue</b>, linked to what you were doing (<i>"Found while working #N"</i>) — then you <b>keep going</b> on the current branch.</p>`,
  },
  EPIC: {
    kicker: "Fan-out",
    title: "Epic + sub-issues",
    c: "--epic",
    bodyHtml: `
    <p>A multi-stream initiative becomes an <b>Epic</b> with sub-issues. Start one sub-issue via <code>/start-feature</code>.</p>
    <p>This is your <b>parallelism primitive</b>: each sub-issue is an independent slice in its own worktree, so several can be in flight at once without stepping on each other.</p>`,
  },
};

export const FLOWS: Record<string, FlowDef> = {
  everything: {
    label: "Everything",
    descHtml:
      "<b>Everything.</b> All flows at once — the full orchestration surface. Pick one to isolate it.",
    nodes: null,
    edges: null,
  },
  happy: {
    label: "Happy path",
    descHtml:
      "<b>Happy path.</b> start-feature → implement in the slice → review → finish-feature → merge-pr → Done. The clean straight line.",
    nodes: ["ORCH", "START", "IMPL", "REVIEW", "FINISH", "MERGE", "DONE"],
    edges: ["o-s", "s-i", "i-r", "r-f", "f-m", "m-d"],
  },
  merge: {
    label: "Merge a PR",
    descHtml:
      "<b>Merge a PR.</b> An open PR — yours or night-shift's — gets triaged (CI, crucible signal, diff), a throwaway-worktree test run if warranted, then a squash merge: one issue, one commit on the default branch. The board auto-moves to Done.",
    nodes: ["FINISH", "MERGE", "DONE"],
    edges: ["f-m", "m-d"],
  },
  loop: {
    label: "Review ↔ Refactor",
    descHtml:
      "<b>Review ↔ Refactor loop.</b> The engine. Review returns ranked refactors; you apply the top ones and re-review until the signal reads Ready — then hand to finish.",
    nodes: ["REVIEW", "REFACTOR", "FINISH"],
    edges: ["r-ref", "ref-r", "r-f"],
  },
  consult: {
    label: "Consult",
    descHtml:
      "<b>Consult at a fork.</b> On scoped/complex work the skill lays out 2–3 mechanisms with their costs; you make the call, then build.",
    nodes: ["START", "CONSULT", "IMPL"],
    edges: ["s-consult", "consult-i"],
  },
  bug: {
    label: "Bug mid-work",
    descHtml:
      "<b>Bug surfaces mid-work.</b> Route it through update-docs into its own linked Bug issue, then keep going — the current branch never gets derailed.",
    nodes: ["IMPL", "REVIEW", "DOCS", "BUG"],
    edges: ["i-docs", "r-docs", "docs-bug", "bug-impl"],
  },
  blocked: {
    label: "Blocked",
    descHtml:
      "<b>Blocked.</b> An external dependency stalls the work; mark it Blocked on the board and resume into implementation when it clears.",
    nodes: ["START", "BLOCKED", "IMPL"],
    edges: ["s-blocked", "blocked-i"],
  },
  verify: {
    label: "Verifying",
    descHtml:
      "<b>Verifying.</b> A live/integration retest is owed — PR uses Refs #issue, merges to Verifying, and only reaches Done after live confirmation.",
    nodes: ["FINISH", "MERGE", "VERIFY", "DONE"],
    edges: ["f-m", "m-verify", "verify-d"],
  },
  epic: {
    label: "Epic fan-out",
    descHtml:
      "<b>Epic fan-out.</b> A big initiative splits into sub-issues; each becomes an independent slice/worktree you can run in parallel. Your multitasking primitive.",
    nodes: ["ORCH", "EPIC", "START"],
    edges: ["o-epic", "epic-s"],
  },
  nightshift: {
    label: "🌙 Night shift",
    descHtml:
      "<b>🌙 Night shift (autonomous).</b> A scheduled task fires while you sleep: it picks an <code>auto:ready</code> issue and runs the full loop — but <b>stops at any real design fork</b> (leaving you a recommendation) and ends at an <b>open PR, never a merge</b>. You wake to a review queue.",
    nodes: ["ORCH", "START", "IMPL", "REVIEW", "REFACTOR", "FINISH"],
    edges: ["o-s", "s-i", "i-r", "r-ref", "ref-r", "r-f"],
  },
};

/** Chip accent per flow (CSS custom property name). */
export const FLOW_COLORS: Record<string, string> = {
  everything: "--orch",
  happy: "--start",
  loop: "--review",
  merge: "--merge",
  consult: "--consult",
  bug: "--docs",
  blocked: "--blocked",
  verify: "--verify",
  epic: "--epic",
  nightshift: "--orch",
};
