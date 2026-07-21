// #281: one board / two desktops — story data + 2026-07-20 probe rows.
import { describe, expect, it } from "vitest";
import { DIFFERENCES } from "./data";
import {
  FAILURE_MUSEUM,
  HOST_FLOWS,
  SHARED_BOARD,
} from "./host-story";

function row(area: string) {
  const found = DIFFERENCES.find((r) => r.area === area);
  if (!found) throw new Error(`missing differences row: ${area}`);
  return found;
}

describe("one board / two desktops (#281)", () => {
  it("shared board teaches the invariant before host machinery", () => {
    expect(SHARED_BOARD.map((n) => n.id)).toEqual([
      "issue",
      "status",
      "verify",
      "pr",
      "merge",
    ]);
    expect(HOST_FLOWS.cc.steps.some((s) => s.label.includes("Planner"))).toBe(true);
    expect(HOST_FLOWS.cursor.defaultPath).toMatch(/worktree-first/i);
    expect(HOST_FLOWS.cursor.steps.some((s) => /optional/i.test(s.label))).toBe(true);
    expect(HOST_FLOWS.cc.steps.some((s) => /Required/i.test(s.blurb))).toBe(true);
  });

  it("failure museum covers BoN, optional Planner, cloud≠CygNet, resume", () => {
    const titles = FAILURE_MUSEUM.map((f) => f.title).join(" | ");
    expect(titles).toMatch(/BoN/i);
    expect(titles).toMatch(/Planner/i);
    expect(titles).toMatch(/CygNet/i);
    expect(titles).toMatch(/resume/i);
  });

  it("BoN worktree isolation row is confirmed (Support 2026-07-20)", () => {
    const isolation = row("Local Task / BoN worktree isolation");
    expect(isolation.certainty).toBe("confirmed");
    expect(isolation.cursor).toMatch(/does \*\*not\*\* auto-create|does not auto-create/i);
    expect(isolation.cursor).toContain("worktree-first");
    expect(isolation.cursor).toContain("Cursor Support");
    expect(isolation.cursor).toContain("2026-07-20");
    expect(isolation.claudeCode).toContain("spawn_task");
  });

  it("cloud platform gate excludes CygNet", () => {
    const cloud = row("Cloud Task platform gate");
    expect(cloud.certainty).toBe("confirmed");
    expect(cloud.cursor).toContain("Linux VM");
    expect(cloud.cursor).toMatch(/CygNet/);
    expect(cloud.cursor).toMatch(/Anduin/);
  });

  it("dispatch row teaches local BoN + cloud without silent isolation", () => {
    const dispatch = row("Background/dispatched work unit");
    expect(dispatch.certainty).toBe("confirmed");
    expect(dispatch.cursor).toContain("worktree-first");
    expect(dispatch.cursor).toContain("Support 2026-07-20");
    expect(dispatch.note).toMatch(/silent isolation/i);
  });

  it("routing row: CC Planner required; Cursor Planner optional + two-Task", () => {
    const routing = row("Plan-model / execute-model routing");
    expect(routing.cursor).toMatch(/optional/i);
    expect(routing.cursor).toContain("#271");
    expect(routing.cursor).toContain("two Tasks");
    expect(routing.cursor).toMatch(/[Ss]ame model/);
    expect(routing.claudeCode).toContain("standing Planner on Fable");
    expect(routing.note).toMatch(/standing Planner seat is required/i);
  });
});
