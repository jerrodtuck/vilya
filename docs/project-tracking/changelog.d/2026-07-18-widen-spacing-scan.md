# Post-build spacing scan widened to inline prose tags

The Turbopack/SWC whitespace-swallowing bug the post-build scan guards
against (#88/#96) is not limited to `</code>` — #135's smoke caught two
`<i>` tags on the Architect page rendering with their trailing space
silently dropped. `scan-code-spacing.mjs` now matches
`/<\/(?:code|i|b)>(?=[A-Za-z0-9(])/` instead of `</code>` alone (#141).

**The tag set is the surveyed one, not the full candidate list.** The
site's JSX prose uses `code`, `i`, and `b`; `em`/`strong` have zero
occurrences and are deliberately excluded because `marked` emits them for
`*…*`/`**…**` in skill markdown — where a jammed construct like `**PR**s`
is intentional and not subject to the compile-time bug — while `marked`
never emits `<i>`/`<b>`, keeping the widened set markdown-safe. Everything
else about the scan is unchanged: prerendered-HTML scan, fail the build,
name file + snippet, page-count floor.

**The widened scan immediately caught two live instances on main**:
`<b>diverge</b>` on /differences and `<b>user level</b>` on /setup both
rendered jammed (source had the space; the following text node's `&apos;`
triggered the swallow). Fixed with the established `{" "}` idiom.

Both seeded regressions demonstrated: removing a `{" "}` after an `<i>`
(Architect aside) and after a `</code>` (Differences note) each fail the
build naming the file; clean main passes at 0 findings across 19 pages.
