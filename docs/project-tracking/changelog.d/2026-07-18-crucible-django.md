### Added

- **crucible-django — Django review dialect (HackSoft Styleguide canon)** — new
  skill `skills/crucible-django/SKILL.md`, cloned from crucible-nextjs post-#158
  with only the two stack-specific sections swapped. "VSA for Django" blockers:
  apps are the slices (one app per domain, no god-app); services (writes) /
  selectors (reads) as the named business-logic layers with views / forms /
  serializers / model-`save` / signals as the dumping-ground analog; one-way
  import flow policed by import-linter contracts (the epic's shared Python
  core); ORM queries outside selectors/services. "Django layer" 🟡 guidance:
  N+1 handled at the selector (`select_related`/`prefetch_related`), boundary
  validation via nested Input/OutputSerializer with transport-ignorant
  services, migrations discipline (no editing applied migrations; data separate
  from schema), signals as last resort, env-layered settings, mypy/pyright +
  ruff floor, one configured client per external service — escalating to 🔴
  only on secrets in templates / client-bound context. Brownfield clause covers
  legacy fat views as 🟡 migration candidates. Authored against the live
  HackSoft Django Styleguide (verified 2026-07-18). (#162)
