// #223: Cursor orchestrator teaches REST + notify_on_output, not GraphQL polls.
import { describe, expect, it } from "vitest";
import {
  CURSOR_DISPATCH_MONITOR,
  HOST_MONITOR_MECHANISMS,
  PLANNER_ORCH_DOCTRINE,
  PROMPTS,
} from "./prompts";

function orchItem(label: string) {
  const orch = PROMPTS.find((g) => g.node === "ORCH");
  expect(orch).toBeDefined();
  const item = orch!.items.find((i) => i.label === label);
  if (!item) throw new Error(`missing ORCH item: ${label}`);
  return item.text;
}

describe("Cursor REST chip monitor (#223)", () => {
  it("exports the Cursor dispatch monitor recipe on REST + notify_on_output", () => {
    expect(CURSOR_DISPATCH_MONITOR).toContain("notify_on_output");
    expect(CURSOR_DISPATCH_MONITOR).toContain("gh pr list");
    expect(CURSOR_DISPATCH_MONITOR).toContain("gh api repos/");
    expect(CURSOR_DISPATCH_MONITOR).toContain("issues/<N>/comments");
    expect(CURSOR_DISPATCH_MONITOR).toMatch(/~every 90s|~90s/);
    expect(CURSOR_DISPATCH_MONITOR).toContain("wake sentinel");
    expect(CURSOR_DISPATCH_MONITOR).toContain("never gh project item-list");
    expect(CURSOR_DISPATCH_MONITOR).toContain("no Claude Monitor tool");
    expect(CURSOR_DISPATCH_MONITOR).toContain("exit-only");
    expect(CURSOR_DISPATCH_MONITOR).toContain("In Progress");
  });

  it("Cursor standing orders compose the dispatch monitor constant", () => {
    const text = orchItem("Cursor — orchestrator kickoff (no comms layer)");
    expect(text).toContain(CURSOR_DISPATCH_MONITOR);
    expect(text).toContain(PLANNER_ORCH_DOCTRINE);
  });

  it("Claude orchestrator keeps the Monitor tool and clarifies exit-only loops", () => {
    const text = orchItem("Claude Code — orchestrator · spawn_task chips");
    const dispatch = text.slice(text.indexOf("In the same turn as every chip dispatch"));
    expect(dispatch).toContain("Monitor tool");
    expect(dispatch).toContain("exit-only background shell watch loop");
    // Shared Planner doctrine may name Cursor's mechanism; the Claude dispatch
    // paragraph itself must stay on the Monitor tool.
    expect(dispatch).not.toContain("notify_on_output");
    expect(dispatch).not.toContain("gh project item-list");
  });

  it("shared Planner doctrine names both host monitor mechanisms", () => {
    expect(HOST_MONITOR_MECHANISMS).toContain("Monitor tool");
    expect(HOST_MONITOR_MECHANISMS).toContain("notify_on_output");
    expect(HOST_MONITOR_MECHANISMS).toContain("never gh project item-list");
    expect(PLANNER_ORCH_DOCTRINE).toContain(HOST_MONITOR_MECHANISMS);
  });
});
