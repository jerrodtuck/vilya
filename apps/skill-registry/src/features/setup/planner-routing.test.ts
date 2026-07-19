// #209: Setup teaches Planner-session model routing, not orchestrator-as-planner.
import { describe, expect, it } from "vitest";
import {
  AUTONOMY_LABELS,
  PLAN_EXECUTE_BLOCKS,
  PLAN_EXECUTE_INTRO,
} from "./plan-execute-routing";

function corpus(): string {
  return [PLAN_EXECUTE_INTRO, ...PLAN_EXECUTE_BLOCKS.flatMap((b) => [b.title ?? "", b.body])].join(
    "\n",
  );
}

describe("setup Planner model routing (#209)", () => {
  it("lists Planner autonomy labels and retires auto:ready", () => {
    expect([...AUTONOMY_LABELS]).toEqual([
      "needs:plan",
      "plan:ready",
      "night-shift:ready",
      "needs:decision",
    ]);
    expect(corpus()).not.toContain("auto:ready");
    expect(corpus()).toContain("plan:ready");
    expect(corpus()).toContain("night-shift:ready");
  });

  it("teaches Planner session as the plan seat, not orchestrator /model", () => {
    const text = corpus();
    expect(text).toContain("Planner session is the plan seat");
    expect(text).toContain("[Planner](/planner)");
    expect(text).toContain("not the planning seat");
    expect(text).toContain("plan:ready");
    expect(text).toContain("night-shift:ready");
    expect(text).not.toContain("Fable plans → Sonnet executes");
    expect(text).not.toContain("planning happens orchestrator-side");
  });
});
