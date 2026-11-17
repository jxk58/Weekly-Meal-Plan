import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { Card, Empty } from "@/components/card";
import { addDays, formatDate, parseIsoDate, todayIn, weekDates } from "@/lib/dates";
import { labelFor, MEAL_TYPES } from "@/lib/domain";
import { getEnv } from "@/server/env";

export const metadata: Metadata = { title: "Meals" };

export default function MealsPage({ searchParams }: PageProps<"/meals">) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Meal plan</h1>
      <Suspense fallback={<Empty>Loading week…</Empty>}>
        <WeekView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function WeekView({ searchParams }: { searchParams: PageProps<"/meals">["searchParams"] }) {
  const { week } = await searchParams;
  await connection(); // "today" must be computed per request, never at build time.

  let anchor = todayIn(getEnv().APP_TIME_ZONE);
  if (week !== undefined) {
    const parsed = typeof week === "string" ? parseIsoDate(week) : null;
    if (!parsed) redirect("/meals");
    anchor = parsed;
  }

  const days = weekDates(anchor);
  const prevWeek = addDays(days[0], -7);
  const nextWeek = addDays(days[0], 7);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">
          Week of {formatDate(days[0], { month: "short", day: "numeric", year: "numeric" })}
        </h2>
        <nav aria-label="Week" className="flex gap-3">
          <Link href={`/meals?week=${prevWeek}`}>← Prev</Link>
          <Link href="/meals">Today</Link>
          <Link href={`/meals?week=${nextWeek}`}>Next →</Link>
        </nav>
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
        {days.map((day) => (
          <Card
            key={day}
            title={
              <>
                {formatDate(day, { weekday: "short" })}{" "}
                <span className="font-normal text-muted">
                  {formatDate(day, { month: "2-digit", day: "2-digit" })}
                </span>
              </>
            }
          >
            {MEAL_TYPES.map((mealType) => (
              <div key={mealType}>
                <h3 className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">
                  {labelFor(mealType)}
                </h3>
                <Empty>No meal</Empty>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
