// #320: issue bodies / kickoffs state present-tense facts — never aspirational as shipped.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

function plannerSkill(): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills/vl-plan/SKILL.md"),
    "utf8",
  ).replace(/\s+/g, " ");
}

describe("present-tense issue bodies — planner (#320)", () => {
  it("planner skill kickoff shape requires present-tense facts and status-at-write-time", () => {
    const text = plannerSkill();
    expect(text).toContain("Present-tense facts");
    expect(text).toContain("present-tense facts");
    expect(text).toContain("this issue adds X");
    expect(text).toContain("actual current status, checked at write time");
    expect(text).toContain("false record the moment it is filed");
  });

  it("planner site cards teach present-tense grounding and kickoff authoring", () => {
    expect(NODES.RECALL.bodyHtml).toContain("status at write time");
    expect(NODES.WRITE.bodyHtml).toContain("Present-tense facts");
    expect(NODES.WRITE.bodyHtml).toContain("actual current status, checked at write time");
    const corpus = PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
    expect(corpus).toContain("present-tense facts with evidence");
    expect(corpus).toContain("actual current status, checked at write time");
    expect(corpus).toContain('already shipped / X exists');
  });
});
