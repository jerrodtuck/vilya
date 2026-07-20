// #208: planner teaching surface must carry seat doctrine + label transitions.
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

describe("Planner doctrine (#208)", () => {
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

  it("map copy never revives auto:ready", () => {
    const corpus = [collectStrings(PROMPTS), collectStrings(FLOWS), collectStrings(NODES)].join(
      "\n",
    );
    expect(corpus).not.toContain("auto:ready");
    expect(corpus).toContain("night-shift:ready");
  });
});
