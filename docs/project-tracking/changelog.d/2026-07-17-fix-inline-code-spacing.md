# Fix missing space after inline code spans

Seven spots across /setup, /flows, /differences, /skills, and
/skills/crucible-nextjs rendered an inline `code` span jammed against the
following word. Root cause was subtler than the classic JSX newline trap: the
source had a same-line space after the closing tag, but Turbopack/SWC strips
the leading space of a JSX text segment when that text node contains an HTML
entity. Fixed by making the space an explicit `{" "}` expression (the
codebase's existing trailing-`{" "}` idiom), plus one markdown reword in
crucible-nextjs SKILL.md (`` `key` ``s → `` `key` `` props). Acceptance scan
(`</code>` immediately followed by a word character) across all 16 pages:
7 hits before, 0 after.
