// Post-build regression scan for #96/#141: Turbopack/SWC drops the leading
// space of a JSXText segment that contains an HTML entity, so an inline element
// (`</code>`, `</i>`, `</b>`, …) can render jammed against the next word even
// when the source line has a space (#88, #135).
// The bug only exists in Turbopack-compiled output, so we scan the prerendered
// HTML in .next/server/app rather than re-rendering components in a test.
//
// Scanned tags are the inline elements the site's JSX prose actually uses
// (surveyed in #141). `em`/`strong` are deliberately excluded: JSX prose never
// uses them, and `marked` emits them for `*…*`/`**…**` in skill markdown, where
// a jammed construct like `**PR**s` is intentional and not subject to the bug.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlRoot = path.join(appRoot, ".next", "server", "app");

// /, /setup, /architect, /orchestrator, /differences, /night-shift, /skills,
// 10× /skills/<name>. Fewer scanned files than this means routes silently
// stopped prerendering — fail rather than shrink coverage.
const MIN_PAGES = 17;

const JAMMED = /<\/(?:code|i|b)>(?=[A-Za-z0-9(])/g;
const CONTEXT = 60;

if (!fs.existsSync(htmlRoot)) {
  console.error(
    `scan-code-spacing: missing ${path.relative(appRoot, htmlRoot)} — run after \`next build\``
  );
  process.exit(1);
}

const htmlFiles = fs
  .readdirSync(htmlRoot, { recursive: true })
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(htmlRoot, f));

const hits = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(JAMMED)) {
    const start = Math.max(0, match.index - CONTEXT);
    const snippet = html
      .slice(start, match.index + match[0].length + CONTEXT)
      .replace(/\s+/g, " ");
    hits.push({ file: path.relative(appRoot, file), snippet });
  }
}

if (hits.length > 0) {
  console.error(
    `scan-code-spacing: ${hits.length} inline element(s) jammed against the next word:`
  );
  for (const { file, snippet } of hits) {
    console.error(`  ${file}\n    …${snippet}…`);
  }
  console.error(
    'scan-code-spacing: fix with an explicit {" "} after the inline element (see #88/#96/#141).'
  );
  process.exit(1);
}

if (htmlFiles.length < MIN_PAGES) {
  console.error(
    `scan-code-spacing: only ${htmlFiles.length} prerendered page(s) found, expected at least ${MIN_PAGES} — did routes stop prerendering?`
  );
  process.exit(1);
}

console.log(
  `scan-code-spacing: ${htmlFiles.length} prerendered pages scanned, 0 jammed inline elements`
);
