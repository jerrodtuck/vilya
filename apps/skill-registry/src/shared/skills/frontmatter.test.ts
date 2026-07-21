import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "./frontmatter";

describe("parseFrontmatter", () => {
  it("parses a single-line description", () => {
    const { data } = parseFrontmatter(
      `---\nname: x\ndescription: does a thing (sibling: y)\n---\nbody`
    );
    expect(data.description).toBe("does a thing (sibling: y)");
  });

  it("folds a >- block scalar description into one line", () => {
    const raw = [
      "---",
      "name: chip",
      "description: >-",
      "  Orchestrator dispatch — chip a self-contained unit of work off to a",
      "  background session. Pairs with /vl-start-feature, /vl-merge-pr, /vl-prune.",
      "---",
      "body",
    ].join("\n");
    const { data } = parseFrontmatter(raw);
    expect(data.description).toBe(
      "Orchestrator dispatch — chip a self-contained unit of work off to a background session. Pairs with /vl-start-feature, /vl-merge-pr, /vl-prune."
    );
  });

  it("preserves newlines for a literal | block scalar", () => {
    const raw = [
      "---",
      "name: x",
      "notes: |",
      "  line one",
      "  line two",
      "---",
      "body",
    ].join("\n");
    const { data } = parseFrontmatter(raw);
    expect(data.notes).toBe("line one\nline two");
  });

  it("resumes normal key parsing after a block scalar ends", () => {
    const raw = [
      "---",
      "name: x",
      "description: >-",
      "  folded text here",
      "disable-model-invocation: true",
      "---",
      "body",
    ].join("\n");
    const { data } = parseFrontmatter(raw);
    expect(data.description).toBe("folded text here");
    expect(data["disable-model-invocation"]).toBe(true);
  });
});
