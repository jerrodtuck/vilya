// Feature slice: overview — domain data for the "board moves itself" section.
// Ground truth: epic #169's mover map (canon + live board, verified 2026-07-18).
// Column descriptions are the live board's, verbatim (Project #8, jerrodtuck,
// read via the Projects GraphQL API) — reuse, never paraphrase.

export type MoverClass = "skill" | "automation" | "human";

export type BoardColumn = {
  id: "todo" | "inprog" | "blk" | "ver" | "dn";
  label: string;
  /** Verbatim Status option description from the live board. */
  description: string;
};

export type BoardTransition = {
  from: string;
  to: string;
  moverClass: MoverClass;
  /** Who/what performs the move, per the epic's mover map. */
  mover: string;
};

export const BOARD_COLUMNS: readonly BoardColumn[] = [
  {
    id: "todo",
    label: "Todo",
    description: "This item hasn't been started",
  },
  {
    id: "inprog",
    label: "In Progress",
    description: "This is actively being worked on",
  },
  {
    id: "blk",
    label: "Blocked",
    description:
      "Waiting on an external dependency — approval, upstream fix, a decision, or environment access. Work can't proceed yet.",
  },
  {
    id: "ver",
    label: "Verifying",
    description:
      "Code merged; awaiting a live test that needs to be performed by a human in the loop. Close to Done only once live-confirmed.",
  },
  {
    id: "dn",
    label: "Done",
    description: "This has been completed",
  },
];

export const BOARD_TRANSITIONS: readonly BoardTransition[] = [
  {
    from: "issue created",
    to: "Todo",
    moverClass: "automation",
    mover: "board automation — Auto-add + Item added → Todo",
  },
  {
    from: "Todo",
    to: "In Progress",
    moverClass: "skill",
    mover: "/start-feature",
  },
  {
    from: "In Progress",
    to: "Blocked",
    moverClass: "skill",
    mover:
      "skill / night-shift at a real fork (needs:decision) or external dependency",
  },
  {
    from: "Blocked",
    to: "In Progress",
    moverClass: "skill",
    mover:
      "skill, when the dependency clears (Item reopened → In Progress automation as backstop)",
  },
  {
    from: "PR merged (Closes #)",
    to: "Done",
    moverClass: "automation",
    mover: "board automation — PR merged → Done",
  },
  {
    from: "merge (Refs #, live-only)",
    to: "Verifying",
    moverClass: "skill",
    mover: "/merge-pr",
  },
  {
    from: "Verifying",
    to: "Done",
    moverClass: "human",
    mover:
      "the human, live smoke confirmed — the only manual Status move in the system",
  },
];
