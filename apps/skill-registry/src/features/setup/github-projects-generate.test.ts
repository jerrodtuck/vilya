import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  configChecklist,
  emptyConfig,
  mergeConfig,
} from "./github-projects-config";
import { generateSlim } from "./github-projects-generate";
import { parseConfig } from "./github-projects-parse";

const FULL_CONFIG = mergeConfig(emptyConfig(), {
  owner: "acme",
  repo: "acme/widgets",
  projectNumber: "3",
  projectId: "PVT_abc",
  statusFieldId: "PVTSSF_xyz",
  stack: "blazor",
  crucibleVariant: "vl-crucible-blazor",
  testCommand: "dotnet test",
  manualSmoke: "dotnet run",
  defaultBranch: "master",
  statusOptions: {
    todo: "aaa",
    inProgress: "bbb",
    blocked: "ccc",
    verifying: "ddd",
    done: "eee",
  },
  typeFieldLine: "Type  (PVTSSF_type): Feature bca · Bug bug",
  priorityFieldLine: "Priority (PVTSSF_pri): High hi · Low lo",
  areaLabels: ["area:api", "area:ui"],
});

describe("generateSlim", () => {
  it("emits config + canon pointer and no process prose", () => {
    const out = generateSlim(FULL_CONFIG);
    expect(out).toContain("# GitHub Projects — repo config");
    expect(out).toContain("**Config only.**");
    expect(out).toContain("https://vilya.jerrodtuck.com/setup");
    expect(out).toContain("| Owner | `acme` |");
    expect(out).toContain("| Repo | `acme/widgets` |");
    expect(out).toContain("| **Stack** | `blazor` |");
    expect(out).toContain("| **Crucible variant** | `vl-crucible-blazor` |");
    expect(out).toContain("Todo:         aaa");
    expect(out).toContain("`area:api` · `area:ui`");
    expect(out).toContain("### Night-shift (per-repo)");
    // No shared process sections — those live only in the Vilya canon.
    expect(out).not.toContain("## Model (same everywhere)");
    expect(out).not.toContain("Daytime chain");
    expect(out).not.toContain("PR close convention");
    expect(out).not.toContain("One-time repo setup");
    expect(out).not.toContain("## Frozen");
    expect(out).not.toContain("Implementation checklist");
  });

  it("uses placeholders for a blank new-repo config", () => {
    const out = generateSlim(emptyConfig());
    expect(out).toContain("`<owner>`");
    expect(out).toContain("`<owner>/<repo>`");
    expect(out).toContain("vl-crucible-<stack>");
    expect(out).toContain("`area:<slice>`");
    expect(out).toContain("<todo-id>");
    expect(out).not.toContain("jerrodtuck/widgets");
    expect(out).not.toContain("PVT_kwHOAYNJN84BdH1y");
  });

  it("round-trips every config value through parse", () => {
    expect(parseConfig(generateSlim(FULL_CONFIG))).toEqual(FULL_CONFIG);
  });

  it("is idempotent: regenerating from its own output is byte-identical", () => {
    const slim = generateSlim(FULL_CONFIG);
    expect(generateSlim(parseConfig(slim))).toBe(slim);
  });

  it("slims the real fat Vilya canon when present on disk", () => {
    const realPath = path.resolve(
      process.cwd(),
      "../../docs/project-tracking/GITHUB-PROJECTS.md"
    );
    if (!fs.existsSync(realPath)) return;

    const fat = fs.readFileSync(realPath, "utf8");
    const parsed = parseConfig(fat);
    expect(parsed.owner).toBe("jerrodtuck");
    expect(parsed.repo).toBe("jerrodtuck/vilya");

    const slim = generateSlim(parsed);
    expect(slim).toContain("| Owner | `jerrodtuck` |");
    expect(slim).toContain("| Repo | `jerrodtuck/vilya` |");
    expect(slim).not.toContain("## Model (same everywhere)");
    expect(slim).not.toContain("Night-shift via GitHub Actions");
    expect(slim).not.toContain("Implementation checklist");

    // Config survives the fat → slim migration 100%…
    expect(parseConfig(slim)).toEqual(parsed);
    // …and a second pass over the slim file changes nothing.
    expect(generateSlim(parseConfig(slim))).toBe(slim);
  });
});

describe("configChecklist + mergeConfig", () => {
  it("marks filled vs missing fields", () => {
    const items = configChecklist(
      mergeConfig(emptyConfig(), { owner: "acme", stack: "nextjs" })
    );
    expect(items.find((i) => i.key === "owner")?.status).toBe("kept");
    expect(items.find((i) => i.key === "stack")?.status).toBe("kept");
    expect(items.find((i) => i.key === "repo")?.status).toBe("missing");
  });

  it("lets non-empty form overrides win", () => {
    const merged = mergeConfig(parseConfig("| Owner | `paste` |\n"), {
      owner: "form",
    });
    // parse of broken table may miss owner — still exercise merge
    const fromParsed = mergeConfig(
      { ...emptyConfig(), owner: "paste" },
      { owner: "form" }
    );
    expect(fromParsed.owner).toBe("form");
    expect(merged.owner === "form" || merged.owner === "paste").toBe(true);
  });
});
