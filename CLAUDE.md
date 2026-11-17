# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

@AGENTS.md

## Project

Weekly Meal Planner and Tracker: a personal-use household web app for weekly meal planning, food inventory (with storage location and expiration tracking), and store-grouped grocery lists.

- **Requirements baseline:** [meal_planner_prd.md](meal_planner_prd.md). Read the relevant section before building a feature. Don't edit the PRD to record new decisions.
- **Decisions log:** [DECISIONS.md](DECISIONS.md) records every decision that clarifies, changes or goes beyond the PRD (for example, how duplicate inventory names are handled). Add an entry in the same change that implements the decision. Entries are append-only: to reverse a decision, add a new entry that supersedes the old one and mark the old one `Superseded by D-NNN`. Don't rewrite or delete history.
- **Precedence:** where the two conflict, the latest accepted entry in DECISIONS.md wins over the PRD. The tech stack in particular comes from D-001 to D-003, not from PRD §7. Check the log before relying on a PRD detail.
- **Status:** Phase 1 scaffolding. The app shell, placeholder pages, the database client and tests are in place. No tables or CRUD yet. Update this file when the structure or commands change.

## Stack

| Layer      | Choice                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| Language   | TypeScript (strict)                                                               |
| Framework  | Next.js 16 App Router, React 19, Cache Components on                              |
| Styling    | Tailwind CSS v4, theme tokens in `src/app/globals.css`                            |
| Mutations  | Server Actions (form-based; work without client JS)                               |
| Validation | Zod                                                                               |
| Database   | PostgreSQL on Supabase via Drizzle ORM + `postgres` (postgres.js)                 |
| Migrations | drizzle-kit (`drizzle/`)                                                          |
| Hosting    | Vercel                                                                            |
| Tooling    | Node 22+ / npm, ESLint (`eslint-config-next`), Prettier, Vitest + Testing Library |

Don't add new frameworks or major libraries (a component kit, a state manager, another ORM, a separate API server) without discussing it first and logging a decision.

**This is Next.js 16.** APIs and defaults differ from older versions, as AGENTS.md says. Before using a Next.js API, check the bundled docs in `node_modules/next/dist/docs/`, especially `01-app/01-getting-started/08-caching.md` for Cache Components.

## Layout

The frontend/backend split lives inside one Next.js app. `src/app` and `src/components` are the UI, and `src/server` is server-only code. It's one deploy.

```
src/
  app/                 # routes: page.tsx per section, layout.tsx (shared nav), api/health
    <section>/actions.ts  # Server Actions for that section (add as features land)
  components/          # shared React components ("use client" only where needed)
  lib/                 # pure, isomorphic code: domain constants, dates, Zod schemas
  server/              # server-only: every file starts with `import "server-only"`
    env.ts             # Zod-validated env; the only place process.env is read
    db/schema.ts       # Drizzle tables/enums (relative imports only: drizzle-kit reads it)
    db/client.ts       # lazy getDb()
    services/          # business logic: plain async functions using getDb()
drizzle/               # generated SQL migrations (commit them)
drizzle.config.ts
```

Tests sit next to the code they cover, as `*.test.ts` or `*.test.tsx`.

### Layering rules

