"use client";

import { useDesktopHost } from "../../shared/ui/desktop-host-selector";

export function SkillDownload() {
  const { host } = useDesktopHost();
  const root = host === "codex" ? "~/.agents/skills" : "~/.claude/skills";
  return <section aria-labelledby="skill-download-heading" data-host={host}>
    <h2 id="skill-download-heading">Grab skills straight from this site</h2>
    <p className="muted">Every skill’s canonical SKILL.md is served raw at <code>/skills/&lt;name&gt;/SKILL.md</code>. Check its detail page for applicability and prerequisites first. For a self-contained skill, replace <code>&lt;name&gt;</code> in this copy-mode recipe:</p>
    <pre>{"curl -fLo " + root + "/<name>/SKILL.md --create-dirs https://vilya.jerrodtuck.com/skills/<name>/SKILL.md"}</pre>
    <p className="muted">{host === "codex" ? <>Codex discovers user skills in <code>~/.agents/skills</code>. Verify the resolved source and invocation in your session after download.</> : <>Cursor scans <code>~/.claude/skills</code> as a compatibility root, so this destination serves Claude Code and Cursor.</>}</p>
    <p className="muted">A downloaded file is a plain copy: update it by downloading again, or clone Vilya and use the installer to link the source. A single SKILL.md does not include referenced scripts or other resources; use the complete linked install for skills that need those files.</p>
  </section>;
}
