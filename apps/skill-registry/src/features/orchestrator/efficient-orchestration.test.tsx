import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CODEX_PROMPTS } from "./codex-prompts";
import { CodexOrchestration } from "./codex-orchestration";

const applicable = CODEX_PROMPTS.flatMap(group => group.items)
  .filter(card => card.label !== "Managed archival after authorized close-out");

describe("#356 exported efficient coordination entries", () => {
  it.each(applicable.map(card => [card.label, card.text]))("%s delivers revised choices and full required source independently", (_label, text) => {
    expect(text).toContain("reuse a sufficient settled issue plan without a planning delegate");
    expect(text).toContain("orch fills routine bounded gaps");
    expect(text).toContain("delegation only when necessary");
    expect(text).toContain("named unresolved consequential architecture/security question");
    expect(text).toContain("concrete uncertainty/risk rationale");
    expect(text).toContain("not a topic label");
    expect(text).toContain("Do not repeatedly paste contracts/plans or pass full-history by default");
    expect(text).toContain("Initial independent review covers the full change and affected boundaries");
    expect(text).toContain("delta plus affected boundaries/current amendments");
    expect(text).toContain("retaining initial full-review evidence");
    expect(text).toContain("exact reviewed/repaired heads and gate-result provenance");
    expect(text).toContain("changed source, failed checks or unresolved risk with recorded reason/head");
    expect(text).toContain("active-task persistence");
    expect(text).toContain("Preserve exact active/resumed worker pins");
    expect(text).not.toContain("Astra/high normal planning");
    expect(text).toContain("Read and apply the full resolved vl-orch-codex/references/model-routing.md");
    // Check the actual required bundled source a copied entry tells its reader to load.
    const resource = fs.readFileSync("content/skills/vl-orch-codex/references/model-routing.md", "utf8");
    expect(resource).toContain("## Efficient coordination (#356)");
    expect(resource).toContain("## Repair ledger and stop");
    expect(text).toContain("$vl-adhd");
    expect(text).toContain("$vl-present");
  });
  it("renders the current efficient revision with source and review limits on the actual Codex page", () => {
    const html = renderToStaticMarkup(<CodexOrchestration />);
    expect(html).toContain("#356 prospectively refines #329/#347");
    expect(html).toContain("required gates once with justified repeats");
    expect(html).toContain("quiet waits/backoff");
    expect(html).toContain("no savings or runtime routing result is claimed");
    expect(html).not.toContain("normal planning to Astra/high");
  });
});
