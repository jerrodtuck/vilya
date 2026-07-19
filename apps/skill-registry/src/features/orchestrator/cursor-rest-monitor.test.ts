// #223 / #233: Cursor orchestrator teaches REST + notify_on_output, not GraphQL polls.
import { describe, expect, it } from "vitest";
import {
  CURSOR_DISPATCH_MONITOR,
  GRAPHQL_QUOTA_DOCTRINE,
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
    expect(CURSOR_DISPATCH_MONITOR).toContain("pulls?head=");
    expect(CURSOR_DISPATCH_MONITOR).toContain("gh api repos/");
    expect(CURSOR_DISPATCH_MONITOR).toContain("issues/<N>/comments");
    expect(CURSOR_DISPATCH_MONITOR).toMatch(/~every 90s|~90s/);
    expect(CURSOR_DISPATCH_MONITOR).toContain("wake sentinel");
    expect(CURSOR_DISPATCH_MONITOR).toContain("never gh project item-list");
    expect(CURSOR_DISPATCH_MONITOR).toContain("do not use gh pr list");
    expect(CURSOR_DISPATCH_MONITOR).toContain("no Claude Monitor tool");
    expect(CURSOR_DISPATCH_MONITOR).toContain("exit-only");
    expect(CURSOR_DISPATCH_MONITOR).toContain("In Progress");
    expect(CURSOR_DISPATCH_MONITOR).toContain("GraphQL quota hygiene above");
    expect(CURSOR_DISPATCH_MONITOR).not.toMatch(/Watch REST only: gh pr list/);
  });

  it("Cursor standing orders compose the dispatch monitor constant", () => {
    const text = orchItem("Cursor — orchestrator kickoff (no comms layer)");
    expect(text).toContain(CURSOR_DISPATCH_MONITOR);
    expect(text).toContain(PLANNER_ORCH_DOCTRINE);
    expect(text).toContain(GRAPHQL_QUOTA_DOCTRINE);
  });

  it("Claude orchestrator keeps the Monitor tool and clarifies exit-only loops", () => {
    const text = orchItem("Claude Code — orchestrator · spawn_task chips");
    const dispatch = text.slice(text.indexOf("In the same turn as every chip dispatch"));
    expect(dispatch).toContain("Monitor tool");
    expect(dispatch).toContain("exit-only background shell watch loop");
    expect(dispatch).toContain("pulls?head=");
    // Shared Planner doctrine may name Cursor's mechanism; the Claude dispatch
    // paragraph itself must stay on the Monitor tool.
    expect(dispatch).not.toContain("notify_on_output");
    expect(dispatch).not.toContain("gh project item-list");
  });

  it("shared Planner doctrine names both host monitor mechanisms", () => {
    expect(HOST_MONITOR_MECHANISMS).toContain("Monitor tool");
    expect(HOST_MONITOR_MECHANISMS).toContain("notify_on_output");
    expect(HOST_MONITOR_MECHANISMS).toContain("never gh project item-list");
    expect(HOST_MONITOR_MECHANISMS).toContain("gh pr list is GraphQL");
    expect(PLANNER_ORCH_DOCTRINE).toContain(HOST_MONITOR_MECHANISMS);
  });
});

describe("GraphQL quota hygiene (#233)", () => {
  it("exports shared doctrine covering bucket, skip-when-zero, and main-clone worker", () => {
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("share one user GraphQL bucket");
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("graphql.remaining == 0");
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("never poll gh project item-list");
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("pulls?head=");
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("gh pr list is GraphQL");
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("main-clone cursor-agent-worker");
    expect(GRAPHQL_QUOTA_DOCTRINE).toContain("measure drain rate");
  });

  it("Claude and Cursor standing orders both compose the quota doctrine", () => {
    const claude = orchItem("Claude Code — orchestrator · spawn_task chips");
    const cursor = orchItem("Cursor — orchestrator kickoff (no comms layer)");
    expect(claude).toContain(GRAPHQL_QUOTA_DOCTRINE);
    expect(cursor).toContain(GRAPHQL_QUOTA_DOCTRINE);
  });
});
