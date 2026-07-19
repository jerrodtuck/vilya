// #239: investigate-first / hard-stop — planner kickoff + fork cards.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

function plannerSkill(): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills/vilya-planner/SKILL.md"),
    "utf8",
  );
}

describe("investigate-first hard-stop — planner (#239)", () => {
  it("planner skill kickoff shape names the daytime hard-stop section", () => {
    const text = plannerSkill();
    expect(text).toContain("Investigate-first / hard-stop");
    expect(text).toContain("non-negotiable");
    expect(text).toContain("needs:decision");
  });

  it("planner site cards teach daytime section vs unattended label", () => {
    expect(NODES.WRITE.bodyHtml).toContain("Investigate-first / hard-stop");
    expect(NODES.FORK.bodyHtml).toContain("Investigate-first");
    expect(NODES.FORK.bodyHtml).toContain("needs:decision");
    const corpus = PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
    expect(corpus).toContain("Investigate-first / hard-stop");
  });
});
