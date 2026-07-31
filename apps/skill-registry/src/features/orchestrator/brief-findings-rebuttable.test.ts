// #319: brief prior findings are rebuttable by chip measurement — never binding.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

const CONTEXT_ORDER =
  "direct measurement > dated ruling > record prose > recency/salience";

function skill(slug: string): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills", slug, "SKILL.md"),
    "utf8",
  );
}

function promptCorpus(): string {
  return PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
}

describe("brief findings rebuttable by measurement — orchestrator (#319)", () => {
  it("chip + cursor-handoff + start-feature teach the execute-time hard stop", () => {
    const chip = skill("vl-chip");
    expect(chip).toContain("## 2c. Brief prior findings are rebuttable by measurement");
    expect(chip).toContain("rebuttable by this chip's own direct");
    expect(chip).toContain("never silently comply");
    expect(chip).toContain(CONTEXT_ORDER);
    expect(chip).toContain('marks a prior finding "binding"');

    const handoff = skill("vl-cursor-handoff");
    expect(handoff).toContain("direct measurement");
    expect(handoff).toContain("never silently comply");
    expect(handoff).toContain(CONTEXT_ORDER);

    const start = skill("vl-start-feature");
    expect(start).toContain("never** mark it binding against");
    expect(start).toContain(CONTEXT_ORDER);
  });

  it("orch seats never mark prior findings binding when authoring briefs", () => {
    const claude = skill("vl-orch-claude");
    expect(claude).toContain("never** mark them binding against the chip's direct measurement");
    expect(claude).toContain(CONTEXT_ORDER);

    const cursor = skill("vl-orch-cursor");
    expect(cursor).toContain("never** mark them binding against the chip's direct measurement");
    expect(cursor).toContain(CONTEXT_ORDER);
  });

  it("orchestrator site cards + worker prompts align", () => {
    expect(NODES.START.bodyHtml).toContain("never mark them binding");
    expect(NODES.START.bodyHtml).toContain("direct measurement");
    expect(NODES.IMPL.bodyHtml).toContain("rebuttable by direct measurement");
    expect(NODES.IMPL.bodyHtml).toContain("never silently comply");

    const text = promptCorpus();
    expect(text).toContain("never mark them binding against the chip's direct measurement");
    expect(text).toContain(CONTEXT_ORDER);
    expect(text).toContain("STOP and raise it on the issue");
    expect(text).toContain("never silently comply");
  });
});
