// Feature slice: setup — pure generate: slim config-only product file + canon pointer.

import type { GithubProjectsConfig } from "./github-projects-config";

const PLACEHOLDER = {
  owner: "<owner>",
  repo: "<owner>/<repo>",
  projectNumber: "<n>",
  projectId: "PVT_...",
  statusFieldId: "PVTSSF_...",
  stack: "<stack>",
  crucibleVariant: "vl-crucible-<stack>",
  testCommand: "<test command>",
  manualSmoke: "<manual smoke or live-only>",
  defaultBranch: "master",
  statusTodo: "<todo-id>",
  statusInProgress: "<in-progress-id>",
  statusBlocked: "<blocked-id>",
  statusVerifying: "<verifying-id>",
  statusDone: "<done-id>",
  typeFieldLine:
    "Type  (PVTSSF_...): Roadmap <id> · Epic <id> · Feature <id> · Bug <id> · Task <id>",
  priorityFieldLine:
    "Priority (PVTSSF_...): Critical <id> · High <id> · Medium <id> · Low <id>",
  areaLabels: "`area:<slice>`",
} as const;

const FIELD_LIST_RECIPE = `Get the Status field id + option ids in one shot:

\`\`\`bash
gh project field-list <n> --owner <owner> --format json \\
  --jq '.fields[] | select(.name=="Status") | {id, options: [.options[] | {name, id}]}'
\`\`\``;

const POINTER_HEADER = `# GitHub Projects — repo config

> **Config only.** Process — the daytime/chip chains, labels model, PR + merge
> conventions, night-shift — is canonical in Vilya:
> \`docs/project-tracking/GITHUB-PROJECTS.md\` in the \`jerrodtuck/vilya\` repo,
> described at https://vilya.jerrodtuck.com/setup. Skills read **config** from this
> file and process from their own \`SKILL.md\`. Do not add process prose here — it
> goes stale.`;

const NIGHT_SHIFT_NOTE = `### Night-shift (per-repo)

Only if this repo runs the overnight loop: generate \`.github/workflows/night-shift.yml\`
at https://vilya.jerrodtuck.com/night-shift#generate-workflow (repo + \`claude.exe\`
path), or copy Vilya's \`docs/project-tracking/templates/night-shift.yml\`. Register a
self-hosted runner on this repo (labels \`self-hosted\`, \`windows\`) and set secret
\`CLAUDE_CODE_OAUTH_TOKEN\` (\`claude setup-token\`). **Stack**, **Crucible variant**,
and **Test command** in this file are what the skill uses — no per-stack workflow
fork. Eligibility and guardrails are process — see the canon above.`;

function orPlaceholder(value: string, placeholder: string): string {
  const t = value.trim();
  return t === "" ? placeholder : t;
}

function backtick(value: string): string {
  return `\`${value}\``;
}

/** Code-ish cells: keep paste as-is when it already has backticks; else wrap. */
function codeValue(value: string, placeholder: string): string {
  const v = orPlaceholder(value, placeholder);
  return v.includes("`") ? v : backtick(v);
}

function buildConfigSections(config: GithubProjectsConfig): string {
  const so = config.statusOptions;
  const areaLabels =
    config.areaLabels.length > 0
      ? config.areaLabels.map((a) => backtick(a)).join(" · ")
      : PLACEHOLDER.areaLabels;

  const repoRows: [string, string, string][] = [
    [
      "Owner",
      backtick(orPlaceholder(config.owner, PLACEHOLDER.owner)),
      "your GitHub account/org (e.g. `jerrodtuck`)",
    ],
    [
      "Repo",
      backtick(orPlaceholder(config.repo, PLACEHOLDER.repo)),
      "the repo issues live in",
    ],
    [
      "Project number",
      backtick(orPlaceholder(config.projectNumber, PLACEHOLDER.projectNumber)),
      "`gh project list --owner <owner>`",
    ],
    [
      "Project id",
      backtick(orPlaceholder(config.projectId, PLACEHOLDER.projectId)),
      "`gh project view <n> --owner <owner> --format json --jq .id`",
    ],
    [
      "Status field id",
      backtick(orPlaceholder(config.statusFieldId, PLACEHOLDER.statusFieldId)),
      'see "Field ids" below',
    ],
    [
      "**Stack**",
      backtick(orPlaceholder(config.stack, PLACEHOLDER.stack)),
      "the repo's framework",
    ],
    [
      "**Crucible variant**",
      backtick(
        orPlaceholder(config.crucibleVariant, PLACEHOLDER.crucibleVariant)
      ),
      "the review skill installed in this repo",
    ],
    [
      "**Test command**",
      codeValue(config.testCommand, PLACEHOLDER.testCommand),
      "what `/vl-finish-feature` runs in step 1",
    ],
    [
      "**Manual smoke**",
      orPlaceholder(config.manualSmoke, PLACEHOLDER.manualSmoke),
      "how to launch the app for a hands-on pre-merge test (`/vl-merge-pr`); for hardware/live-only checks write `live-only` — those go through Verifying instead",
    ],
    [
      "Default branch",
      backtick(orPlaceholder(config.defaultBranch, PLACEHOLDER.defaultBranch)),
      "`git remote show origin`",
    ],
  ];

  const repoTable = [
    "| Key | Value | How to get it |",
    "|-----|-------|---------------|",
    ...repoRows.map(([k, v, how]) => `| ${k} | ${v} | ${how} |`),
  ].join("\n");

  const statusBlock = [
    "```text",
    `Todo:         ${orPlaceholder(so.todo, PLACEHOLDER.statusTodo)}`,
    `In Progress:  ${orPlaceholder(so.inProgress, PLACEHOLDER.statusInProgress)}`,
    `Blocked:      ${orPlaceholder(so.blocked, PLACEHOLDER.statusBlocked)}`,
    `Verifying:    ${orPlaceholder(so.verifying, PLACEHOLDER.statusVerifying)}`,
    `Done:         ${orPlaceholder(so.done, PLACEHOLDER.statusDone)}`,
    "```",
  ].join("\n");

  const nativeBlock = [
    "```text",
    orPlaceholder(config.typeFieldLine, PLACEHOLDER.typeFieldLine),
    orPlaceholder(config.priorityFieldLine, PLACEHOLDER.priorityFieldLine),
    "```",
  ].join("\n");

  return [
    "## Repo config — fill this in per repo",
    "",
    repoTable,
    "",
    "Status option ids (fill after first setup):",
    "",
    statusBlock,
    "",
    "Native single-select fields on this board (beyond Status; labels remain what the",
    "skills read):",
    "",
    nativeBlock,
    "",
    FIELD_LIST_RECIPE,
    "",
    "### Area labels — define per repo",
    "",
    "Areas name *this* product's vertical slices. This repo's areas:",
    "",
    areaLabels,
  ].join("\n");
}

/**
 * Emit the slim product-repo GITHUB-PROJECTS.md: canon pointer + per-repo config
 * sections only. Process prose lives once, in Vilya's canonical file. Missing
 * fields become product-safe placeholders.
 */
export function generateSlim(config: GithubProjectsConfig): string {
  const parts = [
    POINTER_HEADER,
    "",
    buildConfigSections(config),
    "",
    NIGHT_SHIFT_NOTE,
  ];
  return `${parts.join("\n").trimEnd()}\n`;
}
