// #317: /vl-finish-feature reads the created PR body back and asserts the close
// keyword; completion reports state what was observed, not the template.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
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

describe("finish-feature close-keyword read-back (#317)", () => {
  it("finish-feature asserts created PR body has Closes/Refs and completion is observed", () => {
    const finish = skill("vl-finish-feature");
    expect(finish).toContain("Read the PR body back");
    expect(finish).toContain("gh pr view <n> --json body --jq .body");
    expect(finish).toContain("fail loudly");
    expect(finish).toContain("do not treat the text you *intended*");
    expect(finish).toContain("observed, not intended");
    expect(finish).toContain("anduin-admin #91 / PR #95");
  });

  it("chip + cursor-handoff teach observed keyword in completion reports", () => {
    const chip = skill("vl-chip");
    expect(chip).toContain("close keyword **observed**");
    expect(chip).toContain("reads the created PR body back");
    expect(chip).toContain("Never** assert `Closes #<N>` / `Refs #<N>` from the brief");

    const handoff = skill("vl-cursor-handoff");
    expect(handoff).toContain("reads the created PR body back");
    expect(handoff).toContain("**observed** in the created PR body");
  });

  it("merge-pr triage warns pre-merge when close keyword is missing", () => {
    const merge = skill("vl-merge-pr");
    expect(merge).toContain("Close-keyword check (pre-merge warn)");
    expect(merge).toContain("warn before squash");
    expect(merge).toContain("anduin-admin #91 / PR #95");
  });

  it("orch seats + prompts teach read-back and observed completion keyword", () => {
    const cursor = skill("vl-orch-cursor");
    expect(cursor).toContain("close keyword **observed** in the created PR body");

    const claude = skill("vl-orch-claude");
    expect(claude).toContain("reads the created PR body back and asserts the keyword");
    expect(claude).toContain("close keyword **observed** in the created PR body");

    const text = promptCorpus();
    expect(text).toContain("reads the created PR body back and asserts the keyword");
    expect(text).toContain("close keyword observed in the created PR body");
    expect(text).toContain("warn pre-merge if missing");
  });
});
