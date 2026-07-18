# crucible-fastapi: FastAPI review dialect

New skill `skills/crucible-fastapi/SKILL.md` (#161, epic #160) — the FastAPI /
Python instance of the crucible method, cloned from `crucible-nextjs`
post-#158. Method / SOLID / severity / brownfield sections are byte-identical
to the clone source (verified by section diff); only the two stack-specific
sections swap, authored against the live
[fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices)
canon (Netflix Dispatch lineage).

**VSA for FastAPI (presumptive 🔴):** one package per bounded context
(`src/<domain>/` with `router.py` · `schemas.py` · `service.py` · `models.py`
· `dependencies.py`), no app-wide `routers/`/`services/` layer-cake; one-way
import flow policed by import-linter contracts (the
`import/no-restricted-paths` analog), cross-domain needs composed at the
app/entrypoint level; pydantic models at boundaries; per-domain `BaseSettings`
with no scattered `os.environ` reads; secrets/engines/clients never
constructed at import time in router-reachable modules.

**FastAPI layer (🟡):** blocking IO inside `async def` routes (the waterfall
analog), `Depends` over module globals, one configured client per external
service with per-domain typed request modules, declared response models,
exception handlers over per-route try/except, `BackgroundTasks` limits,
mypy/pyright + ruff floor with `Any` casts as the `as any` analog, colocated
async-client tests — escalating to 🔴 only on a config/security or type
boundary break, mirroring the RSC section's rule.

Good phrases carry the #158 lint-boundary pattern with import-linter
contracts. Registry listing follows automatically (skills/ is the source of
truth; served copies regenerated via sync:skills).
