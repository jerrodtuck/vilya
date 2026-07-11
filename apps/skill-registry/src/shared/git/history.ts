// Shared kernel: git-native versioning. Versions ARE the git history of a file.
// Server-only (spawns git). Returns [] gracefully when not in a git repo yet.
import { execFileSync } from "node:child_process";
import type { SkillVersion } from "../skills/types";

// Unit-separator (ASCII 31) built at runtime — a safe delimiter that won't
// appear in commit metadata, and no literal control char in the source.
const SEP = String.fromCharCode(31);

export function getFileAtCommit(filePath: string, hash: string): string | null {
  try {
    // In `<rev>:<path>`, a path starting with ./ or ../ is cwd-relative;
    // anything else is repo-root-relative. Our filePath is cwd-relative.
    const rel = filePath.split(/[\\/]+/).join("/");
    const spec = rel.startsWith("./") || rel.startsWith("../") ? rel : `./${rel}`;
    return execFileSync("git", ["show", `${hash}:${spec}`], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    // Bad hash, file absent at that commit, or not a git repo.
    return null;
  }
}

export function getFileHistory(filePath: string): SkillVersion[] {
  try {
    const format = ["%H", "%h", "%aI", "%an", "%s"].join(SEP);
    const out = execFileSync(
      "git",
      ["log", `--format=${format}`, "--", filePath],
      { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, shortHash, date, author, subject] = line.split(SEP);
        return { hash, shortHash, date, author, subject };
      });
  } catch {
    // Not a git repo, git missing, or file untracked — no history yet.
    return [];
  }
}
