import { describe, expect, it } from "vitest";
import { categorize, levelOf, stackOf } from "./meta";
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

describe("categorize", () => {
  it("buckets vilya-* slugs into review / autonomous / recall / process", () => {
    expect(categorize("vilya-crucible-nextjs")).toBe("review");
    expect(categorize("vilya-night-shift")).toBe("autonomous");
    expect(categorize("vilya-planner")).toBe("autonomous");
    expect(categorize("vilya-history")).toBe("recall");
    expect(categorize("vilya-product-map")).toBe("recall");
    expect(categorize("vilya-start-feature")).toBe("process");
  });
});

describe("stackOf", () => {
  it("names every crucible dialect's stack", () => {
    expect(stackOf("vilya-crucible-blazor")).toBe("Blazor / .NET");
    expect(stackOf("vilya-crucible-nextjs")).toBe("Next.js / React");
    expect(stackOf("vilya-crucible-fastapi")).toBe("FastAPI / Python");
    expect(stackOf("vilya-crucible-django")).toBe("Django / Python");
    expect(stackOf("vilya-crucible-ml")).toBe("Python ML / Data");
  });

  it("falls back to any stack for process skills", () => {
    expect(stackOf("vilya-start-feature")).toBe("any stack");
  });
});
