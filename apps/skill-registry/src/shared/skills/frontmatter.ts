// Shared kernel: a lenient SKILL.md frontmatter parser.
// Real-world skill descriptions contain ": " (e.g. "(sibling: vl-crucible-blazor)"),
// which strict YAML rejects but Claude Code / Cursor accept. We parse each
// top-level `key: value` as a string, support simple `- item` lists, folded
// (`>`/`>-`) and literal (`|`/`|-`) block scalars, and coerce true/false —
// enough for the SKILL.md frontmatter shape without a strict engine.
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

const BLOCK_SCALAR = /^[|>][+-]?$/;

/** Consume the indented lines after a `key: |`/`>` block scalar header. */
function readBlockScalar(
  lines: string[],
  start: number,
  folded: boolean
): { value: string; next: number } {
  const collected: string[] = [];
  let baseIndent: number | null = null;
  let i = start;

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      collected.push("");
      continue;
    }
    const indent = line.match(/^ */)?.[0].length ?? 0;
    if (baseIndent === null) baseIndent = indent;
    if (indent < baseIndent) break;
    collected.push(line.slice(baseIndent));
  }

  while (collected.length && collected[collected.length - 1] === "") {
    collected.pop();
  }

  // Chomp indicator (strip/clip/keep) only affects trailing-newline
  // preservation; every field here is consumed as a plain string, so we
  // always produce the chomped (no trailing newline) form.
  const value = folded ? collected.join(" ").trim() : collected.join("\n");
  return { value, next: i };
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
  let i = 0;

  while (i < fmLines.length) {
    const line = fmLines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      (data[currentListKey] as unknown[]).push(coerce(listItem[1].trim()));
      i++;
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (!kv) {
      currentListKey = null;
      i++;
      continue;
    }
    const key = kv[1];
    const rest = kv[2].trim();
    currentListKey = null;

    if (rest === "") {
      data[key] = [];
      currentListKey = key;
      i++;
      continue;
    }

    if (BLOCK_SCALAR.test(rest)) {
      const { value, next } = readBlockScalar(fmLines, i + 1, rest[0] === ">");
      data[key] = value;
      i = next;
      continue;
    }

    data[key] = coerce(rest);
    i++;
  }

  return { data, body };
}
