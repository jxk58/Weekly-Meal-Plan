# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

Weekly Meal Planner and Tracker: a personal-use household web app for weekly meal planning, food inventory (with storage location and expiration tracking), and store-grouped grocery lists.

- **Requirements baseline:** [meal_planner_prd.md](meal_planner_prd.md). Read the relevant section before building a feature. Don't edit the PRD to record new decisions.
- **Decisions log:** [DECISIONS.md](DECISIONS.md) records every decision that clarifies, changes or goes beyond the PRD (for example, how duplicate inventory names are handled). Add an entry in the same change that implements the decision. Entries are append-only: to reverse a decision, add a new entry that supersedes the old one and mark the old one `Superseded by D-NNN`. Don't rewrite or delete history.
- **Precedence:** where the two conflict, the latest accepted entry in DECISIONS.md wins over the PRD. Check the log before relying on a PRD detail.
- **Status:** Phase 1 scaffolding. The app skeleton, page routes, base templates, Alembic and tests are in place. No models or CRUD yet. Update this file when the structure or commands change.

## Stack

| Layer | Choice |
|---|---|
| Language | Python 3.12+ |
| Web framework | FastAPI |
| Templates / UI | Jinja2, HTML, CSS, HTMX for partial-page updates, minimal vanilla JS (server-rendered, form-based) |
| ORM | SQLAlchemy 2.x (typed `Mapped[...]` / `mapped_column` style) |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Config | `pydantic-settings`, reading environment variables / `.env` |
| Database | PostgreSQL on Supabase (use the connection pooler URL for serverless) |
| Hosting | Vercel (Python serverless) |
| Tooling | `uv` (deps and venv), `ruff` (lint + format), `mypy`, `pytest` |

Don't add new frameworks (a SPA, a CSS framework, another ORM, a task queue) without discussing it first. The PRD calls for a simple server-rendered app.

## Layout

The code is split into `backend/` (Python) and `frontend/` (templates and assets), but it's still **one FastAPI app with one deploy**. The backend renders the frontend's templates. See D-001.

```
pyproject.toml       # deps + ruff/mypy/pytest config + [tool.vercel] entrypoint
index.py             # Vercel entrypoint: adds backend/ to sys.path, re-exports app
vercel.json          # excludes tests/migrations/docs from the function bundle
alembic.ini          # points at backend/alembic
backend/
  app/
    main.py          # app factory, router registration, static mount
    config.py        # Settings + paths; the only place env vars are read
    db.py            # engine, sessionmaker, get_db dependency
    templating.py    # shared Jinja2Templates pointed at frontend/templates
    models/          # SQLAlchemy models, one module per entity; enums.py
    schemas/         # Pydantic input schemas
    services/        # business logic; plain functions that take a Session
    routers/         # thin routes: dashboard, meals, inventory, grocery, health
  alembic/           # migrations (env.py imports app.models metadata)
  tests/             # mirrors app/: tests/services, tests/routers
frontend/
  templates/         # base.html (shared nav), one folder per section
    partials/        # fragments returned to HTMX requests
  static/            # css/, js/
```

- The importable package is `app` (`backend/` is on the path via pytest/mypy/alembic config and `--app-dir`). Import as `from app.services import ...`, never `backend.app`.
- Backend code finds frontend files only through the path constants in `app/config.py`.
- HTMX endpoints return a template from `frontend/templates/partials/`. Full pages `{% include %}` the same partial, so markup isn't duplicated.

### Layering rules

- **Routers stay thin.** Parse the request, call a service, and return a template response or redirect. No queries or business rules in route functions.
- **Services own the logic.** Expiration windows, store grouping, week calculations and validation beyond field shape all live in services. Services take a `Session` argument and don't import FastAPI.
- **Models are only persistence.** No HTTP or template concerns.
- **Schemas validate input.** Every form post goes through a Pydantic schema before it reaches a service.
- Templates contain presentation logic only. Compute values such as "expiring soon" in services, not in Jinja.

## Domain rules (from the PRD and DECISIONS.md)

