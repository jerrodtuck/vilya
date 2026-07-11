// Shared kernel: read SKILL.md files from disk and parse frontmatter.
// The repo is the store — this is the only place that touches the filesystem.
import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter";
import type { Skill } from "./types";

// Single source of truth. In the monorepo this points at the canonical
// `skills/` folder (via SKILLS_DIR); falls back to a bundled copy otherwise.
const SKILLS_DIR = process.env.SKILLS_DIR
  ? path.resolve(process.cwd(), process.env.SKILLS_DIR)
  : path.join(process.cwd(), "content", "skills");

export function getSkillSlugs(): string[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        fs.existsSync(path.join(SKILLS_DIR, d.name, "SKILL.md"))
    )
    .map((d) => d.name)
    .sort();
}

export function loadSkill(slug: string): Skill | null {
  const filePath = path.join(SKILLS_DIR, slug, "SKILL.md");
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    frontmatter: data,
    body,
    filePath: path.relative(process.cwd(), filePath),
  };
}

export function loadAllSkills(): Skill[] {
  return getSkillSlugs()
    .map(loadSkill)
    .filter((s): s is Skill => s !== null);
}
