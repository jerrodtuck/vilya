import { describe, expect, it } from "vitest";
import { levelOf, stackOf } from "./meta";
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

describe("stackOf", () => {
  it("names every crucible dialect's stack", () => {
    expect(stackOf("crucible-blazor")).toBe("Blazor / .NET");
    expect(stackOf("crucible-nextjs")).toBe("Next.js / React");
    expect(stackOf("crucible-fastapi")).toBe("FastAPI / Python");
    expect(stackOf("crucible-django")).toBe("Django / Python");
    expect(stackOf("crucible-ml")).toBe("Python ML / Data");
  });

  it("falls back to any stack for process skills", () => {
    expect(stackOf("start-feature")).toBe("any stack");
  });
});
