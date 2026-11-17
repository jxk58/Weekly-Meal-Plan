import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

afterEach(cleanup);

describe("SiteNav", () => {
  it("links to all primary sections", () => {
    render(<SiteNav />);
    for (const label of ["Home", "Meals", "Inventory", "Grocery"]) {
      expect(screen.getByRole("link", { name: label })).toBeDefined();
    }
  });

  it.each([
    ["/", "Home"],
    ["/meals", "Meals"],
    ["/inventory", "Inventory"],
    ["/grocery", "Grocery"],
  ])("marks only the current section on %s", (path, label) => {
    pathname.current = path;
    render(<SiteNav />);
    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual([label]);
  });
});