- Meal types: `breakfast`, `lunch`, `dinner`. Storage locations: `fridge`, `freezer`, `pantry`, `counter`. Use Python `Enum`s, and enforce them in the database (enum or check constraint), not only in forms.
- Store dates as `DATE` columns, never as strings. A week runs Monday to Sunday unless the PRD says otherwise. Keep that rule in one helper.
- Quantities are non-negative decimals (`Numeric`, not float). Units are free text for now.
- An inventory item's expiration date is optional. Items without one are valid and sort last.
- Stores are rows in the `Store` table (seeded with Costco and Trader Joe's), not hard-coded strings.
- Use UUID primary keys.
- Invalid input gets a clear error re-rendered on the form (HTTP 422/400). Never save bad data silently.

## Commands

```bash
uv sync                                   # install deps (uv fetches Python 3.12 if needed)
uv run uvicorn app.main:app --reload --app-dir backend   # http://127.0.0.1:8000
uv run pytest                             # tests
uv run ruff check . && uv run ruff format --check .
uv run mypy backend/app
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

Before you call a change done, run ruff, mypy and pytest and confirm they pass.

## Database and migrations

- Every schema change goes through an Alembic migration. Never use `Base.metadata.create_all` outside tests, and never edit the Supabase schema by hand.
- Review autogenerated migrations before committing, because Alembic misses enum changes and renames. Each migration should do one logical change, with a working `downgrade()`.
- Never edit a migration that has already been applied to the hosted database. Add a new one instead.
- Vercel doesn't run migrations. Run `uv run alembic upgrade head` against Supabase (using `MIGRATION_DATABASE_URL`) before deploying code that depends on a schema change.

## Deployment (Vercel)

- The whole app runs as one Python function, loaded from `index.py`. Python 3.12 comes from `.python-version`, and dependencies are installed from `pyproject.toml` / `uv.lock`.
- Set `DATABASE_URL` (the Supabase pooled URL) and `ENVIRONMENT=production` in the Vercel project's environment variables. Never put them in `vercel.json`.
- The filesystem is read-only at runtime. Don't write files. Put anything that must persist in Postgres.
- Keep the deployment private (Vercel Deployment Protection, or app-level auth) until access control is decided.
- Use the pooled Supabase URL (transaction mode, port 6543) in the deployed app, and keep engine pool sizes small (`NullPool` is fine on Vercel). Migrations may use the direct connection URL.

## Configuration and secrets

- All config comes from `app/config.py` `Settings`. Don't call `os.environ` anywhere else.
- `.env` is gitignored. Keep `.env.example` up to date with every variable name and placeholder values.
- Never commit credentials, connection strings or Supabase keys, and never print them in logs or error pages.
- The app holds private household data. Don't expose it publicly; put some form of access protection in place before the first public deploy (PRD §6, Privacy).

## Testing

- Use `pytest` against a real PostgreSQL test database (local Docker or a separate Supabase project). Don't use SQLite: its enum, date and numeric behavior differs.
- Wrap each test in a transaction that is rolled back.
- Test services directly for business rules. Test routers with FastAPI's `TestClient` for form handling, validation errors and redirects.
- Each PRD acceptance criterion you implement should have at least one test that covers it.
- Bug fixes start with a failing test.

## Code style

- Type-hint everything. Code should pass `mypy` in strict-ish mode (`disallow_untyped_defs`).
- `ruff` handles formatting and import sorting. Don't hand-format.
- Prefer small, explicit functions over clever abstractions. This is a small personal app, so don't build for multi-tenancy or scale it doesn't need yet, but keep the layering clean so P1/P2 features (recipes, suggestions) slot in.
- Name things after the PRD's entities: `MealPlanEntry`, `InventoryItem`, `GroceryItem`, `Store`.
- UI must work at phone width. Check mobile layout for any template change.

## Git workflow

- `main` is always deployable. Work on short-lived feature branches (`feat/inventory-crud`, `fix/expiry-sort`) and merge through a PR.
- Commits are small and focused, with an imperative subject line (`Add grocery store grouping`).
- A model change and its migration go in the same commit.
- A change that implements a new decision includes its DECISIONS.md entry.
- Don't commit `.env`, `.venv/`, `__pycache__/` or editor files. Keep `.gitignore` current.
