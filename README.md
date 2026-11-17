# Weekly Meal Plan

A personal household app for weekly meal planning, food inventory (with expiration tracking) and store-grouped grocery lists. It's built with FastAPI, Jinja2 + HTMX, SQLAlchemy and PostgreSQL (Supabase).

- Requirements: [meal_planner_prd.md](meal_planner_prd.md)
- Decisions since the PRD: [DECISIONS.md](DECISIONS.md)
- Conventions: [CLAUDE.md](CLAUDE.md)

## Quickstart

Requires [uv](https://docs.astral.sh/uv/). It installs Python 3.12 automatically if needed.

```bash
cp .env.example .env          # then fill in DATABASE_URL
uv sync
uv run uvicorn app.main:app --reload --app-dir backend
```

Open http://127.0.0.1:8000.

## Checks

```bash
uv run pytest
uv run ruff check . && uv run ruff format --check .
uv run mypy backend/app
```
