// #208 / #255 / #261 / #267: planner teaching surface must carry seat doctrine +
// label transitions + Planner-owned intake + orch standing plan:ready poller.
import { describe, expect, it } from "vitest";
import { FLOWS, NODES } from "./data";
import { PROMPTS } from "./prompts";

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
    expect(text).toMatch(/standing plan:ready poller/i);
    expect(text).toContain("mortal");
    expect(text).toContain("re-arm");
    expect(text).toContain("#270");
    expect(text).toContain("#267");
    expect(text).toContain("#261");
  });

  it("standing orders require intake Monitor when idle (#255)", () => {
    const standing = PROMPTS.find((g) => g.node === "PLAN");
    const text = standing?.items.map((i) => i.text).join("\n") ?? "";
    expect(text).toMatch(/intake Monitor/i);
    expect(text).toMatch(/≥120s|>=120s/);
    expect(text).toMatch(/gains an issue/i);
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
    expect(text).toMatch(/last-seen\s*=\s*current set/i);
    expect(text).toMatch(/#270/);
    expect(text).toMatch(/standing plan:ready poller/i);
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
