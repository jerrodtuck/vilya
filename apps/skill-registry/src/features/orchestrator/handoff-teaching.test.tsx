import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexOrchestration } from "./codex-orchestration";
import { CodexPlanning } from "../planner/codex-planning";
import { CodexSetup } from "../setup/codex-setup";

describe("vl-handoff discovery and teaching", () => {
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