- **Pages and Server Actions stay thin.** A page reads data through a service and renders it. An action parses `FormData` with a Zod schema, calls a service, then calls `revalidatePath` or `redirect`. Neither contains queries or business rules.
- **Services own the logic.** Expiration windows, store grouping, week calculations and duplicate handling all live in `src/server/services` (or `src/lib` if the logic is pure). Services never touch `FormData`, React or Next request APIs.
- **The schema is only persistence.**
- **Server Components by default.** Add `"use client"` only for interactivity (for example, the nav's active state or an optimistic checkbox). Keep client components small, and never import `src/server` from them.
- **Cache Components:** anything per-request goes inside `<Suspense>`. That covers `searchParams`, `cookies()`, "today" and DB reads that must be fresh. Call `await connection()` before using `new Date()` or `Date.now()`. Use `"use cache"` with `cacheLife` only where staleness is acceptable. After a mutation, revalidate the affected path.

## Domain rules (from the PRD and DECISIONS.md)

- Meal types: `breakfast`, `lunch`, `dinner`. Storage locations: `fridge`, `freezer`, `pantry`, `counter`. They're defined once in `src/lib/domain.ts`, enforced in Postgres with `pgEnum`s, and checked in forms with `z.enum`.
- **Dates are calendar dates, never instants** (D-003):
  - Store them in Postgres `date` columns (Drizzle `mode: "string"`) and pass them around as `YYYY-MM-DD` strings.
  - Use the helpers in `src/lib/dates.ts`, never `new Date(...)` arithmetic.
  - "Today" is `todayIn(getEnv().APP_TIME_ZONE)`.
  - Weeks run Monday to Sunday.
- Quantities are non-negative decimals (`numeric`, not float). Units are free text for now.
- An inventory item's expiration date is optional. Items without one are valid and sort last.
- Stores are rows in a `stores` table (seeded with Costco and Trader Joe's), not hard-coded strings.
- Use UUID primary keys (`uuid().defaultRandom()`).
- Invalid input returns field errors that the form re-renders, through `useActionState`. Never save bad data silently.

## Commands

```bash
npm install
npm run dev            # http://localhost:3000
npm run check          # lint + format:check + typecheck + test (run before calling work done)
npm run lint
npm run format         # prettier --write
npm run typecheck      # next typegen && tsc --noEmit
npm test               # vitest run (npm run test:watch for watch mode)
npm run build          # production build; catches Cache Components errors that dev may only warn about
npm run db:generate    # drizzle-kit generate: SQL migration from schema changes
npm run db:migrate     # apply migrations (uses MIGRATION_DATABASE_URL || DATABASE_URL)
```

CI (`.github/workflows/ci.yml`, D-004) runs `npm ci`, lint, format check, typecheck, tests and `npm run build` on every pull request and every push to `main`. CI must pass before a PR is merged. If you change these scripts, update the workflow in the same change.

Before you call a change done, `npm run check` and `npm run build` must both pass. For UI changes, also look at the page in a browser at desktop and phone widths.

## Database and migrations

- Every schema change goes through `npm run db:generate` and a committed migration in `drizzle/`. Never use `drizzle-kit push` against Supabase, and never edit the hosted schema by hand.
- Review the generated SQL before committing. drizzle-kit can turn a rename into a drop-and-add. Each migration should be one logical change.
- Never edit a migration that has already been applied to the hosted database. Add a new one instead.
- Vercel doesn't run migrations. Run `npm run db:migrate` against Supabase (using `MIGRATION_DATABASE_URL`, the direct connection) before deploying code that depends on the change.
- At runtime, use the Supabase pooled URL (transaction mode, port 6543). `getDb()` keeps one connection per function instance, and postgres.js doesn't use prepared statements, which the pooler requires.

## Deployment (Vercel)

- The Vercel project's Framework Preset is set to Next.js in the dashboard; there is no `vercel.json`. Don't override the output directory, because Vercel handles `.next` itself. The Node version comes from `engines` in `package.json`.
- Set `DATABASE_URL` (the pooled URL) and `APP_TIME_ZONE` in the Vercel project's environment variables, separately for Preview and Production.
- Keep the deployment private (Vercel Deployment Protection, or app-level auth) until access control is decided. The repo is public, so the deployed app must not be.

## Configuration and secrets

- All env vars are read through `getEnv()` in `src/server/env.ts`, which validates them with Zod. Don't read `process.env` anywhere else. `drizzle.config.ts` is the one exception, because it runs outside Next.
- Never expose a secret to the browser. Don't create `NEXT_PUBLIC_*` variables for anything sensitive.
- Local values go in `.env.local`, which is gitignored. Keep `.env.example` up to date with every variable name and placeholder values.
- **The repo is public.** Never commit credentials, connection strings or Supabase keys, and never print them in logs or error pages.

## Testing

- Vitest with jsdom and Testing Library, for pure logic (`src/lib`), services and synchronous components.
- Vitest can't render `async` Server Components. Keep the logic out of them, test that logic directly, and leave whole-page flows to end-to-end tests. Playwright gets added when the first CRUD flow lands.
- DB-backed service tests run against a real Postgres (local Docker or CI service container), not mocks or SQLite.
- Each PRD acceptance criterion you implement should have at least one test that covers it.
- Bug fixes start with a failing test.

## Code style

- TypeScript strict. No `any`; use `unknown` and narrow it. Infer types from Zod and Drizzle (`z.infer`, `$inferSelect`) instead of declaring them twice.
- Prettier handles formatting and ESLint handles correctness. Don't hand-format.
- Use the `@/` import alias inside `src/`, except in `src/server/db/schema.ts`.
- Prefer small, explicit functions over clever abstractions. This is a small personal app, so don't build for scale it doesn't need, but keep the layering clean so P1/P2 features (recipes, suggestions) slot in.
- Name things after the PRD's entities: `mealPlanEntries`, `inventoryItems`, `groceryItems`, `stores` (tables), and singular names for types.
- UI must work at phone width. Use semantic HTML and give forms real `<label>`s.

## Git workflow

- `main` is always deployable. Work on short-lived feature branches (`feat/inventory-crud`, `fix/expiry-sort`) and merge through a PR.
- Commits are small and focused, with an imperative subject line (`Add grocery store grouping`).
- A schema change and its migration go in the same commit.
- A change that implements a new decision includes its DECISIONS.md entry.
- Don't commit `.env.local`, `node_modules/`, `.next/` or editor files. Keep `.gitignore` current.
