import { describe, expect, it } from "vitest";
import { rewriteSkillLinks } from "./rewrite-links";

describe("rewriteSkillLinks", () => {
  it("rewrites sibling SKILL.md links to detail pages", () => {
    const html = '<a href="../vilya-finish-feature/SKILL.md">/vilya-finish-feature</a>';
    expect(rewriteSkillLinks(html)).toBe(
      '<a href="/skills/vilya-finish-feature">/vilya-finish-feature</a>'
    );
  });

  it("rewrites multiple links in one body", () => {
    const html =
      '<a href="../vilya-start-feature/SKILL.md">a</a> and <a href="../vilya-night-shift/SKILL.md">b</a>';
    const out = rewriteSkillLinks(html);
    expect(out).toContain('href="/skills/vilya-start-feature"');
    expect(out).toContain('href="/skills/vilya-night-shift"');
  });

  it("leaves absolute and non-skill links alone", () => {
    const html =
      '<a href="https://example.com/SKILL.md">x</a> <a href="../../docs/project-tracking/GITHUB-PROJECTS.md">y</a> <a href="/skills/vilya-history">z</a>';
    expect(rewriteSkillLinks(html)).toBe(html);
  });

  it("passes through text without links", () => {
    expect(rewriteSkillLinks("<p>plain</p>")).toBe("<p>plain</p>");
  });
});
