import { CopyButton } from "../../shared/ui/copy-button";

const VERIFY_DISCOVERY = "In this Codex desktop session, discover the installed vl-orch-codex and vl-arch skills. Report the exact resolved source paths and their Codex support, invocation and prerequisites. Read the intended skill source and perform a read-only invocation check without seating another role or dispatching work. If missing, shadowed, stale or unsupported, stop and report the evidence; installation success alone is not discovery proof.";

export function CodexSetup() {
  return <section className="panel" id="codex-setup" data-host="codex">
    <h2>Install and verify Codex desktop skills</h2>
    <p>From the Vilya checkout, add the Codex target while preserving the Claude Code/Cursor default:</p>
    <pre>{"pwsh scripts/install-skills.ps1 -IncludeCodex\nbash scripts/install-skills.sh --include-codex"}</pre>
    <p>Codex uses <code>$HOME/.agents/skills</code>. The existing default remains <code>~/.claude/skills</code>; an explicit custom target takes precedence. Keep links pointing at the canonical source. Avoid duplicate or shadowing installations.</p>
    <h3>Discovery is a separate check</h3>
    <p>Open or refresh a Codex desktop session and inspect its available skills. Use the supported dollar invocation, such as <code>$vl-orch-codex</code>, or explicitly read and apply the resolved SKILL.md source when native invocation is unavailable. Check the skill detail page for applicability, prerequisites and host behavior before use.</p>
    <p>{VERIFY_DISCOVERY}</p><CopyButton text={VERIFY_DISCOVERY} />
    <p className="note">Record the actual discovered source, invocation result and session/tool context on the owning issue. Installer tests do not prove runtime discovery. The integrated discovery and full desktop acceptance evidence belongs to <a href="https://github.com/jerrodtuck/vilya/issues/329">#329</a>; do not call it verified from these instructions.</p>
    <h3>Prepare the repo and seats</h3>
    <p>Complete the shared per-repo board/config setup below. Read local rules and expose the required GitHub, skills, collaboration and managed-worktree tools. The orch owns planning; there is no standing Codex Planner to launch. Paste the trusted human entry prompt separately into the <a href="/architect?host=codex">architect</a> and <a href="/orch?host=codex">orch</a> seats, identifying repo, board and counterpart. Each prompt includes standing permission to initiate and reply within that scope.</p>
    <h3>Configure phases before dispatch</h3>
    <p>Use the <a href="/orch?host=codex">model preference card</a> to authorize a phase policy or pin exact choices. Discover available models/reasoning and validate context-fork restrictions. The approved role mapping is Astra planning / Sol implementation, configurable by the operator; preserve configured defaults when no override is authorized. Never silently substitute an unavailable model.</p>
    <h3>Requested sidebar workers</h3>
    <p>If you explicitly request new worker chats, the orch reuses or creates <code>&lt;repo-short&gt;-orch-working</code> and moves every created worker there before reporting dispatch complete. For Vilya: <code>vilya-orch-working</code>. It preserves project association and unrelated chats, verifies no duplicates and reports grouping failures with the created chat identifiers. Ordinary subagents are separate; grouping grants no permission or isolation.</p>
    <h3>Worktree setup, reporting and recovery</h3>
    <p>Choose an explicit verified starting ref, inspect managed attachments, and verify the assigned absolute checkout and branch before writing. Apply ignored-file prerequisites through the repo setup hook or <code>scripts/apply-worktreeinclude</code>; spawning alone does not copy setup or isolate the workspace. Preserve private files without exposing or staging them.</p>
    <p>Follow the <a href="/orch?host=codex#codex-dispatch-path">chip, active-turn wait, amendment, PR verification, interrupted recovery and archival cards</a>. Future wakeups require an explicitly requested automation. Use managed archival and verify attachment state; chat archival alone is not proof of cleanup.</p>
    <p><a href="/differences?host=codex">Evidence and host differences</a>{" · "}<a href="/skills">Every skill’s Codex applicability</a>{" · "}<a href="https://learn.chatgpt.com/docs/build-skills">Official skills documentation</a></p>
    <p>Codex desktop only. Codex CLI and a new Codex unattended backend are deferred. Existing night-shift remains <code>plan:ready ∧ night-shift:ready</code>.</p>
  </section>;
}
