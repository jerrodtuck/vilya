import { describe, expect, it } from "vitest";
import { levelOf } from "./meta";
import type { Skill } from "./types";

const skill = (frontmatter: Skill["frontmatter"]): Skill => ({
  slug: "x",
  frontmatter,
  body: "",
  filePath: "skills/x/SKILL.md",
});

describe("levelOf", () => {
  it("defaults to user when frontmatter is silent", () => {
    expect(levelOf(skill({}))).toBe("user");
  });

  it("honors an explicit project level", () => {
    expect(levelOf(skill({ level: "project" }))).toBe("project");
  });

  it("treats junk values as user", () => {
    expect(levelOf(skill({ level: "global" as never }))).toBe("user");
  });
});
