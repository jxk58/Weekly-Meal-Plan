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
- **Status:** Superseded by D-004
- **PRD reference:** §7 (Technical Architecture, Initial application structure)

**Context:** The PRD's §7 puts everything under one `app/` folder, with templates and static files inside it. We wanted the frontend and backend code visibly separated. We also considered a separate SPA frontend calling a JSON API.

**Decision:** Keep the PRD's server-rendered architecture: FastAPI renders Jinja2 templates, and HTMX handles partial-page updates such as checking off a grocery item. Python code lives in `backend/` (the package is still `app`, as in `backend/app/...`). Templates and CSS/JS live in `frontend/`. It stays one app and one deploy. A separate SPA was rejected for now because a single-user CRUD app doesn't need its extra toolchain, its second deployment, or the API contract it would have to keep in sync.

**Consequences:** The structure in §7 maps onto `backend/app/` (code) and `frontend/` (`templates/`, `static/`). HTMX is loaded from a CDN pinned to an exact version. If a SPA or native client is ever needed, add JSON routes on top of the existing services.

### D-002: Python tooling: uv, ruff, mypy, pytest

- **Date:** 2026-11-16
- **Status:** Superseded by D-005
- **PRD reference:** New (the PRD doesn't specify tooling)

**Context:** The PRD names the runtime stack but not the development tooling.

**Decision:** Use `uv` for dependencies and virtual environments (`pyproject.toml` + `uv.lock`), `ruff` for linting and formatting, `mypy --strict` on `backend/app`, and `pytest` with FastAPI's `TestClient`. Target Python 3.12.

**Consequences:** All commands run through `uv run` (see CLAUDE.md). `uv.lock` is committed.

### D-003: Continuous integration with GitHub Actions

- **Date:** 2026-11-16
- **Status:** Superseded by D-005
- **PRD reference:** New (the PRD doesn't cover CI)

**Context:** The checks in CLAUDE.md (ruff, mypy, pytest) only ran when someone remembered to run them locally. `main` must stay deployable, so PRs need an automatic gate.

**Decision:** Add one GitHub Actions workflow, `.github/workflows/ci.yml`, triggered on every pull request and on pushes to `main`. A single job installs dependencies with `astral-sh/setup-uv` (cache enabled, Python from `.python-version`) and `uv sync --locked`, then runs `ruff check`, `ruff format --check`, `mypy backend/app index.py` and `pytest`. Newer pushes to the same branch cancel older runs. The workflow token gets only `contents: read`. Third-party actions are pinned to commit SHAs with the version tag in a comment.

**Consequences:** CI must be green before a PR is merged. `uv sync --locked` fails if `uv.lock` is out of date with `pyproject.toml`, so lockfile changes must be committed. When DB-backed tests arrive, add a Postgres service container to the same job (a placeholder comment marks the spot) rather than a separate workflow. Pinned action SHAs need occasional manual bumps.

> D-001 to D-003 were made on the Python scaffold (PRs #1 and #2). Those PRs were closed without merging when the stack changed to D-004. The entries are kept here for history.

### D-004: Full-stack TypeScript with Next.js instead of Python/FastAPI

- **Date:** 2026-11-17
- **Status:** Accepted
- **PRD reference:** §7 (Technical Architecture), header "Primary Stack"

**Context:** The PRD specifies Python, FastAPI, Jinja2, SQLAlchemy and Alembic. We want to work in TypeScript and React. Almost no app code existed yet, so switching was cheap. The Python app also needed custom entrypoint work to deploy on Vercel. Two options were considered: a React SPA in front of a FastAPI JSON API, or full-stack Next.js.

**Decision:** Build the whole app in Next.js (App Router, React, TypeScript). Server Components render pages, Server Actions handle form mutations, and the database stays Supabase Postgres, accessed through Drizzle ORM with Zod validation. A React SPA plus FastAPI was rejected: for a single-user CRUD app it means two languages, two deploys, and an API contract to keep in sync.

**Consequences:** This replaces D-001. PRD §7's stack and folder structure no longer apply; see CLAUDE.md for the new layout. The split between UI and server code is kept inside one app (`src/app` and `src/components` vs. `src/server`). Vercel deploys Next.js without configuration. The PRD's functional requirements are unchanged. If a native or other client is ever needed, add Route Handlers on top of the services.

### D-005: TypeScript tooling: Node 22+, npm, ESLint, Prettier, Vitest

- **Date:** 2026-11-17
- **Status:** Accepted
- **PRD reference:** New

**Context:** D-004 replaces the Python tooling in D-002, and CI (D-003) needs to be rebuilt around the new toolchain.

**Decision:** Use Node 22 or later (enforced by `engines` in `package.json`; local development is on the current LTS) with npm and a committed `package-lock.json`. Lint with ESLint (`eslint-config-next`) and format with Prettier, with `eslint-config-prettier` so they don't conflict. Run unit tests with Vitest in jsdom with Testing Library. Use drizzle-kit for migrations. Wrap everything in one script, `npm run check`, which runs lint, format check, typecheck and tests.

**Consequences:** This replaces D-002 and D-003. CI gets re-added in its own change, running `npm ci`, `npm run check` and `npm run build`. Playwright end-to-end tests come when the first CRUD flow lands, because Vitest can't render async Server Components. drizzle-kit pulls in a deprecated esbuild loader with a moderate dev-server advisory. It only affects the CLI on a developer machine and nothing deployed, so we accept it until drizzle-kit drops the loader.

### D-006: Calendar dates as `YYYY-MM-DD` strings, "today" from a configured time zone

- **Date:** 2026-11-17
- **Status:** Accepted
- **PRD reference:** §4.1, §4.2, §5 ("Store dates in appropriate database date fields")

**Context:** Meal dates and expiration dates are calendar days, not moments in time. JavaScript `Date` objects carry a time zone, so a date can shift by a day between the server (UTC on Vercel) and the browser. "Today" also depends on where the household is, not on where the server runs.

**Decision:** Store dates in Postgres `date` columns, using Drizzle's string mode. Pass them through the app as `YYYY-MM-DD` strings, and do all date math with the helpers in `src/lib/dates.ts`. Weeks run Monday to Sunday. "Today" is computed per request in the `APP_TIME_ZONE` env var (an IANA zone, default `UTC`).

**Consequences:** Set `APP_TIME_ZONE` in Vercel to the household's zone. Pages that depend on "today" render per request, inside `<Suspense>` with `connection()`. Timestamps for auditing, if ever needed, use `timestamptz` and are separate from these calendar dates.
