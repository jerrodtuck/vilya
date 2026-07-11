// Shared kernel: skill domain types. No feature logic here.

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  "disable-model-invocation"?: boolean;
  /** Cursor/Cloudflare-style reference bundles (progressive disclosure). */
  references?: string[];
  /** Preserve any other frontmatter fields (Claude Code extensions, etc.). */
  [key: string]: unknown;
}

export interface Skill {
  slug: string;
  frontmatter: SkillFrontmatter;
  body: string;
  /** Repo-relative path, used as the git-history key. */
  filePath: string;
}

export interface SkillVersion {
  hash: string;
  shortHash: string;
  date: string;
  author: string;
  subject: string;
}

export type SkillCategory = "process" | "review" | "autonomous" | "recall";
