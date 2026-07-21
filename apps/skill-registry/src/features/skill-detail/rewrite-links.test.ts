import { describe, expect, it } from "vitest";
import { rewriteSkillLinks } from "./rewrite-links";

describe("rewriteSkillLinks", () => {
  it("rewrites sibling SKILL.md links to detail pages", () => {
    const html = '<a href="../vl-finish-feature/SKILL.md">/vl-finish-feature</a>';
    expect(rewriteSkillLinks(html)).toBe(
      '<a href="/skills/vl-finish-feature">/vl-finish-feature</a>'
    );
  });

  it("rewrites multiple links in one body", () => {
    const html =
      '<a href="../vl-start-feature/SKILL.md">a</a> and <a href="../vl-night-shift/SKILL.md">b</a>';
    const out = rewriteSkillLinks(html);
    expect(out).toContain('href="/skills/vl-start-feature"');
    expect(out).toContain('href="/skills/vl-night-shift"');
  });

  it("leaves absolute and non-skill links alone", () => {
    const html =
      '<a href="https://example.com/SKILL.md">x</a> <a href="../../docs/project-tracking/GITHUB-PROJECTS.md">y</a> <a href="/skills/vl-history">z</a>';
    expect(rewriteSkillLinks(html)).toBe(html);
  });

  it("passes through text without links", () => {
    expect(rewriteSkillLinks("<p>plain</p>")).toBe("<p>plain</p>");
  });
});
