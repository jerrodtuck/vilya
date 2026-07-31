// #320: issue bodies state present-tense facts — never aspirational as shipped.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

function skill(slug: string): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills", slug, "SKILL.md"),
    "utf8",
  ).replace(/\s+/g, " ");
}

function promptCorpus(): string {
  return PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
}

describe("present-tense issue bodies — authoring surfaces (#320)", () => {
  it("start-feature + update-docs + chip teach present-tense issue bodies", () => {
    const start = skill("vl-start-feature");
    expect(start).toContain("present-tense facts with evidence");
    expect(start).toContain("this issue adds X");
    expect(start).toContain("actual current status, checked at write time");

    const update = skill("vl-update-docs");
    expect(update).toContain("present-tense facts with evidence");
    expect(update).toContain("actual current status, checked at write time");
    expect(update).toContain("claiming another issue shipped a deliverable");

    const chip = skill("vl-chip");
    expect(chip).toContain("Issue bodies you author or amend");
    expect(chip).toContain("present-tense facts with evidence");
    expect(chip).toContain("actual current status, checked at write time");
  });

  it("orch seats teach present-tense when authoring issues and kickoffs", () => {
    const cursor = skill("vl-orch-cursor");
    expect(cursor).toContain("present-tense facts with evidence");
    expect(cursor).toContain("actual current status, checked at write time");

    const claude = skill("vl-orch-claude");
    expect(claude).toContain("present-tense facts with evidence");
    expect(claude).toContain("actual current status, checked at write time");
  });

  it("orchestrator site cards + prompts align", () => {
    expect(NODES.START.bodyHtml).toContain("present-tense facts with evidence");
    expect(NODES.START.bodyHtml).toContain("actual current status, checked at write time");

    const text = promptCorpus();
    expect(text).toContain("present-tense facts with evidence");
    expect(text).toContain("actual current status, checked at write time");
  });
});
