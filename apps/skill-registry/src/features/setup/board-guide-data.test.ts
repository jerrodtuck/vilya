import { describe, expect, it } from "vitest";
import {
  BOARD_AUTOMATIONS,
  BOARD_LEVELS,
  CANON_SETUP_URL,
  PROJECT_CREATE_COMMAND,
  PROJECT_SCOPE_COMMAND,
} from "./board-guide-data";

describe("board guide — level fork", () => {
  it("presents exactly the two ownership levels Projects v2 supports", () => {
    expect(Object.keys(BOARD_LEVELS).sort()).toEqual(["org", "user"]);
  });

  it("recommends exactly one level, and it is user (current default)", () => {
    const recommended = Object.entries(BOARD_LEVELS).filter(
      ([, l]) => l.recommended
    );
    expect(recommended).toHaveLength(1);
    expect(recommended[0][0]).toBe("user");
  });

  it("both levels carry non-empty costs — the fork is documented, not decided", () => {
    for (const level of Object.values(BOARD_LEVELS)) {
      expect(level.costs.length).toBeGreaterThan(0);
      for (const cost of level.costs) expect(cost.trim().length).toBeGreaterThan(20);
    }
  });

  it("user-level costs name the migration price: ids change, config blocks regenerate", () => {
    const joined = BOARD_LEVELS.user.costs.join(" ");
    expect(joined).toContain("option ids change");
    expect(joined).toContain("config block regenerates");
  });

  it("org-level costs name the Actions-entitlement caveat", () => {
    expect(BOARD_LEVELS.org.costs.join(" ")).toContain(
      "Actions entitlements follow the org's plan"
    );
  });
});

describe("board guide — dependencies", () => {
  it("pins the exact create + scope commands", () => {
    expect(PROJECT_CREATE_COMMAND).toBe("gh project create --owner <user>");
    expect(PROJECT_SCOPE_COMMAND).toBe("gh auth refresh -s project");
  });

  it("links the canon's One-time repo setup anchor", () => {
    expect(CANON_SETUP_URL).toContain("GITHUB-PROJECTS.md");
    expect(CANON_SETUP_URL).toContain("#one-time-repo-setup");
  });
});

describe("board guide — automations (half the mover map, epic #169)", () => {
  it("lists the canon's six workflows exactly once each", () => {
    const names = BOARD_AUTOMATIONS.map((a) => a.workflow);
    expect(names).toHaveLength(6);
    expect(new Set(names).size).toBe(6);
  });

  it("flags the four mover-map transitions with their targets", () => {
    const movers = Object.fromEntries(
      BOARD_AUTOMATIONS.filter((a) => a.moverMap).map((a) => [a.workflow, a.setting])
    );
    expect(movers).toEqual({
      "Auto-add to project": "filter is:issue",
      "Item added to project": "Status: Todo",
      "Item reopened": "Status: In Progress",
      "Pull request merged": "Status: Done",
    });
  });

  it("keeps the two hygiene workflows off the mover map", () => {
    const hygiene = BOARD_AUTOMATIONS.filter((a) => !a.moverMap).map((a) => a.workflow);
    expect(hygiene.sort()).toEqual(["Auto-add sub-issues to project", "Item closed"]);
  });

  it("every workflow says what to set", () => {
    for (const a of BOARD_AUTOMATIONS) {
      expect(a.setting.trim().length).toBeGreaterThan(0);
    }
  });
});
