// Feature slice: version-diff. Loads one skill and two of its committed
// versions, resolved against the file's real git history.
import { loadSkill } from "@/shared/skills/load-skills";
import { getFileAtCommit, getFileHistory } from "@/shared/git/history";
import type { Skill, SkillVersion } from "@/shared/skills/types";
import { computeLineDiff, diffStats, type DiffRow } from "./diff";

export interface VersionDiff {
  skill: Skill;
  from: SkillVersion;
  to: SkillVersion;
  rows: DiffRow[];
  stats: { added: number; removed: number };
  /** File absent at `from` (added later) — rendered as an all-new diff. */
  fromMissing: boolean;
  toMissing: boolean;
}

export function getVersionDiff(
  slug: string,
  fromRef: string,
  toRef: string
): VersionDiff | null {
  const skill = loadSkill(slug);
  if (!skill) return null;

  const history = getFileHistory(skill.filePath);
  const from = findVersion(history, fromRef);
  const to = findVersion(history, toRef);
  if (!from || !to) return null;

  const fromText = getFileAtCommit(skill.filePath, from.hash);
  const toText = getFileAtCommit(skill.filePath, to.hash);
  const rows = computeLineDiff(fromText ?? "", toText ?? "");

  return {
    skill,
    from,
    to,
    rows,
    stats: diffStats(rows),
    fromMissing: fromText === null,
    toMissing: toText === null,
  };
}

/** Resolve a URL ref (full or abbreviated hash) against the file's history only. */
function findVersion(
  history: SkillVersion[],
  ref: string
): SkillVersion | null {
  if (!/^[0-9a-f]{4,40}$/i.test(ref)) return null;
  const lower = ref.toLowerCase();
  return history.find((v) => v.hash.startsWith(lower)) ?? null;
}
