// Reference teaching accompanies the source-derived registry.
export function SkillsReference() {
  return (
    <>
      <h2>Install the complete skill folders</h2>
      <p>Run <code>pwsh scripts/install-skills.ps1</code> on Windows or{" "}
        <code>bash scripts/install-skills.sh</code> on macOS/Linux. The default remains{" "}
        <code>~/.claude/skills</code>; Cursor can discover this compatibility root.
        Older Cursor builds can add <code>-IncludeCursor</code> / <code>--include-cursor</code>.
        Each skill is linked to the repo, so updates follow <code>git pull</code>.</p>
      <p>For Codex, add <code>-IncludeCodex</code> / <code>--include-codex</code> to also link{" "}
        <code>~/.agents/skills</code>. An explicit <code>-TargetRoot</code> / <code>--target-root</code>{" "}
        replaces all default and included roots. Installing a skill does not make it compatible:
        check its Codex applicability and prerequisites before invoking it.</p>
      <h2>User and project discovery</h2>
      <p>Claude Code and Cursor can use repo-specific <code>.claude/skills</code> /{" "}
        <code>.cursor/skills</code> variants. Codex scans <code>.agents/skills</code> from the
        working directory through the repository root, plus <code>~/.agents/skills</code>.
        Codex follows linked skill folders; duplicate names are not merged and may both appear.
        Keep per-repo configuration in <code>GITHUB-PROJECTS.md</code> where possible.</p>
      <h2>Invocation and host policy</h2>
      <p>Claude Code / Cursor use the existing slash commands. Codex skills use explicit dollar
        mentions such as <code>$vl-orch-codex</code>. Skill descriptions also support implicit
        selection. The registry reads Codex compatibility, host behavior, invocation and
        prerequisites from each canonical <code>SKILL.md</code>; unclassified, unsupported and
        other-host entries do not receive a runnable Codex command.</p>
      <p><code>codex-support</code>, <code>codex-notes</code>, <code>codex-invocation</code> and{" "}
        <code>codex-prerequisites</code> are Vilya display metadata, not host-enforced policy.
        Claude-specific fields such as <code>disable-model-invocation</code>, <code>context</code>,{" "}
        <code>agent</code> or <code>model</code> do not prove Codex behavior. Codex can configure
        implicit invocation with <code>policy.allow_implicit_invocation</code> in{" "}
        <code>agents/openai.yaml</code>. Follow each skill&apos;s host instructions and current tools.</p>
      <h2>Supporting resources</h2>
      <p>Keep scripts, references, assets and optional <code>agents/openai.yaml</code> with the
        skill folder. The registry bundle preserves these resources. A raw <code>SKILL.md</code>{" "}
        download contains only that file; use the repository installer for a complete installation.</p>
      <p className="muted">Discovery and invocation reference:{" "}
        <a href="https://learn.chatgpt.com/docs/build-skills">OpenAI Build skills documentation</a>{" "}
        (checked October 3, 2026). Filesystem tests do not establish real app discovery or
        completion of a Codex desktop workflow.</p>
      <div className="pagefoot">Read each skill&apos;s full source and history above. See{" "}
        <a href="/setup">Setup</a> for host-specific instructions.</div>
    </>
  );
}
