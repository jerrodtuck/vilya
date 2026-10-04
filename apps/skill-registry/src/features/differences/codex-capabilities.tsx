import { SKILL_SLUGS } from "../../shared/skills/invokes";
import { codexSkillInvoke } from "../../shared/skills/skill-affordance";

export function CodexCapabilities() {
  return <div className="panel">
    <h3>Codex evidence and limits · checked 2026-10-03</h3>
    <dl>
      <dt>Isolation</dt><dd>Official worktree documentation supports separate checkouts. Current exposed subagent contracts share a workspace: the brief must supply and verify the assigned absolute path and branch.</dd>
      <dt>Coordination</dt><dd>Exposed collaboration tools support spawn, message, follow-up and active-turn wait. Exposed app tools identify/read chats and send authorized messages. Discover the actual tools in each session.</dd>
      <dt>Models</dt><dd>Inspect runtime model, reasoning and context-fork combinations. For the operator who adopted #347, route by uncertainty and consequence: Astra high/xhigh planning, Sol medium settled implementation, Luna low ONLY bounded mechanical operations with objective verification, separate Sol high review, and Astra high or justified xhigh consequential design/security review. Explicit scoped overrides and active pins remain; other operators retain configured defaults. Load the full routing/repair contract before dependent work; source checks do not prove runtime routing or savings.</dd>
      <dt>Recovery and cleanup</dt><dd>Inspect attachment identity and checkout state before resuming. Use managed archive/restore tools for managed worktrees; generic filesystem deletion loses that recovery contract.</dd>
      <dt>Managed registration</dt><dd>Verify owning-chat attachments with list_artifacts; recover failed registration with attach_worktree. Managed trees may begin detached, so verify an explicit issue branch and absolute workdir. Permanent projects and sidebar chats are separate; ordinary subagents require neither. GUI visibility is not a Vilya acceptance gate.</dd>
      <dt>Acceptance boundary</dt><dd>These are documentation and tool-contract checks, not a passed Vilya runtime cycle. Full-cycle acceptance, amendment delivery and interrupted-chip recovery remain tracked by <a href="https://github.com/jerrodtuck/vilya/issues/329">#329</a>. Codex CLI and a new unattended backend are deferred.</dd>
    </dl>
    <section aria-labelledby="codex-worktree-cleanup">
      <h4 id="codex-worktree-cleanup">Automatic cleanup and deliberate close-out</h4>
      <p>In Settings → Worktrees, adjust the retention limit or disable automatic deletion. The documented default, checked 2026-10-03, retains the newest 15 managed worktrees. Your installed setting has not been verified here.</p>
      <p>Automatic cleanup can follow archival of the associated chat or remove older worktrees to meet the configured limit. Worktrees tied to pinned or in-progress chats, and permanent worktrees, are protected. Codex saves a recovery snapshot before removal and offers restoration when you reopen the associated chat. See the <a href="https://learn.chatgpt.com/docs/environments/git-worktrees#worktree-cleanup">official worktree cleanup documentation</a>.</p>
      <p>For Vilya close-out, the owning orch uses <a href="/skills/vl-prune"><code>{codexSkillInvoke(SKILL_SLUGS.prune)}</code></a> to inspect eligibility and <code>--apply</code> only after authorized close-out. Read <code>list_artifacts</code> in the owning chat, pass the exact attachment identity to <code>archive_worktree</code>, and verify the returned artifact state. Preserve needed ignored files separately; use <code>restore_worktree</code> for recovery. Do not substitute raw filesystem deletion.</p>
      <p>A separately created worker sidebar chat can point at a worktree attached to the parent orch. Archiving that worker chat does not prove its assigned attachment was removed. Check the owning chat’s attachment state; sidebar organization and worktree ownership are distinct.</p>
    </section>
    <p><a href="https://learn.chatgpt.com/docs/environments/git-worktrees">Official worktrees</a>{" · "}<a href="https://learn.chatgpt.com/docs/build-skills">Official skills</a>{" · "}<a href="https://developers.openai.com/api/docs/guides/model-selection">Model selection</a></p>
    <p><a href="/setup?host=codex">Install and verify discovery</a>{" → "}<a href="/orch?host=codex">Planning, chips, messaging and recovery</a>{" · "}<a href="/architect?host=codex">Architect entry</a></p>
    <p className="muted">Cursor cross-seat messaging capability has not been established by this Codex check; no absence or parity is inferred.</p>
  </div>;
}
