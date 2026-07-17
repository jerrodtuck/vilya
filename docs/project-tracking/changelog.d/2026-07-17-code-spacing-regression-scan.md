# Add post-build regression scan for jammed inline code spans

The #88 acceptance scan is now a permanent check: `npm run build` in
`apps/skill-registry` runs `scripts/scan-code-spacing.mjs` as a `postbuild`
step, scanning the prerendered `.next/server/app/**/*.html` for `</code>`
immediately followed by a word character (the Turbopack entity-space quirk that
caused #88). Any hit fails the build, naming the file and the jammed snippet;
the script also asserts at least 16 prerendered pages so a route silently
dropping out of prerendering fails instead of shrinking coverage. Scanning the
Turbopack build output (not a vitest render) is deliberate — the space-stripping
happens in Turbopack's JSXText transform, which test-runner transforms don't
reproduce.
