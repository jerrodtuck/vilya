import { describe, expect, it } from "vitest";
import {
  STAGE_ORDER,
  STAGES,
  isDistinctKind,
  stageList,
  type StageId,
} from "./data";
import { EDGES, STAGE_GEOMS, edgeTouches } from "./map-geometry";

describe("night-agent stage model", () => {
  it("exports exactly the seven planned stage ids in order", () => {
    expect([...STAGE_ORDER]).toEqual([
      "DISPATCH",
      "RUNNER",
      "IDENTITY",
      "LOOP",
      "STEERING",
      "OUTPUTS",
      "FAILURE",
    ]);
    expect(Object.keys(STAGES).sort()).toEqual([...STAGE_ORDER].sort());
  });

  it("marks Steering as safety and Failure as failure", () => {
    expect(STAGES.STEERING.kind).toBe("safety");
    expect(STAGES.FAILURE.kind).toBe("failure");
    expect(isDistinctKind(STAGES.STEERING.kind)).toBe(true);
    expect(isDistinctKind(STAGES.FAILURE.kind)).toBe(true);
    expect(isDistinctKind(STAGES.DISPATCH.kind)).toBe(false);
  });

  it("gives every stage a non-empty drawer body", () => {
    for (const id of STAGE_ORDER) {
      const stage = STAGES[id as StageId];
      expect(stage.bodyHtml.trim().length).toBeGreaterThan(40);
      expect(stage.title.trim().length).toBeGreaterThan(0);
      expect(stage.chipLabel.trim().length).toBeGreaterThan(0);
    }
  });

  it("stageList follows STAGE_ORDER", () => {
    expect(stageList().map((s) => s.id)).toEqual([...STAGE_ORDER]);
  });

  it("Dispatch documents active cron and Identity documents the two-token split", () => {
    expect(STAGES.DISPATCH.bodyHtml).toContain("0 8 * * *");
    expect(STAGES.DISPATCH.bodyHtml).toContain("workflow_dispatch");
    expect(STAGES.IDENTITY.bodyHtml).toContain("claude[bot]");
    expect(STAGES.IDENTITY.bodyHtml).toContain("CLAUDE_CODE_OAUTH_TOKEN");
    expect(STAGES.IDENTITY.bodyHtml).toContain("id-token: write");
  });

  it("Failure layer lists the bring-up walls and shared-profile caveat", () => {
    const html = STAGES.FAILURE.bodyHtml;
    expect(html).toContain("WSL bash stub");
    expect(html).toContain("CLAUDE_CODE_GIT_BASH_PATH");
    expect(html).toContain("Label mismatch");
    expect(html).toContain("id-token: write");
    expect(html).toContain("pre-installed");
    expect(html).toContain("Shared-profile caveat");
    expect(html).toContain("~/.claude");
  });

  it("Runner stage documents run.cmd bring-up and label matching", () => {
    const html = STAGES.RUNNER.bodyHtml;
    expect(html).toContain(".\\run.cmd");
    expect(html).toContain("runs-on");
    expect(html).toContain("GITHUB_PATH");
  });

  it("geometry covers every stage once and edges use typed endpoints", () => {
    expect(STAGE_GEOMS.map((g) => g.id).sort()).toEqual([...STAGE_ORDER].sort());
    for (const edge of EDGES) {
      expect(STAGE_ORDER).toContain(edge.from);
      expect(STAGE_ORDER).toContain(edge.to);
    }
    const spine = EDGES.find((e) => e.id === "e-loop-steering")!;
    expect(edgeTouches(spine, "LOOP")).toBe(true);
    expect(edgeTouches(spine, "STEERING")).toBe(true);
    expect(edgeTouches(spine, "DISPATCH")).toBe(false);
  });
});
