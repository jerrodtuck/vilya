// #223 / #233 / #270: Cursor orchestrator teaches REST + notify_on_output, not GraphQL polls;
// Cursor shells are mortal — re-arm, do not thrash every drain.
import { describe, expect, it } from "vitest";
import { CURSOR_ORCH_PROMPT_LABEL } from "./cursor-dispatch";
import {
  CURSOR_DISPATCH_MONITOR,
  CURSOR_SHELL_TEARDOWN_DOCTRINE,
  GRAPHQL_QUOTA_DOCTRINE,
  HOST_MONITOR_MECHANISMS,
  ORCH_PLAN_READY_POLLER,
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
    expect(CURSOR_DISPATCH_MONITOR).toMatch(/≥120s|>=120s/);
    expect(CURSOR_DISPATCH_MONITOR).toContain("not 60s / not ~90s");
    expect(CURSOR_DISPATCH_MONITOR).toContain("wake sentinel");
    expect(CURSOR_DISPATCH_MONITOR).toContain("never re-announce a standing open PR");
    expect(CURSOR_DISPATCH_MONITOR).toContain("never gh project item-list");
    expect(CURSOR_DISPATCH_MONITOR).toContain("do not use gh pr list");
    expect(CURSOR_DISPATCH_MONITOR).toContain("no Claude Monitor tool");
    expect(CURSOR_DISPATCH_MONITOR).toContain("exit-only");
    expect(CURSOR_DISPATCH_MONITOR).toContain("In Progress");
    expect(CURSOR_DISPATCH_MONITOR).toContain("GraphQL quota hygiene above");
    expect(CURSOR_DISPATCH_MONITOR).not.toMatch(/Watch REST only: gh pr list/);
    expect(CURSOR_DISPATCH_MONITOR).not.toMatch(/poll ~every 90s|lean REST at ~90s/);
  });

  it("Cursor standing orders compose the dispatch monitor constant", () => {
    const text = orchItem(CURSOR_ORCH_PROMPT_LABEL);
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
    expect(dispatch).toMatch(/≥120s|>=120s/);
    expect(dispatch).toContain("wake only on change");
    expect(dispatch).toContain("not gh pr list");
    expect(dispatch).toContain("still never gh pr list");
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
    expect(ORCH_PLAN_READY_POLLER).toContain(HOST_MONITOR_MECHANISMS);
    expect(PLANNER_ORCH_DOCTRINE).toContain(HOST_MONITOR_MECHANISMS);
  });

  it("standing plan:ready poller recipe is REST + gain-only + not sole-enqueue (#261)", () => {
    expect(ORCH_PLAN_READY_POLLER).toContain("standing plan:ready poller");
    expect(ORCH_PLAN_READY_POLLER).toMatch(/≥120s|>=120s/);
    expect(ORCH_PLAN_READY_POLLER).toContain("label:plan:ready");
    expect(ORCH_PLAN_READY_POLLER).toContain("wake sentinel");
    expect(ORCH_PLAN_READY_POLLER).toContain("gains at least one issue number");
    expect(ORCH_PLAN_READY_POLLER).toContain("never re-announce the same standing set");
    expect(ORCH_PLAN_READY_POLLER).toContain("not the sole wake path");
    expect(ORCH_PLAN_READY_POLLER).toContain("Never monitor the Planner process or session");
    expect(ORCH_PLAN_READY_POLLER).toContain("Chip completion monitors stay per-dispatch");
    expect(ORCH_PLAN_READY_POLLER).toMatch(/Intake polling for needs:plan is Planner-owned/i);
    expect(PLANNER_ORCH_DOCTRINE).toContain(ORCH_PLAN_READY_POLLER);
  });

  it("Cursor shell teardown doctrine teaches mortal shells + re-arm without drain thrash (#270)", () => {
    expect(CURSOR_SHELL_TEARDOWN_DOCTRINE).toContain("mortal");
    expect(CURSOR_SHELL_TEARDOWN_DOCTRINE).toContain("re-arm");
    expect(CURSOR_SHELL_TEARDOWN_DOCTRINE).toContain("arm-once-and-forget");
    expect(CURSOR_SHELL_TEARDOWN_DOCTRINE).toContain("#267");
    expect(CURSOR_SHELL_TEARDOWN_DOCTRINE).toContain("kill/re-arm after every successful drain");
    expect(CURSOR_SHELL_TEARDOWN_DOCTRINE).toContain("process-lifetime parity");
    expect(CURSOR_DISPATCH_MONITOR).toContain(CURSOR_SHELL_TEARDOWN_DOCTRINE);
    expect(ORCH_PLAN_READY_POLLER).toContain(CURSOR_SHELL_TEARDOWN_DOCTRINE);
    expect(PLANNER_ORCH_DOCTRINE).toContain(CURSOR_SHELL_TEARDOWN_DOCTRINE);
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
    const cursor = orchItem(CURSOR_ORCH_PROMPT_LABEL);
    expect(claude).toContain(GRAPHQL_QUOTA_DOCTRINE);
    expect(cursor).toContain(GRAPHQL_QUOTA_DOCTRINE);
  });
});
