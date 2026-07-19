// Feature slice: night-shift — pure generate: workflow YAML from form inputs.

export type NightShiftWorkflowInput = {
  /** `owner/repo` or short repo name (e.g. `anduin`). */
  repo: string;
  /** Absolute path to claude.exe on the self-hosted machine. */
  claudeExe: string;
  /** Windows actions-runner parent; default `C:\\actions-runners`. */
  runnersRoot?: string;
};

export type NormalizedRepo = {
  /** Display / comment form — `owner/repo` when given, else short name. */
  full: string;
  /** Folder segment — last path part. */
  short: string;
};

const DEFAULT_RUNNERS_ROOT = "C:\\actions-runners";
const DEFAULT_CLAUDE_EXE = "C:\\Users\\jerro\\.local\\bin\\claude.exe";

const PLACEHOLDERS = {
  repoFull: "__REPO_FULL__",
  repoShort: "__REPO_SHORT__",
  claudeExe: "__CLAUDE_EXE__",
  runnerDir: "__RUNNER_DIR__",
} as const;

/** Parse `anduin` or `jerrodtuck/anduin` into full + short names. */
export function normalizeRepo(raw: string): NormalizedRepo | null {
  const t = raw.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "");
  if (t === "") return null;
  const parts = t.split("/").filter(Boolean);
  if (parts.length === 1) {
    const short = parts[0]!;
    if (!/^[\w.-]+$/.test(short)) return null;
    return { full: short, short };
  }
  if (parts.length === 2) {
    const [owner, short] = parts;
    if (!owner || !short) return null;
    if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(short)) return null;
    return { full: `${owner}/${short}`, short };
  }
  return null;
}

export function usualClaudeExe(): string {
  return DEFAULT_CLAUDE_EXE;
}

export function runnerDirFor(
  short: string,
  runnersRoot: string = DEFAULT_RUNNERS_ROOT
): string {
  const root = runnersRoot.replace(/[/\\]+$/, "");
  return `${root}\\${short}`;
}

/**
 * Fill template markers. Template must contain __REPO_FULL__, __REPO_SHORT__,
 * __CLAUDE_EXE__, __RUNNER_DIR__ (see docs/project-tracking/templates/night-shift.yml).
 */
export function generateNightShiftWorkflow(
  template: string,
  input: NightShiftWorkflowInput
): string | null {
  const repo = normalizeRepo(input.repo);
  if (!repo) return null;

  const claudeExe =
    input.claudeExe.trim() === ""
      ? PLACEHOLDERS.claudeExe
      : input.claudeExe.trim();
  const dir = runnerDirFor(repo.short, input.runnersRoot ?? DEFAULT_RUNNERS_ROOT);

  return template
    .replaceAll(PLACEHOLDERS.repoFull, repo.full)
    .replaceAll(PLACEHOLDERS.repoShort, repo.short)
    .replaceAll(PLACEHOLDERS.claudeExe, claudeExe)
    .replaceAll(PLACEHOLDERS.runnerDir, dir);
}

/** True when every marker was replaced (or claude still intentionally FILL). */
export function workflowLooksFilled(yaml: string): boolean {
  return (
    !yaml.includes(PLACEHOLDERS.repoFull) &&
    !yaml.includes(PLACEHOLDERS.repoShort) &&
    !yaml.includes(PLACEHOLDERS.runnerDir)
  );
}
