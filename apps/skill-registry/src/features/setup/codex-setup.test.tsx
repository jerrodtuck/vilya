import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexSetup } from "./codex-setup";

describe("Codex setup and canon", () => {
  it("links additive installation, actual discovery and complete lifecycle guidance", () => {
    const html = renderToStaticMarkup(<CodexSetup />);
    for (const value of ["-IncludeCodex", "--include-codex", "$HOME/.agents/skills", "~/.claude/skills", "$vl-orch-codex", "installation success alone", "resolved source", "/orch?host=codex", "/architect?host=codex", "/differences?host=codex", "Codex CLI", "plan:ready ∧ night-shift:ready"]) expect(html).toContain(value);
  });
  it("keeps the bundled canon equal to source and preserves attributed ADR amendments", () => {
    const canon = fs.readFileSync(path.resolve("../../docs/project-tracking/GITHUB-PROJECTS.md"), "utf8");
    expect(fs.readFileSync("content/GITHUB-PROJECTS.md", "utf8")).toBe(canon);
    expect(canon).toContain("Codex desktop workflow");
    const adr = fs.readFileSync(path.resolve("../../docs/DECISIONS.md"), "utf8");
    for (const id of ["5968209218", "5972645954", "5972758188", "5972773318"]) expect(adr).toContain("issuecomment-" + id);
  });
});
