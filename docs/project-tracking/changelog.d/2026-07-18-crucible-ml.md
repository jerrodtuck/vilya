# crucible-ml: Python ML/data review dialect

New skill `skills/crucible-ml/SKILL.md` (#163, epic #160): the Python
ML/data instance of the crucible method, cloned from crucible-nextjs
post-#158 — the method/severity/SOLID sections are byte-identical to the
clone source; only the two stack-specific sections swap. The dialect is
honest that **no single named canon** exists at Bulletproof-React
mindshare: it composes **src-layout slice packages + import-linter
contracts** with Cookiecutter Data Science's `data/` + `notebooks/`
scaffold grafted on (Kedro rejected — ceremony, fights a service shape).

Presumptive 🔴 blockers: `src/<package>/` with one subpackage per slice
and one-way `shared → slices → entrypoints` flow; `shared/` for
contracts/envelope models only; the **notebook-promotion rule**
(notebooks are leaf consumers — package code never imports from a
notebook, and anything a notebook proves gets promoted into a slice
before any service path touches it); no training logic reachable from
the serving path; generated stubs read-only vendored in `shared/`;
pydantic at boundaries; unenforced import-linter contracts as their own
🟠 finding. 🟡 ML/data guidance: pydantic-settings config, declared
seeds/determinism where results are compared, explicit `device` handling
at the boundary, data provenance (raw immutable, processed reproducible
from code), experiment artifacts out of the package tree — escalating to
🔴 only when the serving/training or data-provenance boundary actually
breaks. Brownfield clause carries the **two-lives** framing: exploration
phase vs service phase — exploration-era code is a 🟡 migration
candidate, but new service-path work slices from day one. Registry
listing follows automatically (skills/ is the source of truth; served
copies regenerated via sync:skills).
