// #208 / #255: planner teaching surface must carry seat doctrine + label transitions
// + Planner-owned intake Monitor (not process/completion self-watch).
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

describe("Planner doctrine (#208 / #255)", () => {
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
    expect(text).toContain("board Monitor");
    expect(text).toContain("mortal");
    expect(text).toContain("re-arm");
    expect(text).toContain("#270");
    expect(text).toContain("#267");
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

  it("map copy teaches intake vs completion ownership (#255)", () => {
    expect(NODES.PLAN.bodyHtml).toMatch(/intake Monitor/i);
    expect(NODES.QUEUE.bodyHtml).toMatch(/intake Monitor/i);
    expect(NODES.HANDOFF.bodyHtml).toMatch(/completion/i);
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
