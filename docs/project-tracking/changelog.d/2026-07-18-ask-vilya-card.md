# Overview: "Ask Vilya" front-door prompt card

One prompt card on the Overview page (#143) answering "who handles this —
architect, orchestrator, or you?". All three operator forks shipped as
decided on the issue: **prompt card** (not a skill or role — the house
proving ground; it graduates to `/ask-vilya` only if usage proves the recipe
stable), named **Ask Vilya**, placed on **Overview** as a front-door panel
between the cardinality diagram and the role-split cards.

The copyable prompt carries the routing test (*does this change what we
intended, or only what we'll do next?*), the five lanes (intent → Architect
· new work → board → Orchestrator · in-flight → Orchestrator ·
operator-owned → you · process/canon → answer with citation), and the fixed
answer format — **lane · exact next prompt · one-line why with canon
citation**. Scope guards honored: no skill, no new role, no board writes —
the prompt itself instructs "route only; never create issues, never
dispatch."

Implementation reuses the existing prompt-card pattern end to end: card data
as a `PromptGroup` in new `features/overview/ask-vilya.ts`, rendered through
the shared `PromptList`/`CopyButton` in a `.panel` + `.libcard`
(`--consult` accent), same idiom as the architect/orchestrator libraries.
Only other touches are two stale "used by" comments in
`shared/ui/prompt-list.tsx` / `copy-button.tsx` updated to mention overview.
Verified: 53/53 tests, clean build, post-build spacing scan 0, Copy
round-trip on the dev server, and no body h-scroll at 375px.
