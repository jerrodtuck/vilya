// Feature slice: setup — pure generate: fill Vilya template with extracted config.

import type { GithubProjectsConfig } from "./github-projects-config";

const VILYA_META_HEADING =
  /^##\s+Implementation checklist\s*→\s*board issues\s*\(Vilya meta\)\s*$/im;

const PROCESS_HEADING = /^## Model \(same everywhere\)\s*$/m;

const PLACEHOLDER = {
  owner: "<owner>",
  repo: "<owner>/<repo>",
  projectNumber: "<n>",
  projectId: "PVT_...",
  statusFieldId: "PVTSSF_...",
  stack: "<stack>",
  crucibleVariant: "crucible-<stack>",
  testCommand: "<test command>",
  manualSmoke: "<manual smoke or live-only>",
  defaultBranch: "main",
  planningModel: "(operator choice)",
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

/** Drop the Vilya-only meta checklist section (product-safe template body). */
export function stripVilyaMetaSection(templateMarkdown: string): string {
  const match = templateMarkdown.match(VILYA_META_HEADING);
  if (!match || match.index === undefined) {
    return templateMarkdown.replace(/\s+$/, "\n");
  }
  return templateMarkdown.slice(0, match.index).replace(/\s+$/, "\n");
}

function templateIntro(cleaned: string): string {
  const repoIdx = cleaned.search(/^## Repo config\b/m);
  if (repoIdx === -1) {
    return cleaned.trimEnd();
  }
  return cleaned.slice(0, repoIdx).trimEnd();
}

function templateProcessBody(cleaned: string): string {
  const idx = cleaned.search(PROCESS_HEADING);
  if (idx === -1) return "";
  return cleaned.slice(idx).trimEnd();
}

function isModelPlaceholder(value: string): boolean {
  const t = value.trim().toLowerCase();
  return t === "" || t === "(operator choice)" || t === "operator choice";
}

function modelCell(value: string): string {
  if (isModelPlaceholder(value)) return `*${PLACEHOLDER.planningModel}*`;
  return backtick(value.trim());
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
      "what `/finish-feature` runs in step 1",
    ],
    [
      "**Manual smoke**",
      orPlaceholder(config.manualSmoke, PLACEHOLDER.manualSmoke),
      "how to launch the app for a hands-on pre-merge test (`/merge-pr`); for hardware/live-only checks write `live-only` — those go through Verifying instead",
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

  const modelsTable = [
    "| Key | Value | Notes |",
    "|-----|-------|-------|",
    `| **Planning model** | ${modelCell(config.planningModel)} | Used in \`/start-feature\` plan phase when planning actually runs (Cursor Plan mode is operator-gated — see skill; Claude planning model) |`,
    `| **Execution model** | ${modelCell(config.executionModel)} | Used after the plan is settled; night-shift / Actions use this class of model for the whole unattended run |`,
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
    "### Models (optional — change over time)",
    "",
    "Human-readable names only; skills do not pin models in frontmatter for both phases. Update these",
    "when your preferred planning or execution model changes — no skill body edits required.",
    "",
    modelsTable,
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
 * Fill the latest Vilya template with extracted config. Strips the Vilya-meta
 * checklist. Keeps the template intro + shared process body; rebuilds only the
 * per-repo config sections. Missing fields become product-safe placeholders.
 */
export function generateFromTemplate(
  config: GithubProjectsConfig,
  templateMarkdown: string
): string {
  const cleaned = stripVilyaMetaSection(templateMarkdown);
  const intro = templateIntro(cleaned);
  const processBody = templateProcessBody(cleaned);
  const parts = [intro, "", buildConfigSections(config)];
  if (processBody) parts.push("", processBody);
  return `${parts.join("\n").trimEnd()}\n`;
}
