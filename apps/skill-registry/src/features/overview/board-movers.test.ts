// #171 acceptance: seven transitions, correct mover classes per epic #169's
// map, exactly one human move, column descriptions verbatim from the live
// board (Project #8, jerrodtuck — Status option descriptions via GraphQL).
import { describe, expect, it } from "vitest";
import { BOARD_COLUMNS, BOARD_TRANSITIONS } from "./board-movers";

describe("board columns", () => {
  it("carries the five Status columns in board order", () => {
    expect(BOARD_COLUMNS.map((c) => c.label)).toEqual([
      "Todo",
      "In Progress",
      "Blocked",
      "Verifying",
      "Done",
    ]);
  });

  it("reuses the live board's column descriptions verbatim", () => {
    expect(BOARD_COLUMNS.map((c) => c.description)).toEqual([
      "This item hasn't been started",
      "This is actively being worked on",
      "Waiting on an external dependency — approval, upstream fix, a decision, or environment access. Work can't proceed yet.",
      "Code merged; awaiting a live test that needs to be performed by a human in the loop. Close to Done only once live-confirmed.",
      "This has been completed",
    ]);
  });
});

describe("mover map (ground truth: epic #169)", () => {
  it("has exactly seven transitions", () => {
    expect(BOARD_TRANSITIONS).toHaveLength(7);
  });

  it("labels every transition with the epic's mover class", () => {
    expect(
      BOARD_TRANSITIONS.map((t) => [t.from, t.to, t.moverClass])
    ).toEqual([
      ["issue created", "Todo", "automation"],
      ["Todo", "In Progress", "skill"],
      ["In Progress", "Blocked", "skill"],
      ["Blocked", "In Progress", "skill"],
      ["PR merged (Closes #)", "Done", "automation"],
      ["merge (Refs #, live-only)", "Verifying", "skill"],
      ["Verifying", "Done", "human"],
    ]);
  });

  it("marks exactly one transition human: Verifying → Done", () => {
    const human = BOARD_TRANSITIONS.filter((t) => t.moverClass === "human");
    expect(human).toHaveLength(1);
    expect(human[0]).toMatchObject({ from: "Verifying", to: "Done" });
    expect(human[0].mover).toContain("the only manual Status move");
  });

  it("names a mover for every transition", () => {
    for (const t of BOARD_TRANSITIONS) {
      expect(t.mover.trim().length).toBeGreaterThan(0);
    }
  });
});
