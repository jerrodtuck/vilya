// Feature slice: setup — Claude Code ⇄ Cursor install-path toggle (client leaf).
"use client";

import { useState } from "react";

export function PlatformToggle() {
  const [tool, setTool] = useState<"cc" | "cur">("cc");

  return (
    <>
      <div className="toggle" role="tablist">
        <button
          type="button"
          className={tool === "cc" ? "on" : ""}
          onClick={() => setTool("cc")}
        >
          Claude Code
        </button>
        <button
          type="button"
          className={tool === "cur" ? "on" : ""}
          onClick={() => setTool("cur")}
        >
          Cursor
        </button>
      </div>

      {tool === "cc" ? (
        <div className="pane on">
          <p>
            Run the sync script from the repo root — it installs every skill to
            your user-level directory:
          </p>
          <pre>{`pwsh scripts/install-skills.ps1        # Windows (or plain PowerShell)
bash scripts/install-skills.sh         # macOS / Linux / Git Bash`}</pre>
          <p>
            Skills land in <code>~/.claude/skills/&lt;skill-name&gt;/SKILL.md</code>{" "}
            (user level, all projects). A repo that needs its own variant can
            override at <code>.claude/skills/</code> — project-level skills win
            over user-level ones by name. Claude Code reads the shared
            frontmatter plus its extensions (<code>allowed-tools</code>,{" "}
            <code>context: fork</code>, <code>{"${CLAUDE_SKILL_DIR}"}</code>, …).
          </p>
        </div>
      ) : (
        <div className="pane on">
          <p>
            The same script installs the same <code>SKILL.md</code> files to
            Cursor&apos;s directory in the same pass:
          </p>
          <pre>{`~/.cursor/skills/<skill-name>/SKILL.md     # user level (all projects)
.cursor/skills/<skill-name>/SKILL.md      # project level (override)`}</pre>
          <p>
            Cursor reads the <b>same</b> <code>name</code> /{" "}
            <code>description</code> / <code>disable-model-invocation</code> and
            honors the references pattern. It silently ignores Claude
            Code&apos;s extra fields — no conversion, no second copy. (If you
            also keep Cursor <code>.mdc</code> <i>rules</i>, those are a
            separate Cursor-only format — not needed for these skills.)
          </p>
        </div>
      )}
    </>
  );
}
