import { describe, expect, it } from "vitest";
import {
  generateNightShiftWorkflow,
  normalizeRepo,
  runnerDirFor,
  usualClaudeExe,
  workflowLooksFilled,
} from "./night-shift-workflow-generate";

const TEMPLATE = `name: night-shift
# for __REPO_FULL__ short=__REPO_SHORT__
# folder __RUNNER_DIR__
path_to_claude_code_executable: __CLAUDE_EXE__
`;

describe("normalizeRepo", () => {
  it("accepts short and owner/repo forms", () => {
    expect(normalizeRepo("anduin")).toEqual({ full: "anduin", short: "anduin" });
    expect(normalizeRepo("jerrodtuck/anduin")).toEqual({
      full: "jerrodtuck/anduin",
      short: "anduin",
    });
    expect(normalizeRepo("https://github.com/jerrodtuck/anduin.git")).toEqual({
      full: "jerrodtuck/anduin",
      short: "anduin",
    });
  });

  it("rejects empty or invalid", () => {
    expect(normalizeRepo("")).toBeNull();
    expect(normalizeRepo("a/b/c")).toBeNull();
    expect(normalizeRepo("bad repo")).toBeNull();
  });
});

describe("generateNightShiftWorkflow", () => {
  it("fills markers for a product repo", () => {
    const yaml = generateNightShiftWorkflow(TEMPLATE, {
      repo: "jerrodtuck/anduin",
      claudeExe: usualClaudeExe(),
    });
    expect(yaml).toContain("jerrodtuck/anduin");
    expect(yaml).toContain("short=anduin");
    expect(yaml).toContain(runnerDirFor("anduin"));
    expect(yaml).toContain(usualClaudeExe());
    expect(workflowLooksFilled(yaml!)).toBe(true);
  });

  it("returns null for bad repo", () => {
    expect(
      generateNightShiftWorkflow(TEMPLATE, { repo: "", claudeExe: "x" })
    ).toBeNull();
  });
});
