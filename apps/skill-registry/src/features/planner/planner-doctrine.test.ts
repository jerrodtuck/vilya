// #208 / #255 / #261 / #267: planner teaching surface must carry seat doctrine +
// label transitions + Planner-owned intake + orch standing plan:ready poller.
import { describe, expect, it } from "vitest";
import { FLOWS, NODES } from "./data";
import { PLANNER_NEEDS_PLAN_INTAKE_GUIDE, PROMPTS } from "./prompts";

function collectStrings(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectStrings).join("\n");
  if (value && typeof value === "object") {
    return Object.values(value).map(collectStrings).join("\n");
  }
  return "";
}

describe("Planner doctrine (#208 / #255 / #261 / #267)", () => {
  it("standing orders teach one seat, Fable, labels, and never-execute", () => {
    const standing = PROMPTS.find((g) => g.node === "PLAN");
    expect(standing?.wide).toBe(true);
    const text = standing?.items.map((i) => i.text).join("\n") ?? "";
    expect(text).toMatch(/Fable/i);
    expect(text).toContain("needs:plan");
    expect(text).toContain("plan:ready");
    expect(text).toMatch(/never implement/i);
    expect(text).toMatch(/never dispatch/i);
    expect(text).toMatch(/never merge/i);
    expect(text).toContain("orch owns plan:ready/active completion");
    expect(text).toContain("mortal");
    expect(text).toContain("re-arm");
    expect(text).toContain("#270");
    expect(text).toContain("#267");
    expect(text).toContain("board-intake.md");
  });

  it("standing orders require intake Monitor when idle (#255)", () => {
    const standing = PROMPTS.find((g) => g.node === "PLAN");
    const text = standing?.items.map((i) => i.text).join("\n") ?? "";
    expect(text).toContain("Planner owns needs:plan intake");
    expect(text).toContain("30/120/120/300/300/600");
    expect(text).toContain("Newly actionable work resets");
    expect(text).toContain("notify_on_output");
    expect(text).toContain("Monitor tool");
    expect(text).toMatch(/process\/completion self-watches/i);
    expect(text).not.toContain("never arm monitors");
  });

  it("standing orders persist one intake poller across drains (#267)", () => {
    const standing = PROMPTS.find((g) => g.node === "PLAN");
    const text = standing?.items.map((i) => i.text).join("\n") ?? "";
    expect(text).toMatch(/running across drains/i);
    expect(text).toMatch(/do not kill\/re-arm/i);
    expect(text).toContain("Keep pending, emitted and consumed separate");
    expect(text).toMatch(/#270/);
    expect(text).toContain("orch owns plan:ready/active completion");
    expect(NODES.QUEUE.bodyHtml).toMatch(/across drains/i);
    expect(NODES.QUEUE.bodyHtml).toMatch(/kill\/re-arm/i);
    const handoff = PROMPTS.find((g) => g.node === "HANDOFF");
    const handoffText = handoff?.items.map((i) => i.text).join("\n") ?? "";
    expect(handoffText).toMatch(/across drains/i);
    expect(handoffText).toMatch(/standing plan:ready poller/i);
  });

  it("map copy teaches intake vs standing orch poller ownership (#255/#261)", () => {
    expect(NODES.PLAN.bodyHtml).toMatch(/intake Monitor/i);
    expect(NODES.QUEUE.bodyHtml).toMatch(/intake Monitor/i);
    expect(NODES.HANDOFF.bodyHtml).toMatch(/standing.*plan:ready.*poller/i);
    expect(NODES.HANDOFF.bodyHtml).toMatch(/reinforcement/i);
    expect(NODES.HANDOFF.bodyHtml).toMatch(/intake/i);
    expect(NODES.PLAN.bodyHtml).not.toContain("never arm monitors");
  });

  it("map copy never revives auto:ready", () => {
    const corpus = [collectStrings(PROMPTS), collectStrings(FLOWS), collectStrings(NODES)].join(
      "\n",
    );
    expect(corpus).not.toContain("auto:ready");
    expect(corpus).toContain("night-shift:ready");
  });
});

describe("Adaptive host procedure for needs:plan intake (#380)", () => {
  it("standing orders explicitly ban gh issue list --json alongside gh pr list", () => {
    const standing = PROMPTS.find((g) => g.node === "PLAN");
    const text = standing?.items.map((i) => i.text).join("\n") ?? "";
    expect(text).toContain("never hot-poll Projects/GraphQL");
  });

  it("PLANNER_NEEDS_PLAN_INTAKE_GUIDE links the shared adaptive intake procedure", () => {
    for (const term of ["initial reconciliation", "30/120/120/300/300/600", "Retry-After", "vilya-handoff-ack:v1", "complete pagination", "Silent unchanged"]) expect(PLANNER_NEEDS_PLAN_INTAKE_GUIDE).toContain(term);
    expect(PLANNER_NEEDS_PLAN_INTAKE_GUIDE).not.toContain("sleep 150");
  });

  it("the PLAN standing-orders group carries the shared host procedure", () => {
    const standing = PROMPTS.find((g) => g.node === "PLAN");
    expect(standing).toBeDefined();
    const card = standing!.items.find((i) =>
      i.label.startsWith("Standing needs:plan intake")
    );
    expect(card).toBeDefined();
    expect(card!.text.startsWith(PLANNER_NEEDS_PLAN_INTAKE_GUIDE)).toBe(true);
  });
});
