// Feature slice: night-shift — generate .github/workflows/night-shift.yml (client).
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  generateNightShiftWorkflow,
  normalizeRepo,
  usualClaudeExe,
  workflowLooksFilled,
} from "./night-shift-workflow-generate";

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyYaml({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    if (!text || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <button
      type="button"
      className={`copybtn${copied ? " done" : ""}`}
      onClick={copy}
      disabled={!text}
      style={{ position: "static" }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function NightShiftWorkflowTool({ template }: { template: string }) {
  const [repo, setRepo] = useState("");
  const [claudeExe, setClaudeExe] = useState(usualClaudeExe());

  const normalized = useMemo(() => normalizeRepo(repo), [repo]);
  const yaml = useMemo(() => {
    if (!normalized) return "";
    return (
      generateNightShiftWorkflow(template, {
        repo,
        claudeExe,
      }) ?? ""
    );
  }, [template, repo, claudeExe, normalized]);

  const ready = yaml !== "" && workflowLooksFilled(yaml);
  const live = !normalized
    ? "Enter owner/repo or a short repo name."
    : ready
      ? `Ready — save as .github/workflows/night-shift.yml in ${normalized.full}. Runner folder: C:\\actions-runners\\${normalized.short}`
      : "Fill claude.exe path (or leave the marker and edit after download).";

  return (
    <div className="gptool" style={{ marginTop: 14 }}>
      <label className="gplabel" htmlFor="nsw-repo">
        Repo <code>owner/repo</code> or short name
      </label>
      <input
        id="nsw-repo"
        className="gpinput"
        type="text"
        spellCheck={false}
        autoComplete="off"
        placeholder="jerrodtuck/anduin"
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
      />

      <label className="gplabel" htmlFor="nsw-claude">
        <code>path_to_claude_code_executable</code> on this machine
      </label>
      <input
        id="nsw-claude"
        className="gpinput"
        type="text"
        spellCheck={false}
        autoComplete="off"
        placeholder={usualClaudeExe()}
        value={claudeExe}
        onChange={(e) => setClaudeExe(e.target.value)}
      />
      <div className="gpsugs" style={{ marginTop: 6 }}>
        <button
          type="button"
          className="gpsug"
          onClick={() => setClaudeExe(usualClaudeExe())}
        >
          Usual: {usualClaudeExe()}
        </button>
      </div>

      <p className={`gplive${ready ? " active" : ""}`}>{live}</p>

      <div className="gprow">
        <CopyYaml text={yaml} />
        <button
          type="button"
          className="setupbtn"
          disabled={!yaml}
          onClick={() => downloadText(yaml, "night-shift.yml")}
        >
          Download night-shift.yml
        </button>
      </div>

      {yaml ? (
        <pre className="gpout" aria-label="Generated night-shift workflow">
          {yaml}
        </pre>
      ) : null}

      <p className="muted" style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.5 }}>
        After saving: register a self-hosted runner on that <b>private</b> repo
        (folder above; labels <code>self-hosted</code>, <code>windows</code>),
        add secret <code>CLAUDE_CODE_OAUTH_TOKEN</code>, confirm{" "}
        <b>Stack / Crucible / Test command</b> in{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>, then{" "}
        <code>gh workflow run night-shift</code>.
      </p>
    </div>
  );
}
