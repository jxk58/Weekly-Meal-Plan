# Weekly Meal Plan

A personal household app for weekly meal planning, food inventory (with expiration tracking) and store-grouped grocery lists. It's built with Next.js (TypeScript, React), Drizzle ORM and PostgreSQL (Supabase), and deployed on Vercel.

- Requirements: [meal_planner_prd.md](meal_planner_prd.md)
- Decisions since the PRD (including the stack change): [DECISIONS.md](DECISIONS.md)
- Conventions: [CLAUDE.md](CLAUDE.md)

## Quickstart

Requires Node 22+.

```bash
npm install
cp .env.example .env.local    # then fill in DATABASE_URL and APP_TIME_ZONE
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run check    # lint, format check, typecheck, tests
npm run build
```
