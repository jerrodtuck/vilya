// #245: both orchestrator standing orders teach lab-runs-are-chips + no master commits.
import { describe, expect, it } from "vitest";
import { CURSOR_ORCH_PROMPT_LABEL } from "./cursor-dispatch";
import {
  LAB_RUNS_ARE_CHIPS_ASIDE,
  LAB_RUNS_ARE_CHIPS_DOCTRINE,
  PROMPTS,
} from "./prompts";

function orchItem(label: string) {
  const orch = PROMPTS.find((g) => g.node === "ORCH");
  expect(orch).toBeDefined();
  const item = orch!.items.find((i) => i.label === label);
  if (!item) throw new Error(`missing ORCH item: ${label}`);
  return item.text;
}

describe("Lab runs are chips (#245)", () => {
  it("exports shared doctrine covering lab chips, verify-the-claim, and no master commits", () => {
    expect(LAB_RUNS_ARE_CHIPS_DOCTRINE).toContain("Lab runs are chips");
    expect(LAB_RUNS_ARE_CHIPS_DOCTRINE).toContain("dispatch → monitor → verify-the-claim");
    expect(LAB_RUNS_ARE_CHIPS_DOCTRINE).toContain("isolation strategy");
    expect(LAB_RUNS_ARE_CHIPS_DOCTRINE).toContain("single-command state checks");
    expect(LAB_RUNS_ARE_CHIPS_DOCTRINE).toMatch(/never commit to the default branch/i);
    expect(LAB_RUNS_ARE_CHIPS_DOCTRINE).toContain("DECISIONS.md");
  });

  it("Claude and Cursor standing orders both compose the lab-runs doctrine", () => {
    const claude = orchItem("Claude Code — orchestrator · spawn_task chips");
    const cursor = orchItem(CURSOR_ORCH_PROMPT_LABEL);
    expect(claude).toContain(LAB_RUNS_ARE_CHIPS_DOCTRINE);
    expect(cursor).toContain(LAB_RUNS_ARE_CHIPS_DOCTRINE);
  });

  it("aside teaching stays glued to lab-runs / no-master intent", () => {
    expect(LAB_RUNS_ARE_CHIPS_ASIDE).toMatch(/lab\/live/i);
    expect(LAB_RUNS_ARE_CHIPS_ASIDE).toMatch(/master/i);
    expect(LAB_RUNS_ARE_CHIPS_ASIDE).toContain("dispatch → monitor → verify-the-claim");
  });
});
