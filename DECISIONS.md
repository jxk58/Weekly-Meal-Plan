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

_No decisions recorded yet._
