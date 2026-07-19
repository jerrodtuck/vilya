// #239: investigate-first / hard-stop — orchestrator cards + owning skill prose.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

function skill(slug: string): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills", slug, "SKILL.md"),
    "utf8",
  );
}

function promptCorpus(): string {
  return PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
}

describe("investigate-first hard-stop — orchestrator (#239)", () => {
  it("chip + start-feature + night-shift teach the marking split", () => {
    const chip = skill("chip");
    expect(chip).toContain("## 2a. Investigate-first / hard-stop");
    expect(chip).toContain("non-negotiable");
    expect(chip).toContain("needs:decision");
    expect(chip).toContain("auto-picking is forbidden");
    expect(chip).toContain("findings clearly favor X");
    expect(chip).toContain("Soft optional-wait wording is a defect");

    const start = skill("start-feature");
    expect(start).toContain("Investigate-first / hard-stop");
    expect(start).toContain("non-negotiable");

    const night = skill("night-shift");
    expect(night).toContain("Investigate-first / hard-stop");
    expect(night).toContain("needs:decision");
  });

  it("orchestrator CONSULT node + worker prompts align", () => {
    expect(NODES.CONSULT.bodyHtml).toContain("Investigate-first / hard-stop");
    expect(NODES.CONSULT.bodyHtml).toContain("needs:decision");
    const text = promptCorpus();
    expect(text).toContain("Investigate-first / hard-stop");
    expect(text).toContain("non-negotiable");
    expect(text).toContain("do not auto-pick");
  });
});
