/**
 * #287 — gated Cursor probe shape for `/vl-prune`.
 * Folder/branch matching only; closed-out / clean / not-cwd stay agent-side.
 */

export type ProbeCandidateInput = {
  /** Absolute or relative worktree path */
  path: string;
  /** Repo short name (leaf of nameWithOwner) */
  repo: string;
  /** Leaf folder; defaults to basename of path */
  folderName?: string;
  /** Git branch for the worktree (may be empty for orphans) */
  branch?: string;
};

function normalizeSlashes(p: string): string {
  return p.replace(/\\/g, "/");
}

/** True when path is under `.cursor/worktrees/<repo>/` (any OS separators). */
export function isUnderCursorRepoWorktrees(path: string, repo: string): boolean {
  const normalized = normalizeSlashes(path).toLowerCase();
  const marker = `/.cursor/worktrees/${repo.toLowerCase()}/`;
  const idx = normalized.indexOf(marker);
  if (idx === -1) return false;
  // Must have a leaf after the repo segment (folder or file).
  const after = normalized.slice(idx + marker.length);
  return after.length > 0;
}

/**
 * Folder matches `*-probe-*` / `bon-probe-*` / `model-switch-probe-*`.
 * (`bon-probe-*` and `model-switch-probe-*` are explicit docs; both also match `*-probe-*`.)
 */
export function folderLooksLikeProbe(folderName: string): boolean {
  const name = folderName.trim();
  if (!name) return false;
  if (name.includes("-probe-")) return true;
  if (name.startsWith("bon-probe-")) return true;
  if (name.startsWith("model-switch-probe-")) return true;
  return false;
}

/** Branch matches `probe/*`. */
export function branchLooksLikeProbe(branch: string): boolean {
  const b = branch.trim().replace(/^refs\/heads\//, "");
  return b.startsWith("probe/");
}

function leafFolder(path: string): string {
  const normalized = normalizeSlashes(path).replace(/\/+$/, "");
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? "";
}

/**
 * Probe candidate for prune discovery — path under `.cursor/worktrees/<repo>/`
 * AND (probe-shaped folder OR `probe/*` branch). Does not imply closed-out/clean.
 */
export function isCursorProbeCandidate(input: ProbeCandidateInput): boolean {
  const { path, repo, branch = "" } = input;
  if (!isUnderCursorRepoWorktrees(path, repo)) return false;
  const folder = (input.folderName ?? leafFolder(path)).trim();
  return folderLooksLikeProbe(folder) || branchLooksLikeProbe(branch);
}
