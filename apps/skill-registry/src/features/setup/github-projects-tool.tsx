// Feature slice: setup — paste → parse → regenerate GITHUB-PROJECTS.md (client leaf).
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  configChecklist,
  mergeConfig,
  type GithubProjectsConfig,
} from "./github-projects-config";
import { generateFromTemplate } from "./github-projects-generate";
import { parseConfig } from "./github-projects-parse";

const FORM_FIELDS = [
  ["owner", "Owner"],
  ["repo", "Repo"],
  ["projectNumber", "Project number"],
  ["projectId", "Project id"],
  ["statusFieldId", "Status field id"],
  ["stack", "Stack"],
  ["crucibleVariant", "Crucible variant"],
  ["testCommand", "Test command"],
  ["manualSmoke", "Manual smoke"],
  ["defaultBranch", "Default branch"],
  ["planningModel", "Planning model"],
  ["executionModel", "Execution model"],
] as const;

type FormFieldKey = (typeof FORM_FIELDS)[number][0];

type FormState = Record<FormFieldKey, string> & { areaLabels: string };

const EMPTY_FORM: FormState = {
  owner: "",
  repo: "",
  projectNumber: "",
  projectId: "",
  statusFieldId: "",
  stack: "",
  crucibleVariant: "",
  testCommand: "",
  manualSmoke: "",
  defaultBranch: "",
  planningModel: "",
  executionModel: "",
  areaLabels: "",
};

function formToOverrides(form: FormState): Partial<GithubProjectsConfig> {
  const labels = form.areaLabels
    .split(/[·,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("area:") ? s : `area:${s}`));

  const overrides: Partial<GithubProjectsConfig> = { areaLabels: labels };
  for (const [key] of FORM_FIELDS) {
    overrides[key] = form[key];
  }
  return overrides;
}

function CopyGenerated({ text }: { text: string }) {
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

export function GithubProjectsTool({
  templateMarkdown,
}: {
  templateMarkdown: string | null;
}) {
  const [paste, setPaste] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  if (!templateMarkdown) {
    return (
      <div className="note">
        <b>Template unavailable.</b> Could not read the bundled{" "}
        <code>content/GITHUB-PROJECTS.md</code> (or{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>) from this
        runtime. Set <code>GITHUB_PROJECTS_TEMPLATE</code>, or rebuild so the
        sync script copies the canonical template into the app.
      </div>
    );
  }

  const parsed = parseConfig(paste);
  const merged = mergeConfig(parsed, formToOverrides(form));
  const generated = generateFromTemplate(merged, templateMarkdown);
  const checklist = configChecklist(merged);
  const kept = checklist.filter((i) => i.status === "kept").length;
  const missing = checklist.filter((i) => i.status === "missing").length;
  const pasteActive = paste.trim() !== "";
  const liveHint = pasteActive
    ? `Live — ${kept} kept · ${missing} missing. Checklist and Generated file update as you paste.`
    : "Live on paste — no Generate button. Checklist + Generated file update immediately; leave blank for a new-repo skeleton.";

  const setField =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const download = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GITHUB-PROJECTS.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gptool">
      <p className="muted" style={{ lineHeight: 1.55, marginTop: 0 }}>
        Paste a product repo&apos;s current file (or leave blank for a new
        repo). Config values are extracted and filled into Vilya&apos;s latest
        template — process sections always come from here. Copy or download;
        nothing is pushed to GitHub.
      </p>

      <label className="gplabel" htmlFor="gp-paste">
        Paste current <code>GITHUB-PROJECTS.md</code>
      </label>
      <textarea
        id="gp-paste"
        className="gptextarea"
        rows={10}
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste markdown here — checklist and Generated file update live (or leave empty and fill the form below for a new repo)"
        spellCheck={false}
      />
      <p
        className={`gplive${pasteActive ? " active" : ""}`}
        aria-live="polite"
      >
        {liveHint}
      </p>

      <div className="gprow">
        <button
          type="button"
          className="setupbtn"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Hide form overrides" : "Show form overrides"}
        </button>
        <button
          type="button"
          className="setupbtn"
          onClick={() => {
            setPaste("");
            setForm(EMPTY_FORM);
          }}
        >
          Clear
        </button>
      </div>

      {showForm ? (
        <div className="gpform">
          <p className="muted" style={{ marginTop: 0 }}>
            Non-empty fields override the paste (new-repo path: leave paste
            empty and fill these).
          </p>
          <div className="gpgrid">
            {FORM_FIELDS.map(([key, label]) => (
              <label key={key} className="gplabel">
                {label}
                <input
                  className="gpinput"
                  value={form[key]}
                  onChange={setField(key)}
                  spellCheck={false}
                />
              </label>
            ))}
            <label className="gplabel gpwide">
              Area labels{" "}
              <span className="muted">(comma or · separated)</span>
              <input
                className="gpinput"
                value={form.areaLabels}
                onChange={setField("areaLabels")}
                placeholder="area:api, area:ui"
                spellCheck={false}
              />
            </label>
          </div>
        </div>
      ) : null}

      <h3 className="gph3">
        Config checklist{" "}
        <span className="muted">
          ({kept} kept · {missing} missing)
        </span>
      </h3>
      <ul className="gpcheck">
        {checklist.map((item) => (
          <li key={item.key} className={item.status}>
            <span className="gpmark">
              {item.status === "kept" ? "✓" : "·"}
            </span>
            <span className="gplab">{item.label}</span>
            <span className="gpval">
              {item.status === "kept" ? item.value : "missing — placeholder"}
            </span>
          </li>
        ))}
      </ul>

      <div className="gprow" style={{ marginTop: 18 }}>
        <h3 className="gph3" style={{ margin: 0, flex: 1 }}>
          Generated file
        </h3>
        <CopyGenerated text={generated} />
        <button type="button" className="setupbtn" onClick={download}>
          Download
        </button>
      </div>
      <pre className="gpout">{generated}</pre>
    </div>
  );
}
