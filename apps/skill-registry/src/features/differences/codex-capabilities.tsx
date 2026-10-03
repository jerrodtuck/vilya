export function CodexCapabilities() {
  return <div className="panel">
    <h3>Codex evidence and limits · checked 2026-10-03</h3>
    <dl>
      <dt>Isolation</dt><dd>Official worktree documentation supports separate checkouts. Current exposed subagent contracts share a workspace: the brief must supply and verify the assigned absolute path and branch.</dd>
      <dt>Coordination</dt><dd>Exposed collaboration tools support spawn, message, follow-up and active-turn wait. Exposed app tools identify/read chats and send authorized messages. Discover the actual tools in each session.</dd>
      <dt>Models</dt><dd>Inspect runtime model, reasoning and context-fork combinations. The approved policy prefers the highest-capability planning family and balanced coding/workhorse family; explicit operator overrides win.</dd>
      <dt>Recovery and cleanup</dt><dd>Inspect attachment identity and checkout state before resuming. Use managed archive/restore tools for managed worktrees; generic filesystem deletion loses that recovery contract.</dd>
      <dt>Managed registration</dt><dd>Verify owning-chat attachments with list_artifacts; recover failed registration with attach_worktree. Managed trees may begin detached, so verify an explicit issue branch and absolute workdir. Permanent projects and sidebar chats are separate; ordinary subagents require neither. GUI visibility is not a Vilya acceptance gate.</dd>
      <dt>Acceptance boundary</dt><dd>These are documentation and tool-contract checks, not a passed Vilya runtime cycle. Full-cycle acceptance, amendment delivery and interrupted-chip recovery remain tracked by <a href="https://github.com/jerrodtuck/vilya/issues/329">#329</a>. Codex CLI and a new unattended backend are deferred.</dd>
    </dl>
    <p><a href="https://learn.chatgpt.com/docs/environments/git-worktrees">Official worktrees</a>{" · "}<a href="https://learn.chatgpt.com/docs/build-skills">Official skills</a>{" · "}<a href="https://developers.openai.com/api/docs/guides/model-selection">Model selection</a></p>
    <p><a href="/setup?host=codex">Install and verify discovery</a>{" → "}<a href="/orch?host=codex">Planning, chips, messaging and recovery</a>{" · "}<a href="/architect?host=codex">Architect entry</a></p>
    <p className="muted">Cursor cross-seat messaging capability has not been established by this Codex check; no absence or parity is inferred.</p>
  </div>;
}
