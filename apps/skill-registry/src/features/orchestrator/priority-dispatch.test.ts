// #314: orch dispatches by priority:* descending then age (oldest first) --
// mirrors Planner's needs:plan drain order. Unmarked peer handoffs are not a
// dispatch cue; only "dispatch:" / "do-not-dispatch, filed-for-record" are.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLAUDE_ORCH_PROMPT_LABEL } from "./claude-dispatch";
import { CURSOR_ORCH_PROMPT_LABEL } from "./cursor-dispatch";
import {
  DISPATCH_PRIORITY_DOCTRINE,
  DISPATCH_PRIORITY_ORCH_DOCTRINE,
  HANDOFF_DISPATCH_MARKER_DOCTRINE,
  PROMPTS,
} from "./prompts";

function orchItem(label: string) {
  const orch = PROMPTS.find((g) => g.node === "ORCH");
  expect(orch).toBeDefined();
  const item = orch!.items.find((i) => i.label === label);
  if (!item) throw new Error(`missing ORCH item: ${label}`);
  return item.text;
}

function readOrchSkill(slug: "vl-orch-claude" | "vl-orch-cursor"): string {
  const bundled = path.resolve(process.cwd(), "content/skills", slug, "SKILL.md");
  const monorepo = path.resolve(process.cwd(), "../../skills", slug, "SKILL.md");
  const skillPath = fs.existsSync(bundled) ? bundled : monorepo;
  return fs.readFileSync(skillPath, "utf8");
}

describe("Dispatch priority order (#314)", () => {
  it("ranks the candidate set by priority:* descending, then age (oldest first)", () => {
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain(
      "priority:critical > priority:high > priority:medium > priority:low",
    );
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain("age (oldest first)");
    expect(DISPATCH_PRIORITY_DOCTRINE).toMatch(/highest priority, then\s+oldest/i);
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain("needs:plan");
  });

  it("does not chip a lower-priority candidate while a higher one waits, unless the operator names the exception", () => {
    expect(DISPATCH_PRIORITY_DOCTRINE).toMatch(
      /Do not chip a lower-priority candidate while a higher-priority dispatchable one is waiting/,
    );
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain("unless the operator names the exception");
  });

  it("daytime clarity joins the candidate set without waiving priority order", () => {
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain("plan:ready");
    expect(DISPATCH_PRIORITY_DOCTRINE).toMatch(/clarity does not waive priority order/i);
  });

  it("type:epic never enters the ranking -- dispatchable issues only", () => {
    expect(DISPATCH_PRIORITY_DOCTRINE).toMatch(/type:epic is not a chip target/i);
  });

  it("operator override is sacred; peer-session handoffs do not carry that authority", () => {
    expect(DISPATCH_PRIORITY_DOCTRINE).toMatch(/Operator override is sacred/);
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain("do #<N> now");
    expect(DISPATCH_PRIORITY_DOCTRINE).toContain("peer-session handoffs do not carry that authority");
  });

  it("Claude and Cursor standing orders both compose the dispatch priority + handoff doctrine", () => {
    const claude = orchItem(CLAUDE_ORCH_PROMPT_LABEL);
    const cursor = orchItem(CURSOR_ORCH_PROMPT_LABEL);
    expect(claude).toContain(DISPATCH_PRIORITY_ORCH_DOCTRINE);
    expect(cursor).toContain(DISPATCH_PRIORITY_ORCH_DOCTRINE);
  });

  it("both orch skill files teach the same priority-then-age ranking (#314)", () => {
    const claudeSkill = readOrchSkill("vl-orch-claude");
    const cursorSkill = readOrchSkill("vl-orch-cursor");
    for (const skill of [claudeSkill, cursorSkill]) {
      expect(skill).toContain("## Dispatch priority (#314)");
      expect(skill).toContain(
        "priority:critical` > `priority:high` > `priority:medium` >",
      );
      expect(skill).toMatch(/highest priority, then\s+oldest/i);
      expect(skill).toMatch(/type:epic` is \*\*not\*\* a chip target/);
      expect(skill).toMatch(/Operator override is sacred/);
    }
  });
});

describe("Handoff priority marker (#314)", () => {
  it("requires an explicit dispatch: or do-not-dispatch marker on cross-session mentions", () => {
    expect(HANDOFF_DISPATCH_MARKER_DOCTRINE).toContain("dispatch:");
    expect(HANDOFF_DISPATCH_MARKER_DOCTRINE).toContain(
      "do-not-dispatch, filed-for-record",
    );
    expect(HANDOFF_DISPATCH_MARKER_DOCTRINE).toMatch(
      /not a dispatch cue by itself/i,
    );
  });

  it("unmarked peer handoffs are treated as record-only, not a dispatch cue", () => {
    expect(HANDOFF_DISPATCH_MARKER_DOCTRINE).toMatch(
      /unmarked peer handoff carries neither meaning/i,
    );
    expect(HANDOFF_DISPATCH_MARKER_DOCTRINE).toMatch(/record-only/i);
  });

  it("both orch skill files teach the dispatch: / do-not-dispatch marker split", () => {
    const claudeSkill = readOrchSkill("vl-orch-claude");
    const cursorSkill = readOrchSkill("vl-orch-cursor");
    for (const skill of [claudeSkill, cursorSkill]) {
      expect(skill).toContain("**Handoff priority marker:**");
      expect(skill).toContain("`dispatch:`");
      expect(skill).toContain("`do-not-dispatch, filed-for-record`");
      expect(skill).toMatch(/unmarked peer handoff carries neither meaning/i);
    }
  });
});
