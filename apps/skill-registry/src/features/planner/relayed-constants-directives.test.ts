// #310: planner kickoff authoring — relayed constants/directives + evidence channel.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

function plannerSkill(): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills/vl-plan/SKILL.md"),
    "utf8",
  );
}

describe("relayed constants and directives — planner (#310)", () => {
  it("planner skill kickoff shape teaches confirm / asymmetry / channel", () => {
    const text = plannerSkill();
    expect(text).toContain("Relayed constants / directives");
    expect(text).toContain("non-constant");
    expect(text).toContain("comply-then-verify");
    expect(text).toContain("verify-before-comply");
    expect(text).toContain("operator-direct");
    expect(text).toContain("relayed via <session>");
    expect(text).toContain("§2d");
  });

  it("planner site cards + prompts teach relay discipline", () => {
    expect(NODES.WRITE.bodyHtml).toContain("Relayed constants / directives");
    expect(NODES.WRITE.bodyHtml).toContain("comply-then-verify");
    expect(NODES.WRITE.bodyHtml).toContain("verify-before-comply");
    expect(NODES.WRITE.bodyHtml).toContain("operator-direct");

    const corpus = PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
    expect(corpus).toContain("Relayed constants / directives");
    expect(corpus).toContain("hedges are non-constants");
    expect(corpus).toContain("comply-then-verify");
    expect(corpus).toContain("verify-before-comply");
    expect(corpus).toContain("operator-direct");
  });
});
