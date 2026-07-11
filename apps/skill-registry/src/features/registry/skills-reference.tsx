// Feature slice: registry — hand-authored reference sections that accompany
// the live skill list (frontmatter portability, references pattern).
export function SkillsReference() {
  return (
    <>
      <div className="callout warn">
        <b>Why Crucible is &quot;manual only.&quot;</b> The reviews carry{" "}
        <code>disable-model-invocation: true</code> — a deliberate, heavy
        review you run on command, not something that auto-fires on
        &quot;review this.&quot; <b>night-shift must NOT</b> have that flag: it
        would stop a scheduled task from firing the skill.
      </div>

      <h2>Where skills live — user vs. project level</h2>
      <div className="grid2">
        <div className="refcard">
          <h3>◆ User level (every canonical skill)</h3>
          <ul>
            <li>
              Installed <b>once</b> by <code>scripts/install-skills</code> into{" "}
              <code>~/.claude/skills/</code> — the single install root
            </li>
            <li>
              Cursor discovers the same directory through its compatibility
              roots — no second copy (it would double-list every skill in
              Cursor&apos;s slash menu)
            </li>
            <li>Shared by every project on the machine</li>
            <li>
              Update in one place — the repo&apos;s <code>skills/</code> is the
              source of truth; re-run the script to sync
            </li>
          </ul>
        </div>
        <div className="refcard">
          <h3>◆ Project level (the override)</h3>
          <ul>
            <li>
              A repo may carry <code>.claude/skills/&lt;name&gt;/</code> (or{" "}
              <code>.cursor/skills/&lt;name&gt;/</code>)
            </li>
            <li>
              <b>Wins by name</b> over the user-level skill — the escape hatch
              for a repo that needs a custom variant
            </li>
            <li>
              None of the canonical skills require this; per-repo variation
              belongs in <code>GITHUB-PROJECTS.md</code>, not skill forks
            </li>
          </ul>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        <b style={{ color: "var(--text)" }}>One set of skills, both tools:</b>{" "}
        Cursor honors the same SKILL.md standard <i>and</i> scans{" "}
        <code>~/.claude/skills</code> itself, so the Claude-format skills here
        are the <i>only</i> skills and <code>~/.claude/skills</code> is the
        only install location — nothing Cursor-specific is ever authored or
        copied. (Older Cursor builds that read only{" "}
        <code>~/.cursor/skills</code>: run the install script with{" "}
        <code>--include-cursor</code> / <code>-IncludeCursor</code>.)
      </p>

      <h2>Frontmatter — shared vs. platform extensions</h2>
      <p className="muted">
        Author one <code>SKILL.md</code>. The shared fields work in both tools;
        Claude Code&apos;s extensions are additive and silently ignored by
        Cursor.
      </p>
      <div className="grid2">
        <div className="refcard">
          <h3>✅ Shared (portable — define once)</h3>
          <ul>
            <li>
              <code>name</code> — identifier / display name
            </li>
            <li>
              <code>description</code> — what it does + when to trigger
            </li>
            <li>
              <code>disable-model-invocation</code> — invoke-only, honored by
              both
            </li>
            <li>
              Supporting files / references — markdown links to files in the
              skill folder, loaded on demand
            </li>
          </ul>
        </div>
        <div className="refcard">
          <h3>➕ Claude Code extensions (ignored by Cursor)</h3>
          <ul>
            <li>
              <code>allowed-tools</code> / <code>disallowed-tools</code>
            </li>
            <li>
              <code>context: fork</code> + <code>agent</code> (subagent run)
            </li>
            <li>
              <code>model</code> · <code>effort</code> ·{" "}
              <code>argument-hint</code> · <code>arguments</code>
            </li>
            <li>
              <code>hooks</code> · <code>paths</code> ·{" "}
              <code>{"${CLAUDE_SKILL_DIR}"}</code> path substitution
            </li>
          </ul>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        <b style={{ color: "var(--text)" }}>Rule of thumb:</b> keep anything
        that must work in <i>both</i> tools in the shared fields and the body.
        Use Claude-only fields only as enhancements that degrade gracefully —
        never for behavior Cursor needs to get right.
      </p>

      <h2>References (supporting files)</h2>
      <p className="muted">
        Both tools support the same progressive-disclosure pattern: drop extra
        files (<code>reference.md</code>, <code>examples.md</code>,{" "}
        <code>scripts/</code>) in the skill folder and link them from{" "}
        <code>SKILL.md</code>; the agent loads them on demand. Claude Code adds{" "}
        <code>{"${CLAUDE_SKILL_DIR}"}</code> so bundled scripts resolve wherever
        the skill is installed. Our skills don&apos;t need references yet — but
        this is how you&apos;d bundle, say, a shared VSA cheat-sheet with the
        Crucible reviews.
      </p>

      <div className="pagefoot">
        Each skill&apos;s full text, frontmatter, and version history is one
        click away above — read live from <code>skills/</code>. See{" "}
        <a href="/setup">Setup</a> for where to install them per platform.
      </div>
    </>
  );
}
