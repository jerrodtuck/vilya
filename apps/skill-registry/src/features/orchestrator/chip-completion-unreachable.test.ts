// #313: chip completion turn is unreachable — post-dispatch corrections
// enforce at the merge gate; briefs require a pre-PR issue re-read.
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

describe("chip completion unreachable — merge-gate + pre-PR re-read (#313)", () => {
  it("merge-pr teaches post-dispatch corrections as merge-gate enforcement", () => {
    const merge = skill("vl-merge-pr");
    expect(merge).toContain("Post-dispatch corrections — merge-gate enforcement (#313)");
    expect(merge).toContain("merge-gate enforcement item");
    expect(merge).toContain("never** be load-bearing");
    expect(merge).toContain("attributed note");
    expect(merge).toContain("hold the merge");
    expect(merge).toContain("anduin-analytics 2026-07-24/25");
  });

  it("chip + finish-feature + handoff require pre-PR issue re-read", () => {
    const chip = skill("vl-chip");
    expect(chip).toContain("Pre-PR issue re-read (#313)");
    expect(chip).toContain(
      "immediately before opening the PR, re-read the owning issue",
    );
    expect(chip).toContain("one delivery channel a finishing chip reliably uses");

    const finish = skill("vl-finish-feature");
    expect(finish).toContain("Pre-PR issue re-read (#313)");
    expect(finish).toContain(
      "immediately before opening the PR, re-read the owning issue",
    );

    const handoff = skill("vl-cursor-handoff");
    expect(handoff).toContain("Immediately before opening the PR");
    expect(handoff).toContain("re-read the owning issue");
  });

  it("orch seats refuse load-bearing post-dispatch chip messages", () => {
    const cursor = skill("vl-orch-cursor");
    expect(cursor).toContain(
      "Post-dispatch corrections are merge-gate items, never chip-messaging items (#313)",
    );
    expect(cursor).toContain("must never be load-bearing");
    expect(cursor).toContain(
      "immediately before opening the PR, re-read the owning issue",
    );

    const claude = skill("vl-orch-claude");
    expect(claude).toContain(
      "Post-dispatch corrections are merge-gate items, never chip-messaging items (#313)",
    );
    expect(claude).toContain("must never be load-bearing");
    expect(claude).toContain(
      "immediately before opening the PR, re-read the owning issue",
    );
  });

  it("orchestrator site cards + prompts align", () => {
    expect(NODES.MERGE.bodyHtml).toContain(
      "Post-dispatch corrections are merge-gate items",
    );
    expect(NODES.MERGE.bodyHtml).toContain("never load-bearing");
    expect(NODES.FINISH.bodyHtml).toContain("Pre-PR issue re-read");
    expect(NODES.FINISH.bodyHtml).toContain("completion turn is unreachable");

    const text = promptCorpus();
    expect(text).toContain(
      "immediately before opening the PR, re-read the owning issue",
    );
    expect(text).toContain("merge-gate enforcement");
    expect(text).toContain("never be load-bearing");
    expect(text).toContain("attributed squash note or hold merge");
  });
});
