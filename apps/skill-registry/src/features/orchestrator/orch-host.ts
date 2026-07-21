// Feature slice: orchestrator — filter standing-orders / prompts by desktop host (#285).
import { SKILL_INVOKES } from "../../shared/skills/invokes";
import type { DesktopHostId } from "../../shared/ui/desktop-host";
import type { PromptGroup } from "../../shared/ui/flow-map-types";
import { CLAUDE_DISPATCH_PANEL_ID } from "./claude-dispatch";
import { CURSOR_DISPATCH_PANEL_ID, CURSOR_HANDOFF_SKILL } from "./cursor-dispatch";

export const ORCH_PAGE_HREF = "/orch";

export const ORCH_INTRO_BY_HOST: Record<DesktopHostId, string> = {
  cc: `This is a <b>menu, not a sequence</b>: pick the <b>one</b> card matching this session's role — never stack cards. Once you seat the <b>Claude Code orch</b>, follow the <a href="#${CLAUDE_DISPATCH_PANEL_ID}">spawn_task chip path</a> above — daytime default is <code>${SKILL_INVOKES.chip}</code> → <code>spawn_task</code> (Monitor + issue comment wake).`,
  cursor: `This is a <b>menu, not a sequence</b>: pick the <b>one</b> card matching this session's role — never stack cards. Once you seat the <b>Cursor orch</b>, follow the <a href="#${CURSOR_DISPATCH_PANEL_ID}">Task/BoN Cursor path</a> above — daytime default is worktree-first Task/BoN chips (Task return + issue comment wake). Worker A (<code>/${CURSOR_HANDOFF_SKILL}</code>) is the collapsed fallback when not using Task chips.`,
};

export const ORCH_NOTE_BY_HOST: Record<DesktopHostId, string | undefined> = {
  cc: "After squash-merge, <b>/vl-prune</b> is an orch job from the main clone when Cursor worktrees are in play — Claude Archive / delete do not clean <code>.cursor\\worktrees</code>.",
  cursor:
    "⚠ Daytime Cursor default is <b>Task/BoN</b> (see path panel). <b>Worker A and B are mutually exclusive per issue</b> — use them only as fallback / solo mode. If the orch kickoff already ran <code>/vl-start-feature</code>, use <b>A</b> — pasting B would double-create the issue's worktree and branch. Use <b>B</b> only when nothing has set the issue up yet. After squash-merge, <b>/vl-prune</b> is an orch job from the main clone — Cursor Archive / Claude delete do not clean <code>.cursor\\worktrees</code>. <code>/vl-prune --apply</code> authorizes scoped kills of lock holders whose cmdline names the eligible worktree; dry-run only previews.",
};

/** Keep items whose host matches, or items with no host (shared). */
export function filterPromptsForHost(
  groups: PromptGroup[],
  host: DesktopHostId
): PromptGroup[] {
  return groups
    .map((g) => {
      const items = g.items.filter((it) => !it.host || it.host === host);
      if (items.length === 0) return null;
      const next: PromptGroup = { ...g, items };
      if (g.node === "ORCH") {
        next.introHtml = ORCH_INTRO_BY_HOST[host];
        next.noteHtml = ORCH_NOTE_BY_HOST[host];
      }
      return next;
    })
    .filter((g): g is PromptGroup => g !== null);
}
