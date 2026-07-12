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
  ["typeFieldLine", "Type field line"],
  ["priorityFieldLine", "Priority field line"],
] as const;

const STATUS_FORM_FIELDS = [
  ["statusTodo", "Status · Todo"],
  ["statusInProgress", "Status · In Progress"],
  ["statusBlocked", "Status · Blocked"],
  ["statusVerifying", "Status · Verifying"],
  ["statusDone", "Status · Done"],
] as const;

type FormFieldKey = (typeof FORM_FIELDS)[number][0];
type StatusFormKey = (typeof STATUS_FORM_FIELDS)[number][0];

type FormState = Record<FormFieldKey | StatusFormKey, string> & {
  areaLabels: string;
};

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
  typeFieldLine: "",
  priorityFieldLine: "",
  statusTodo: "",
  statusInProgress: "",
  statusBlocked: "",
  statusVerifying: "",
  statusDone: "",
  areaLabels: "",
};

function formToOverrides(form: FormState): Partial<GithubProjectsConfig> {
  const labels = form.areaLabels
    .split(/[·,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("area:") ? s : `area:${s}`));

  const overrides: Partial<GithubProjectsConfig> = {
    areaLabels: labels,
    statusOptions: {
      todo: form.statusTodo,
      inProgress: form.statusInProgress,
      blocked: form.statusBlocked,
      verifying: form.statusVerifying,
      done: form.statusDone,
    },
  };
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
  const [showForm, setShowForm] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

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
    ? missing > 0
      ? `Live — ${kept} kept · ${missing} missing. Fill gaps in the form — Generated updates as you type.`
      : `Live — ${kept} kept · 0 missing. Copy or download the Generated file.`
    : "Live on paste — leave blank and fill the form for a new repo, or paste then fill any gaps.";

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

  const revealForm = () => {
    setShowForm(true);
    queueMicrotask(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  return (
    <div className="gptool">
      <p className="muted" style={{ lineHeight: 1.55, marginTop: 0 }}>
        Paste a product repo&apos;s current file (or leave blank for a new
        repo). Config values are extracted and filled into Vilya&apos;s latest
        template — process sections always come from here. Anything still
        missing can be typed in the form; both feed the Generated file live.
        Copy or download; nothing is pushed to GitHub.
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
          onClick={() => (showForm ? setShowForm(false) : revealForm())}
        >
          {showForm
            ? "Hide fill-in form"
            : missing > 0
              ? `Fill ${missing} missing fields`
              : "Show fill-in form"}
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
        <div className="gpform" ref={formRef}>
          <p className="muted" style={{ marginTop: 0 }}>
            Non-empty fields override the paste and write into the Generated
            file immediately. Use this for gaps (Stack, Crucible, Test command,
            …) or the whole new-repo path with paste empty.
          </p>
          <div className="gpgrid">
            {FORM_FIELDS.map(([key, label]) => (
              <label
                key={key}
                className={`gplabel${
                  key === "typeFieldLine" || key === "priorityFieldLine"
                    ? " gpwide"
                    : ""
                }`}
              >
                {label}
                <input
                  className="gpinput"
                  value={form[key]}
                  onChange={setField(key)}
                  placeholder={
                    key === "stack"
                      ? "e.g. blazor or nextjs"
                      : key === "crucibleVariant"
                        ? "e.g. crucible-blazor"
                        : key === "defaultBranch"
                          ? "main or master"
                          : key === "typeFieldLine"
                            ? "Type  (PVTSSF_…): Roadmap … · Epic …"
                            : key === "priorityFieldLine"
                              ? "Priority (PVTSSF_…): Critical … · High …"
                              : undefined
                  }
                  spellCheck={false}
                />
              </label>
            ))}
            {STATUS_FORM_FIELDS.map(([key, label]) => (
              <label key={key} className="gplabel">
                {label}
                <input
                  className="gpinput"
                  value={form[key]}
                  onChange={setField(key)}
                  placeholder="option id"
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
              {item.status === "kept" ? (
                item.value
              ) : (
                <button
                  type="button"
                  className="gplink"
                  onClick={revealForm}
                >
                  missing — fill in form
                </button>
              )}
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
