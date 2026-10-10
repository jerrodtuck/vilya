import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CODEX_PROMPTS } from "./codex-prompts";
import { CodexOrchestration } from "./codex-orchestration";

const applicable = CODEX_PROMPTS.flatMap(group => group.items)
  .filter(card => card.label !== "Managed archival after authorized close-out");

describe("#356 exported efficient coordination entries", () => {
  it.each(applicable.map(card => [card.label, card.text]))("%s delivers revised choices and full required source independently", (_label, text) => {
    expect(text).toContain("#357 authorizes routing by uncertainty and consequence");
    expect(text).toContain("Sol/medium for normal planning, implementation and repair");
    expect(text).toContain("Astra/high");
    expect(text).toContain("only after a recorded Sol impasse or capability failure");
    expect(text).toContain("bounded self-contained brief with exact source references instead of full history");
    expect(text).toContain("reuse a viable worker and repair ledger");
    expect(text).toContain("initial review covers the full change");
    expect(text).toContain("repair review covers the delta plus affected boundaries and current amendments");
    expect(text).toContain("run required gates once per applicable head");
    expect(text).toContain("quiet waits with backoff without ending active work");
    expect(text).toContain("choose continue, built-in Compact, or recommend fresh chat");
    expect(text).toContain("apply $vl-handoff");
    expect(text).toContain("ready-to-paste starter");
    expect(text).toContain("invocation creates no chat and resets nothing");
    expect(text).toContain("Read and apply the full resolved vl-orch-codex/references/model-routing.md");
    // Check the actual required bundled source a copied entry tells its reader to load.
    const resource = fs.readFileSync("content/skills/vl-orch-codex/references/model-routing.md", "utf8");
    expect(resource).toContain("## Efficient coordination (#356)");
    expect(resource).toContain("$vl-handoff");
    expect(resource).toContain("## Repair ledger and stop");
    expect(text).toContain("$vl-adhd");
    expect(text).toContain("$vl-present");
  });
  it("renders the current efficient revision with source and review limits on the actual Codex page", () => {
    const html = renderToStaticMarkup(<CodexOrchestration />);
    expect(html).toContain("Issue #356 keeps that model route fixed while reducing context overhead");
    expect(html).toContain("Run required gates once per applicable head");
    expect(html).toContain("quiet waits with backoff");
    expect(html).toContain("$vl-handoff");
    expect(html).toContain("ready-to-paste starter");
    expect(html).not.toContain("normal planning to Astra/high");
  });
});
