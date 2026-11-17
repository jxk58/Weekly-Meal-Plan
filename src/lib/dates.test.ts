import { describe, expect, it } from "vitest";

import { addDays, formatDate, parseIsoDate, todayIn, weekDates, weekStart } from "./dates";

describe("parseIsoDate", () => {
  it("accepts real calendar dates", () => {
    expect(parseIsoDate("2026-11-18")).toBe("2026-11-18");
    expect(parseIsoDate("2028-02-29")).toBe("2028-02-29");
  });

  it.each(["not-a-date", "2026-13-01", "2026-02-30", "2027-02-29", "2026-1-5", ""])(
    "rejects %j",
    (value) => {
      expect(parseIsoDate(value)).toBeNull();
    },
  );
});

describe("weekStart", () => {
  it.each(["2026-11-16", "2026-11-18", "2026-11-22"])("maps %s to Monday 2026-11-16", (day) => {
    expect(weekStart(day)).toBe("2026-11-16");
  });

  it("crosses year boundaries", () => {
    expect(weekStart("2027-01-01")).toBe("2026-12-28");
  });
});

describe("weekDates", () => {
  it("spans Monday to Sunday", () => {
    const days = weekDates("2026-11-19");
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2026-11-16");
    expect(days[6]).toBe("2026-11-22");
  });
});

describe("addDays", () => {
  it("handles month ends and DST-free arithmetic", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-11-16", -7)).toBe("2026-11-09");
  });
});

describe("todayIn", () => {
  it("uses the given time zone, not the server's", () => {
    const instant = new Date("2026-11-17T03:00:00Z");
    expect(todayIn("UTC", instant)).toBe("2026-11-17");
    expect(todayIn("America/Los_Angeles", instant)).toBe("2026-11-16");
  });
});

describe("formatDate", () => {
  it("formats without shifting the day", () => {
    expect(formatDate("2026-11-16", { month: "short", day: "numeric", year: "numeric" })).toBe(
      "Nov 16, 2026",
    );
  });
});
