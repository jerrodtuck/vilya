// Shared kernel: a lenient SKILL.md frontmatter parser.
// Real-world skill descriptions contain ": " (e.g. "(sibling: crucible-blazor)"),
// which strict YAML rejects but Claude Code / Cursor accept. We parse each
// top-level `key: value` as a string, support simple `- item` lists, and coerce
// true/false — enough for the SKILL.md frontmatter shape without a strict engine.
import type { SkillFrontmatter } from "./types";

export interface ParsedDoc {
  data: SkillFrontmatter;
  body: string;
}

function coerce(value: string): string | boolean {
  const unquoted = value.replace(/^["']|["']$/g, "");
  if (unquoted === "true") return true;
  if (unquoted === "false") return false;
  return unquoted;
}

export function parseFrontmatter(raw: string): ParsedDoc {
  const text = raw.replace(/^﻿/, "");
  if (!text.startsWith("---")) {
    return { data: {}, body: text.trim() };
  }

  const lines = text.split(/\r?\n/);
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { data: {}, body: text.trim() };

  const fmLines = lines.slice(1, end);
  const body = lines.slice(end + 1).join("\n").trim();
  const data: SkillFrontmatter = {};
  let currentListKey: string | null = null;

  for (const line of fmLines) {
    if (line.trim() === "") continue;

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      (data[currentListKey] as unknown[]).push(coerce(listItem[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (!kv) {
      currentListKey = null;
      continue;
    }
    const key = kv[1];
    const rest = kv[2].trim();
    if (rest === "") {
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = coerce(rest);
      currentListKey = null;
    }
  }

  return { data, body };
}
