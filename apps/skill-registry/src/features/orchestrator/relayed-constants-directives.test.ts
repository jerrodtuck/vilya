// #310: relayed constants need confirmation; relayed directives use asymmetry; record channel.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "./data";
import { PROMPTS } from "./prompts";

const EVIDENCE_CHANNELS = [
  "operator-direct",
  "measured",
  "relayed via <session>",
] as const;

function skill(slug: string): string {
  return readFileSync(
    path.resolve(__dirname, "../../../../../skills", slug, "SKILL.md"),
    "utf8",
  );
}

function promptCorpus(): string {
  return PROMPTS.flatMap((g) => g.items.map((i) => i.text)).join("\n");
}

describe("relayed constants and directives — orchestrator (#310)", () => {
  it("chip §2d + handoff + start-feature teach confirm / asymmetry / channel", () => {
    const chip = skill("vl-chip");
    expect(chip).toContain("## 2d. Relayed constants and directives");
    expect(chip).toContain("approximations");
    expect(chip).toContain("non-constant");
    expect(chip).toContain("Comply-then-verify");
    expect(chip).toContain("Verify-before-comply");
    for (const channel of EVIDENCE_CHANNELS) {
      expect(chip).toContain(channel);
    }

    const handoff = skill("vl-cursor-handoff");
    expect(handoff).toContain("Relayed constants / directives");
    expect(handoff).toContain("comply-then-verify");
    expect(handoff).toContain("verify-before-comply");
    expect(handoff).toContain("operator-direct");

    const start = skill("vl-start-feature");
    expect(start).toContain("load-bearing constant");
    expect(start).toContain("comply-then-verify");
    expect(start).toContain("verify-before-comply");
    expect(start).toContain("§2d");

    const merge = skill("vl-merge-pr");
    expect(merge).toContain("Relayed merge directives");
    expect(merge).toContain("verify-before-comply");
    expect(merge).toContain("operator-direct");
  });

  it("orch seats teach relay handling when authoring and receiving", () => {
    const claude = skill("vl-orch-claude");
    expect(claude).toContain("Relayed constants / directives");
    expect(claude).toContain("do not harden hedged values");
    expect(claude).toContain("comply-then-verify");
    expect(claude).toContain("verify-before-comply");

    const cursor = skill("vl-orch-cursor");
    expect(cursor).toContain("Relayed constants / directives");
    expect(cursor).toContain("do not harden hedged values");
    expect(cursor).toContain("comply-then-verify");
    expect(cursor).toContain("verify-before-comply");
  });

  it("orchestrator site cards + worker prompts align", () => {
    expect(NODES.START.bodyHtml).toContain("Relayed constants / directives");
    expect(NODES.START.bodyHtml).toContain("comply-then-verify");
    expect(NODES.IMPL.bodyHtml).toContain("load-bearing constants");
    expect(NODES.IMPL.bodyHtml).toContain("verify-before-comply");

    const text = promptCorpus();
    expect(text).toContain("Relayed constants / directives");
    expect(text).toContain("do not harden hedged values");
    expect(text).toContain("comply-then-verify");
    expect(text).toContain("verify-before-comply");
    expect(text).toContain("operator-direct");
    expect(text).toContain("relayed via <session>");
  });
});
