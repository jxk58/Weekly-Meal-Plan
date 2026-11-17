# Decisions Log

This file records decisions that clarify, change or go beyond [meal_planner_prd.md](meal_planner_prd.md). The PRD stays as the original baseline. When the two conflict, the latest accepted decision here wins.

## Rules

- **Append-only.** Add new entries at the bottom with the next ID (`D-001`, `D-002`, ...).
- **Never rewrite history.** To reverse or revise a decision, add a new entry. Then change the old entry's status to `Superseded by D-NNN`, and change nothing else in it.
- **One decision per entry.** Keep each entry short and specific enough to implement and test.
- **Land it with the code.** Commit the entry in the same change that implements it.

## Template

```markdown
### D-NNN: <short title>

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by D-NNN
- **PRD reference:** §<section> (or "New")

**Context:** What question or gap prompted this.

**Decision:** What we decided.

**Consequences:** What this affects (models, migrations, UI, tests) and any trade-offs.
```

---

## Decisions

### D-001: Server-rendered Jinja + HTMX, split into backend/ and frontend/ folders

- **Date:** 2026-11-16
- **Status:** Accepted
- **PRD reference:** §7 (Technical Architecture, Initial application structure)

**Context:** The PRD's §7 puts everything under one `app/` folder, with templates and static files inside it. We wanted the frontend and backend code visibly separated. We also considered a separate SPA frontend calling a JSON API.

**Decision:** Keep the PRD's server-rendered architecture: FastAPI renders Jinja2 templates, and HTMX handles partial-page updates such as checking off a grocery item. Python code lives in `backend/` (the package is still `app`, as in `backend/app/...`). Templates and CSS/JS live in `frontend/`. It stays one app and one deploy. A separate SPA was rejected for now because a single-user CRUD app doesn't need its extra toolchain, its second deployment, or the API contract it would have to keep in sync.

**Consequences:** The structure in §7 maps onto `backend/app/` (code) and `frontend/` (`templates/`, `static/`). HTMX is loaded from a CDN pinned to an exact version. If a SPA or native client is ever needed, add JSON routes on top of the existing services.

### D-002: Python tooling: uv, ruff, mypy, pytest

- **Date:** 2026-11-16
- **Status:** Accepted
- **PRD reference:** New (the PRD doesn't specify tooling)

**Context:** The PRD names the runtime stack but not the development tooling.

**Decision:** Use `uv` for dependencies and virtual environments (`pyproject.toml` + `uv.lock`), `ruff` for linting and formatting, `mypy --strict` on `backend/app`, and `pytest` with FastAPI's `TestClient`. Target Python 3.12.

**Consequences:** All commands run through `uv run` (see CLAUDE.md). `uv.lock` is committed.

### D-003: Continuous integration with GitHub Actions

- **Date:** 2026-11-16
- **Status:** Accepted
- **PRD reference:** New (the PRD doesn't cover CI)

**Context:** The checks in CLAUDE.md (ruff, mypy, pytest) only ran when someone remembered to run them locally. `main` must stay deployable, so PRs need an automatic gate.

**Decision:** Add one GitHub Actions workflow, `.github/workflows/ci.yml`, triggered on every pull request and on pushes to `main`. A single job installs dependencies with `astral-sh/setup-uv` (cache enabled, Python from `.python-version`) and `uv sync --locked`, then runs `ruff check`, `ruff format --check`, `mypy backend/app index.py` and `pytest`. Newer pushes to the same branch cancel older runs. The workflow token gets only `contents: read`. Third-party actions are pinned to commit SHAs with the version tag in a comment.

**Consequences:** CI must be green before a PR is merged. `uv sync --locked` fails if `uv.lock` is out of date with `pyproject.toml`, so lockfile changes must be committed. When DB-backed tests arrive, add a Postgres service container to the same job (a placeholder comment marks the spot) rather than a separate workflow. Pinned action SHAs need occasional manual bumps.
