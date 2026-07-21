// #209: Differences rows teach Planner-session truth for plan/execute routing.
import { describe, expect, it } from "vitest";
import { DIFFERENCES } from "./data";

function row(area: string) {
  const found = DIFFERENCES.find((r) => r.area === area);
  if (!found) throw new Error(`missing differences row: ${area}`);
  return found;
}

describe("differences Planner model routing (#209)", () => {
  it("routing row owns session split; knobs stay on the model-choice row", () => {
    const routing = row("Plan-model / execute-model routing");
    expect(routing.claudeCode).toContain("standing Planner on Fable");
    expect(routing.claudeCode).toContain("plan:ready");
    expect(routing.claudeCode).toContain("night-shift:ready");
    expect(routing.claudeCode).toContain("orchestrator is not the planning seat");
    expect(routing.claudeCode).not.toContain("the orchestrator plans on its");
    expect(routing.claudeCode).not.toContain("settings.local.json");
    expect(routing.claudeCode).not.toContain("spawn_task");
    expect(routing.note).toMatch(/Planner session = plan model/i);
  });

  it("model-choice row owns knobs only", () => {
    const knobs = row("Where the model choice lives");
    expect(knobs.claudeCode).toContain("Planner seat:");
    expect(knobs.claudeCode).toContain("settings.local.json");
    expect(knobs.claudeCode).toContain("spawn_task");
    expect(knobs.claudeCode).not.toContain("plan:ready");
    expect(knobs.cursor).toContain("per-conversation");
    expect(knobs.cursor).toContain("model dropdown");
    expect(knobs.note).toMatch(/not via orchestrator/i);
  });
});
