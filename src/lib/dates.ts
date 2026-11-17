/**
 * Calendar-date helpers. Dates are plain `YYYY-MM-DD` strings (no time, no time zone) so a
 * meal planned for "Tuesday" never shifts a day because of server vs. browser time zones.
 * Weeks run Monday through Sunday.
 */

export type IsoDate = string;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toUtc(day: IsoDate): Date {
  return new Date(`${day}T00:00:00Z`);
}

function fromUtc(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

/** Return the value if it is a real calendar date in `YYYY-MM-DD` form, otherwise null. */
export function parseIsoDate(value: string): IsoDate | null {
  if (!ISO_DATE.test(value)) return null;
  const date = toUtc(value);
  if (Number.isNaN(date.getTime()) || fromUtc(date) !== value) return null;
  return value;
}

export function addDays(day: IsoDate, days: number): IsoDate {
  const date = toUtc(day);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

/** Monday of the week containing `day`. */
export function weekStart(day: IsoDate): IsoDate {
  const offsetFromMonday = (toUtc(day).getUTCDay() + 6) % 7;
  return addDays(day, -offsetFromMonday);
}

/** The seven dates (Monday to Sunday) of the week containing `day`. */
export function weekDates(day: IsoDate): IsoDate[] {
  const start = weekStart(day);
  return Array.from({ length: 7 }, (_, offset) => addDays(start, offset));
}

/** Today's calendar date in the given IANA time zone (e.g. "America/Los_Angeles"). */
export function todayIn(timeZone: string, now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function formatDate(day: IsoDate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(toUtc(day));
}
