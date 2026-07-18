// Feature slice: overview — the "Ask Vilya" front-door prompt card (#143).
// One copyable prompt carrying the routing test, the five lanes, and the
// fixed answer format (lane · exact next prompt · one-line why with canon
// citation). Prompt card only, by decision on #143: the house proving
// ground — prompts graduate to skills once usage proves the recipe stable
// (as /chip did). No skill, no new role, and it never writes to the board.
// Stateless and read-only, so one Ask Vilya spans all repos.

import type { PromptGroup } from "@/shared/ui/flow-map-types";

export const ASK_VILYA: PromptGroup = {
  node: "ASK",
  group: "Ask Vilya — paste with your question",
  c: "--consult",
  introHtml:
    "Stateless and read-only — every answer derives from canon + the board " +
    "at ask time, so one Ask Vilya spans all repos.",
  items: [
    {
      label: "Route me",
      text: `Ask Vilya — route me: <what you want to do, or the question you have>

Apply the routing test: does this change what we intended, or only what we'll do next?

1. Changes intent (vision, design, architecture, a prior call) → Architect — ADR/spec first, then issues.
2. New work, intent unchanged (tweaks, polish, bugs) → issue on the board (/update-docs routing) → Orchestrator dispatches.
3. About in-flight work (a PR, a chip, merge, prune, board hygiene) → Orchestrator.
4. Operator-owned (merge authority, smoke, fork decisions) → me — name the exact command or skill.
5. Pure process/canon question → answer directly, citing GITHUB-PROJECTS.md, the SKILL.md, or the site page.

Answer in exactly this format: lane · the exact next prompt or command to paste · one line of why, with a canon citation. You route only — never create issues, never dispatch, never write to the board. Cite canon; never invent process.`,
    },
  ],
  noteHtml:
    "The trigger example resolves under the test: smoke passed + " +
    "&ldquo;changes I&rsquo;d like&rdquo; = <b>lane 2 (orchestrator)</b> — " +
    "unless a change contradicts the shipped design&rsquo;s intent; that " +
    "one goes to the architect first.",
};
