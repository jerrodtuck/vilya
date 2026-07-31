// #319: planner kickoff authoring — never mark prior findings binding against measurement.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

const CONTEXT_ORDER =
  "direct measurement > dated ruling > record prose > recency/salience";

function plannerSkill(): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills/vl-plan/SKILL.md"),
    "utf8",
  );
}

describe("brief findings rebuttable by measurement — planner (#319)", () => {
  it("planner skill kickoff shape forbids binding priors against measurement", () => {
    const text = plannerSkill();
    expect(text).toContain("Prior findings vs measurement");
    expect(text).toContain('never** mark it binding against');
    expect(text).toContain(CONTEXT_ORDER);
    expect(text).toContain("§2c");
  });

  it("planner site cards teach priors stay rebuttable", () => {
    expect(NODES.WRITE.bodyHtml).toContain("never mark them binding");
    expect(NODES.WRITE.bodyHtml).toContain("direct measurement");
    const corpus = PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
    expect(corpus).toContain("never mark them binding against the chip's direct measurement");
    expect(corpus).toContain(CONTEXT_ORDER);
  });
});
