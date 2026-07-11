// Feature slice: registry. Composes the shared loader into grouped data.
import { loadAllSkills } from "@/shared/skills/load-skills";
import { categorize } from "@/shared/skills/meta";
import type { Skill, SkillCategory } from "@/shared/skills/types";

export function getGroupedSkills(): Record<SkillCategory, Skill[]> {
  const groups: Record<SkillCategory, Skill[]> = {
    process: [],
    review: [],
    autonomous: [],
    recall: [],
  };
  for (const skill of loadAllSkills()) {
    groups[categorize(skill.slug)].push(skill);
  }
  return groups;
}
