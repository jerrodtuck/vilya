// Feature slice: skill-detail. Loads one skill plus its git version history.
import { loadSkill } from "@/shared/skills/load-skills";
import { getFileHistory } from "@/shared/git/history";
import type { Skill, SkillVersion } from "@/shared/skills/types";

export interface SkillDetail {
  skill: Skill;
  history: SkillVersion[];
}

export function getSkillDetail(slug: string): SkillDetail | null {
  const skill = loadSkill(slug);
  if (!skill) return null;
  return { skill, history: getFileHistory(skill.filePath) };
}
