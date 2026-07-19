// #207: orchestrator copy must teach Planner labels, not retired auto:ready.
import { describe, expect, it } from "vitest";
import { FLOWS } from "./data";
import {
  NIGHT_SHIFT_ELIGIBILITY,
  PLANNER_ORCH_DOCTRINE,
  PROMPTS,
} from "./prompts";

function collectStrings(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectStrings).join("\n");
  if (value && typeof value === "object") {
    return Object.values(value).map(collectStrings).join("\n");
  }
  return "";
}

describe("Planner / night-shift eligibility labels (#207)", () => {
  it("retires auto:ready from orchestrator prompts and flow copy", () => {
    const corpus = [
      collectStrings(PROMPTS),
      collectStrings(FLOWS),
      PLANNER_ORCH_DOCTRINE,
      NIGHT_SHIFT_ELIGIBILITY,
    ].join("\n");
    expect(corpus).not.toContain("auto:ready");
    expect(corpus).toContain("night-shift:ready");
    expect(corpus).toContain("plan:ready");
    expect(corpus).toContain("needs:plan");
    expect(corpus).toContain("board Monitor");
  });

  it("keeps Claude and Cursor standing orders on the shared Planner doctrine", () => {
    const orchGroup = PROMPTS.find((g) => g.node === "ORCH");
    expect(orchGroup).toBeDefined();
    const withDoctrine = orchGroup!.items.filter((i) =>
      i.text.includes(PLANNER_ORCH_DOCTRINE)
    );
    expect(withDoctrine.length).toBeGreaterThanOrEqual(2);
  });
});
