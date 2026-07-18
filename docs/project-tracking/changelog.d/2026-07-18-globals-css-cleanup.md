# globals.css cleanup: malformed comment opener resolved as no-op; copybtn/toggle transitions dropped

Issue #165 batched two cosmetic findings from the #155 fix chip (PR #159).

**Item 1 (malformed `\*` comment opener ~L679) turned out not to exist.**
The night-shift section comment reads `/* ---------- site: night-shift
(agent pipeline) ---------- */` — well-formed — at PR #159's own commit
(391af96), at current main, and in every historical version of the file
(zero backslash bytes in all 19 revisions touching it; 30 openers / 30
closers, balanced). A postcss parse of baseline vs. working file confirms
335 rules / 23 at-rules with no selector lost. The #159 chip's report of a
`\*` opener in the served CSSOM appears to have been a misread of its own
observation; nothing to fix, evidence recorded on the PR.

**Item 2 (transition residue) was real and is fixed.** `.copybtn` and
`.toggle button` kept bare `transition: .15s` shorthands (property: all)
with class-driven states (`.done`, `.on`), so their *color* feedback pinned
in frame-throttled panes — the same mechanism as #155. Both shorthands
dropped, each with a constraint comment per PR #159's convention. Verified
on the dev server: Copy button swaps to "Copied" with the green `.done`
color landing in the same style recalc; setup toggle flips `.on`
immediately. Only visual change in normal contexts: hover/active feedback
on these two controls is now instant instead of 150 ms eased.
