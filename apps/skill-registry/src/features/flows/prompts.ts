// Feature slice: flows — the orchestrator prompt library as structured data.
// Methodology content, defined once; rendered in the library grid and in each
// node's detail drawer.

export interface PromptItem {
  label: string;
  text: string;
}

export interface PromptGroup {
  /** Map node id this group belongs to (drawer), or a standalone group. */
  node: string;
  group: string;
  /** CSS custom property used as the group's accent color. */
  c: string;
  wide?: boolean;
  items: PromptItem[];
}

export const PROMPTS: PromptGroup[] = [
  {
    node: "ORCH",
    group: "Standing orders — paste once per session",
    c: "--orch",
    wide: true,
    items: [
      {
        label: "Session kickoff",
        text: "You're my implementation partner on this .NET / Blazor repo. House rules: vertical-slice architecture, outcome-oriented SOLID, one issue = one branch = one worktree. Track all new work as GitHub issues on the board — never markdown trackers. At any real design fork, stop and give me 2–3 options with costs before implementing. Hold the crucible review bar and report progress honestly.",
      },
    ],
  },
  {
    node: "START",
    group: "/start-feature",
    c: "--start",
    items: [
      {
        label: "New brief",
        text: "Start on: <brief>. Create the issue, add it to the board, branch feat/<n>-slug, and give me the verify plan before you build. Consult me at any fork.",
      },
      {
        label: "Existing issue",
        text: "Pick up issue #<N> — set up the worktree and read the owning slice before you touch anything.",
      },
      {
        label: "Just go",
        text: "Work the next thing on the board — tell me which issue you're taking and why.",
      },
    ],
  },
  {
    node: "CONSULT",
    group: "Consult at a fork",
    c: "--consult",
    items: [
      {
        label: "Force the fork",
        text: "Before implementing, surface 2–3 viable mechanisms with their costs and silent breakages, recommend one, and wait for my call.",
      },
    ],
  },
  {
    node: "IMPL",
    group: "Implement in the slice",
    c: "--impl",
    items: [
      {
        label: "Guardrails",
        text: "Build it in the owning slice only — shared kernel stays contracts/ports, no ProjectReference into a sibling product. Flag it if this wants to push a file past ~1k lines.",
      },
    ],
  },
  {
    node: "REVIEW",
    group: "crucible review",
    c: "--review",
    items: [
      {
        label: "Full review",
        text: "Crucible review of the current branch. Refactor-oriented: severity-tagged findings each with the fix, then close with the top 1–3 refactors by leverage and a merge-readiness signal.",
      },
      {
        label: "Parallel lenses",
        text: "Run VSA, SOLID, Blazor, and simplification as separate lenses over this diff, then merge the findings into one ranked list.",
      },
      {
        label: "Just the gate",
        text: "Is this Ready to merge, Ready after blockers, or Needs rework? Give me only the blockers first.",
      },
    ],
  },
  {
    node: "REFACTOR",
    group: "Refactor loop",
    c: "--refactor",
    items: [
      {
        label: "Turn the crank",
        text: "Apply the top refactors from that review, then re-review. Loop until the signal reads Ready, then stop and show me the diff.",
      },
    ],
  },
  {
    node: "DOCS",
    group: "/update-docs",
    c: "--docs",
    items: [
      { label: "Route it", text: "Where does this go? <thing>" },
      {
        label: "Capture a bug",
        text: "Capture this as its own linked bug and keep going on the current branch: <desc>.",
      },
      {
        label: "Log a decision",
        text: "Log this design decision and reference it from the issue: <decision>.",
      },
    ],
  },
  {
    node: "FINISH",
    group: "/finish-feature",
    c: "--finish",
    items: [
      {
        label: "Ship it",
        text: "Finish the feature — run the suites and report exact counts, rebase onto the default branch, write the changelog fragment, and open the PR that Closes #<N>.",
      },
      {
        label: "Live retest owed",
        text: "Wrap it up, but a live retest is owed: open the PR with Refs #<N> and move it to Verifying instead of Done.",
      },
    ],
  },
  {
    node: "VERIFY",
    group: "Verifying → Done",
    c: "--verify",
    items: [
      {
        label: "Confirm live",
        text: "Live retest passed on #<N> — move it to Done and close it out.",
      },
    ],
  },
  {
    node: "BLOCKED",
    group: "Blocked",
    c: "--blocked",
    items: [
      {
        label: "Mark blocked",
        text: "This is blocked on <external dep>. Mark it Blocked on the board with a one-line note, and tell me what unblocks it.",
      },
    ],
  },
  {
    node: "EPIC",
    group: "Epic fan-out (parallel)",
    c: "--epic",
    items: [
      {
        label: "Split it up",
        text: "This is multi-stream: create an Epic with sub-issues for <A>, <B>, <C>, then start the first sub-issue.",
      },
      {
        label: "Fan out more",
        text: "Spin up the next sub-issues under epic #<N> and give me a one-line status for each.",
      },
    ],
  },
  {
    node: "NIGHT",
    group: "🌙 Night shift (manual runner)",
    c: "--orch",
    items: [
      {
        label: "1 · Mark an issue safe for unattended work",
        text: "Label issue #<N> auto:ready — it's specified well enough to run overnight without me.",
      },
      {
        label: "2 · Fire tonight's run (shell command, not a prompt)",
        text: "gh workflow run night-shift --repo <owner>/<repo>",
      },
      {
        label: "3 · Morning triage",
        text: "Show me last night's night-shift report: which PRs are open and Ready, what needs my decision, and what got stuck.",
      },
      {
        label: "Reference — the standing prompt baked into the workflow",
        text: "Run the night-shift skill on <owner>/<repo>. Take up to 3 auto:ready issues; run each through implement → crucible review → refactor-until-Ready → tests → open a PR. Stop at any real design fork and leave me a recommendation. Never merge. Post a morning report of PRs opened, decisions needed, and anything stuck.",
      },
    ],
  },
  {
    node: "HIST",
    group: "history (read-only recall)",
    c: "--consult",
    items: [
      {
        label: "Catch up on an issue",
        text: "History of #<N> — what have we tried, in order, and what happened each time.",
      },
      {
        label: "Catch up on a topic",
        text: "Catch me up on <area/topic>: find the related issues across open and closed, and give me the chronological what-we-tried.",
      },
      {
        label: "Before restarting work",
        text: "Before I pick this back up — what did we do last on <topic>, and did any approach get reverted or superseded?",
      },
    ],
  },
];

export function promptsForNode(nodeId: string): PromptGroup | undefined {
  return PROMPTS.find((g) => g.node === nodeId);
}
