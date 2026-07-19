// Feature slice: architect — the architect prompt library as structured data.
// Methodology content, defined once; rendered in the library grid and in
// each node's detail drawer. Types live in the shared flow-map component
// (src/shared/ui/flow-map-types.ts) since orchestrator's library conforms
// to the same shapes.
//
// The "Claude Code + Cursor — Product Architect" card below was moved here
// from features/orchestrator/prompts.ts (#123/#127/#129) — not copied. Its
// first paragraph was then revised for the cardinality correction (#148:
// one architect seat per product board, not per repo / all repos), so it is
// no longer byte-identical to the moved original. It's the only
// standing-orders card this page carries.

import type { PromptGroup } from "@/shared/ui/flow-map-types";
import { SKILL_SLUGS } from "../../shared/skills/invokes";

export const PROMPTS: PromptGroup[] = [
  {
    node: "ARCH",
    group: "Standing orders — paste once per session",
    c: "--arch",
    wide: true,
    items: [
      {
        // Ungraduated seat (#224) — paste-only until /vilya-architect ships.
        label: "Claude Code + Cursor — Product Architect",
        text: `You're the Product Architect for this product board — you decide and document product direction and architecture. One architect seat per product board: this session spans every repo on this product's board and no other product's — direction is product-local; what's shared across products is the process itself, and that belongs to the Dev Loop system, not to any seat (the orchestrator, by contrast, is one per repo). You never implement, never dispatch chips, never merge. Your output is issues on the board, ADRs (logged in DECISIONS.md and on the owning issue), and specs — the orchestrator picks up what you produce; nothing you write turns into running code in this session.

Recall: /vilya-history for the what-we-tried-in-order on any issue or topic; grep DECISIONS.md for prior calls — never load the whole file; board archaeology via gh (Done by area, epics, resolved needs:decision forks). Ground truth: a read-only code survey gives you as-built; docs/VISION.md and the specs give you as-intended — say which one a claim rests on, and treat any gap between them as a finding. Deep research runs under the honesty bar: primary source or directly tested, or it's labeled unverified — never asserted.

Guardrails: at every real design fork, 2–3 options with costs and a stated recommendation (with its reasoning) — the operator still decides. Every claim carries its evidence class (verified / tested / unverified). Specs carry Created / Last updated. Epic fan-out stops at the board — dispatch is the orchestrator's, not yours. Standing orders are a menu: this card is for direction/architecture sessions only — pick the one card matching the session's role, never stack cards.`,
      },
    ],
  },
  {
    node: "RECALL",
    group: "Recall before you propose",
    c: "--recall",
    items: [
      {
        label: "Catch up on an issue",
        skill: SKILL_SLUGS.history,
        text: "History of #<N> — what have we tried, in order, and what happened each time.",
      },
      {
        label: "Check for a prior call",
        text: "Grep DECISIONS.md for any prior call on <topic> before I propose anything.",
      },
    ],
  },
  {
    node: "SURVEY",
    group: "Survey as-built vs intended",
    c: "--survey",
    items: [
      {
        label: "Ground truth check",
        skill: SKILL_SLUGS.productMap,
        text: "Run the /vilya-product-map skill — read-only survey of as-built (code layout, shipped history, board) vs as-intended (docs/VISION.md, specs, open epics). Every gap is a finding citing both sides with its evidence class.",
      },
    ],
  },
  {
    node: "RESEARCH",
    group: "Deep research",
    c: "--research",
    items: [
      {
        label: "Research a question",
        text: "Deep research on <question>. Every claim carries its evidence class — verified, tested, or unverified — never asserted past what you checked.",
      },
    ],
  },
  {
    node: "FORK",
    group: "Decision fork",
    c: "--fork",
    items: [
      {
        label: "Force the fork",
        text: "Before you decide anything here, surface 2–3 viable options with their costs and a stated recommendation. I'll make the call.",
      },
    ],
  },
  {
    node: "ADR",
    group: "Log the decision",
    c: "--adr",
    items: [
      {
        label: "Record it",
        skill: SKILL_SLUGS.adr,
        text: "Log this decision in DECISIONS.md and mirror it as a comment on issue #<N>: <decision + reasoning>.",
      },
    ],
  },
  {
    node: "SPEC",
    group: "Write the spec",
    c: "--spec",
    items: [
      {
        label: "New spec",
        text: "Write a spec for <feature/area> in docs/specs — Created/Last updated, design intent, not a task list.",
      },
    ],
  },
  {
    node: "EPIC",
    group: "Shape an epic",
    c: "--epic",
    items: [
      {
        label: "Fan it out",
        text: "This is multi-stream: create an Epic with sub-issues for <A>, <B>, <C>, and hand off to the orchestrator to dispatch.",
      },
    ],
  },
  {
    node: "HANDOFF",
    group: "Hand off to the orchestrator",
    c: "--handoff",
    items: [
      {
        label: "Close the session",
        text: "Architect session done — issues/ADRs/specs are on the board. Orchestrator picks it up from here; nothing here became code.",
      },
    ],
  },
];
