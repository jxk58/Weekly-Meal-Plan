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

### D-001: Full-stack TypeScript with Next.js instead of Python/FastAPI

- **Date:** 2026-11-17
- **Status:** Accepted
- **PRD reference:** §7 (Technical Architecture), header "Primary Stack"

**Context:** The PRD specifies Python, FastAPI, Jinja2, SQLAlchemy and Alembic. We want to work in TypeScript and React. Almost no app code existed yet, so switching was cheap. The Python app also needed custom entrypoint work to deploy on Vercel. Two options were considered: a React SPA in front of a FastAPI JSON API, or full-stack Next.js. A Python scaffold (FastAPI + Jinja/HTMX, with uv, ruff, mypy and pytest) was built first and closed without merging; see PRs #1 and #2.

**Decision:** Build the whole app in Next.js (App Router, React, TypeScript). Server Components render pages, Server Actions handle form mutations, and the database stays Supabase Postgres, accessed through Drizzle ORM with Zod validation. A React SPA plus FastAPI was rejected: for a single-user CRUD app it means two languages, two deploys, and an API contract to keep in sync.

**Consequences:** PRD §7's stack and folder structure no longer apply; see CLAUDE.md for the new layout. The split between UI and server code is kept inside one app (`src/app` and `src/components` vs. `src/server`). Vercel deploys Next.js without configuration. The PRD's functional requirements are unchanged. If a native or other client is ever needed, add Route Handlers on top of the services.

### D-002: TypeScript tooling: Node 22+, npm, ESLint, Prettier, Vitest

- **Date:** 2026-11-17
- **Status:** Accepted
- **PRD reference:** New

**Context:** The PRD doesn't specify development tooling, and D-001 moves the project to TypeScript.

**Decision:** Use Node 22 or later (enforced by `engines` in `package.json`; local development is on the current LTS) with npm and a committed `package-lock.json`. Lint with ESLint (`eslint-config-next`) and format with Prettier, with `eslint-config-prettier` so they don't conflict. Run unit tests with Vitest in jsdom with Testing Library. Use drizzle-kit for migrations. Wrap everything in one script, `npm run check`, which runs lint, format check, typecheck and tests.

**Consequences:** CI is added in its own change, running `npm ci`, `npm run check` and `npm run build`. Playwright end-to-end tests come when the first CRUD flow lands, because Vitest can't render async Server Components. drizzle-kit pulls in a deprecated esbuild loader with a moderate dev-server advisory. It only affects the CLI on a developer machine and nothing deployed, so we accept it until drizzle-kit drops the loader.

### D-003: Calendar dates as `YYYY-MM-DD` strings, "today" from a configured time zone

- **Date:** 2026-11-17
- **Status:** Accepted
- **PRD reference:** §4.1, §4.2, §5 ("Store dates in appropriate database date fields")

**Context:** Meal dates and expiration dates are calendar days, not moments in time. JavaScript `Date` objects carry a time zone, so a date can shift by a day between the server (UTC on Vercel) and the browser. "Today" also depends on where the household is, not on where the server runs.

**Decision:** Store dates in Postgres `date` columns, using Drizzle's string mode. Pass them through the app as `YYYY-MM-DD` strings, and do all date math with the helpers in `src/lib/dates.ts`. Weeks run Monday to Sunday. "Today" is computed per request in the `APP_TIME_ZONE` env var (an IANA zone, default `UTC`).

**Consequences:** Set `APP_TIME_ZONE` in Vercel to the household's zone. Pages that depend on "today" render per request, inside `<Suspense>` with `connection()`. Timestamps for auditing, if ever needed, use `timestamptz` and are separate from these calendar dates.
