# Registry lint

From `apps/skill-registry`, use Node 22.13+ within Node 22 (CI), Node 24, or Node 26 with the committed npm lockfile. This is the lint toolchain prerequisite, not a change to the deployed application's runtime contract.

```sh
npm ci
npm run lint
npm run test:lint
```

`lint` runs `lint:types` (`eslint src`) and `lint:boundaries` (`depcruise --config .dependency-cruiser.cjs src`). CI runs these same commands. The tools are pinned: ESLint 10.13.0, typescript-eslint 8.72.0, dependency-cruiser 18.7.0, and eslint-comments 4.8.1. No broad style preset is enabled.

## Enforced checks

Typed ESLint uses TypeScript project service for handwritten production and test TypeScript. It rejects explicit `any`, unsafe assignment/argument/call/member-access/return, floating promises (including bare `void`), and misused promises. Await work or attach a rejection handler. Described scoped exceptions remain possible; a description proves comment form, not correctness.

`ts-ignore` and `ts-nocheck` are prohibited. `ts-expect-error` requires a description of at least ten characters. ESLint disables must name rules and explain the exception; unused disables fail. Keep an exception on the smallest justified source line. Do not disable a production feature.

Dependency-cruiser resolves both relative imports and `@/*` through `tsconfig.json` and includes type-only dependencies. It checks the complete relevant source graph, without changed-line, depth or focus filters:

- Features cannot reach app entrypoints, including through intermediates.
- Shared code cannot reach features or app entrypoints.
- Private cross-feature imports fail; same-feature imports and app composition pass.
- Production cannot reach recognized test files. Only imports whose source is a `.test.*`, `.spec.*` or `__tests__/` file receive consumer exemptions.
- Unresolved relative and `@/` local imports fail. External packages are terminal nodes; Next's virtual `server-only` and Geist font entrypoints need no architecture exception.
- Cross-feature dependency cycles fail. The rule does not ban internal same-feature cycles.

There are no approved production public-contract exceptions. A later justified contract needs a named owner, exact consumer and interface files, a reason recorded in review, and acyclic direction. `scripts/lint/boundary-config.cjs` expresses such an exact edge without permitting adjacent private files or removing edges from reachability checks. An owning public module may still use its own feature's internals. App-level composition remains the normal route.

Typed source lint ignores dependencies, `.next`, `out`, and `next-env.d.ts`; handwritten adapters stay covered. The boundary command scans `src`, so generated output directories are not roots. If source imports an output as an intermediate, its relevant dependency paths remain in the graph. Generated skill Markdown uses the existing generation/parity gates. Generated output exclusions do not remove handwritten production graph nodes.

## Advisory signals and contextual review

`max-lines` warns above 400 nonblank, noncomment lines. It never turns a successful lint run into failure. Do not add `--max-warnings 0`. The approximate Crucible size guidance and justified exceptions still apply.

Broad catches, silent defaults, casts/double assertions, direct IO, lifetime smells and component duplication need contextual review. This baseline adds no speculative analyzers for them. Useful abstraction, slice ownership, cohesion, genuinely shared code, policy extraction, state placement and refactor cost stay in Crucible. A concrete defect can independently block acceptance; a signal alone does not.

Next's server-only/client guards remain build checks, not proof against every secret leak. Lint does not prove dependency-injection completeness, deployed provider identity, runtime input validation or successful interaction. Generation reproducibility, immutable migration history and affected runtime workflows remain separate gates. Python/.NET guidance in the skills is not a claim those runtimes ran here.

## Measured legacy baseline (#381)

The accepted starting source at `7834d6881dc650f479c17e6f8ece0721833949f7` produced 85 errors across ten files: unsafe-assignment 25, unsafe-member-access 40, unsafe-return 7, unsafe-call 6, unsafe-argument 5, and floating-promises 2. There were no explicit-any, misused-promises, suppression-form or size findings. The graph covered 225 modules and 506 dependencies with no architecture violation.

The baseline consists of 36 described, rule-specific next-line directives at the measured sites. Evaluation JSON/type debt remains in `app/evaluation/[runId]/page.tsx` and these `features/evaluation` files: `continuation-view.test.tsx`, `diagnostic-observation-view.test.tsx`, `evaluation-view.tsx`, `evidence.test.ts`, `load-snapshot.ts`, `recovery-comparison.test.tsx`, and `recovery-view.test.tsx`. Existing clipboard promises remain in `features/night-shift/night-shift-workflow-tool.tsx` and `features/setup/github-projects-tool.tsx`.

These exact sites remain exceptions; lint success does not repair or certify them. The directives preserve behavior while leaving other lines and rules active. This is neither a count-only baseline nor a feature-wide opt-out. Remove each directive when its owning code resolves that debt; unused directives fail.

## Executable proof

`test:lint` creates disposable projects with their own TypeScript configuration and the production rule configuration. They exercise the installed executables, inspect reported rule names/edges, and require actual failure/success exits. Fixtures cover alias/relative/type-only private access; indirect feature/shared direction; missing local imports; composition and test consumers; an exact public contract versus adjacent private access and cycles; unsafe JSON/explicit-any; floating/bare-void versus handled promises; unexplained versus described suppressions; and an advisory warning with exit zero. Temporary projects are removed in `finally` and never join the application build.

Dependency-cruiser's JSON reporter intentionally exits zero, even with findings. The fixtures inspect JSON for graph evidence **and separately run the default error reporter** for enforcement exits. The production command uses that error reporter.

Primary references: [typed project service](https://typescript-eslint.io/blog/project-service/), [floating promises](https://typescript-eslint.io/rules/no-floating-promises/), [comment descriptions](https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/require-description.html), and [dependency-cruiser rules](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md).
