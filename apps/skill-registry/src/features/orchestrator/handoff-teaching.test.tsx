import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexOrchestration } from "./codex-orchestration";
import { CodexPlanning } from "../planner/codex-planning";
import { CodexSetup } from "../setup/codex-setup";

describe("vl-handoff discovery and teaching", () => {
  it("teaches archive safety and preservation before the old owner is archived", () => {
    const html = renderToStaticMarkup(<CodexOrchestration />);
    for (const fact of ["old owning chat", "safe to archive", "not safe to archive",
      "unverified (treated as not safe)", "reason and manual action", "associated and attached worktrees",
      "ignored/untracked setup", "accessible to the successor", "deletes its managed worktree",
      "permanent worktrees are not automatically deleted", "second attachment alone is insufficient",
      "keep the old owner chat unarchived", "verify Cursor and Claude behavior separately"])
      expect(html).toContain(fact);
    expect(html).toContain("https://learn.chatgpt.com/docs/environments/git-worktrees");
  });
  it("ships the complete generated skill", () => {
    const source = fs.readFileSync("../../skills/vl-handoff/SKILL.md", "utf8");
    expect(fs.readFileSync("content/skills/vl-handoff/SKILL.md", "utf8")).toBe(source);
    expect(source).toContain("codex-invocation: \"$vl-handoff\"");
    expect(source).toContain("ready-to-paste starter");
  });

  it("teaches invocation and its no-chat boundary on applicable pages", () => {
    const html = [<CodexOrchestration key="o" />, <CodexPlanning key="p" />, <CodexSetup key="s" />]
      .map(node => renderToStaticMarkup(node)).join("\n");
    expect(html).toContain("$vl-handoff");
    expect(html).toContain("ready-to-paste starter");
    expect(html).toContain("creates no chat");
  });
});
