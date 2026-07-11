### Changed

- **Dependency currency + `npm audit` to zero** in `apps/skill-registry` —
  `marked` 12.0.2 → 18.0.6 (sync `marked.parse(body, { async: false })` render
  path unchanged), `vitest` 2.1.9 → 4.1.10 (config-less setup carried over; 17
  tests still green), `typescript` 5.6.3 → 5.9.3. A `postcss` override
  (`^8.5.17`) lifts Next 16.2.10's bundled `postcss` 8.4.31 past the CSS-stringify
  XSS advisory. `npm audit` now reports **0 vulnerabilities** (was 7: 1 critical,
  1 high, 5 moderate). `@types/node` / `@types/react` / `@types/react-dom` were
  already current. (#29)

### Notes

- **TypeScript held at 5.9.x** — `typescript@latest` is now the native-compiler
  7.0 line, which Next 16.2.10's build-time type integration does not yet
  recognize (`next build` fails to find a usable `typescript`). Pinned to the
  latest 5.x stable; revisit the 7.x jump when Next supports the native compiler.
