### Changed

- **crucible-nextjs aligned with Bulletproof React** — blocker 1 now enforces
  unidirectional `shared → features → app` import flow with a thin `app/`
  (routing concerns only) plus a shadcn-style `components/ui` design-system
  carve-out; blocker 2 resolves cross-feature needs by composing at the
  app/route level and prefers direct file imports policed by lint boundaries
  over barrel `index.ts` files; new finding category 7 makes unenforced
  boundary rules (`import/no-restricted-paths`, Nx `enforce-module-boundaries`)
  their own 🟠 finding. React/RSC 🟡 guidance gains state-bucket taxonomy
  (incl. URL state), one-configured-API-client-per-repo with per-feature
  `api/` modules, missing error/loading boundaries, and test colocation.
  Good phrases updated; all barrel-file/"public entry" advice removed.
  Method/severity sections and `crucible-blazor` untouched. (#158)
- **Site tagline pairs each stack with its review dialect** — both page
  eyebrows now render `SOLID · Next.js — Bulletproof React review ·
  .NET/Blazor — VSA review · Claude Code + Cursor` from one shared constant
  (`shared/ui/site-tagline.ts`) instead of two hand-copied strings; the
  layout metadata description matches. (#158)
- **"One method, per-stack dialects" callout on Overview** — explains why
  SOLID stands unqualified while each stack carries a review dialect; sits
  beside the "One body, two tools" callout. (#158)
