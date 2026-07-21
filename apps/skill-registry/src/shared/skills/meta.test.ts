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
  it("buckets vl-* slugs into review / autonomous / recall / process", () => {
    expect(categorize("vl-crucible-nextjs")).toBe("review");
    expect(categorize("vl-night-shift")).toBe("autonomous");
    expect(categorize("vl-plan")).toBe("autonomous");
    expect(categorize("vl-history")).toBe("recall");
    expect(categorize("vl-product-map")).toBe("recall");
    expect(categorize("vl-start-feature")).toBe("process");
    expect(categorize("vl-arch")).toBe("process");
    expect(categorize("vl-orch-claude")).toBe("process");
    expect(categorize("vl-orch-cursor")).toBe("process");
    expect(categorize("vl-ask")).toBe("process");
  });
});

describe("stackOf", () => {
  it("names every crucible dialect's stack", () => {
    expect(stackOf("vl-crucible-blazor")).toBe("Blazor / .NET");
    expect(stackOf("vl-crucible-nextjs")).toBe("Next.js / React");
    expect(stackOf("vl-crucible-fastapi")).toBe("FastAPI / Python");
    expect(stackOf("vl-crucible-django")).toBe("Django / Python");
    expect(stackOf("vl-crucible-ml")).toBe("Python ML / Data");
  });

  it("falls back to any stack for process skills", () => {
    expect(stackOf("vl-start-feature")).toBe("any stack");
  });
});
