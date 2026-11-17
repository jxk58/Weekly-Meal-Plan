import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("links to each section", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { level: 1, name: "This week" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Plan this week" }).getAttribute("href")).toBe(
      "/meals",
    );
    expect(screen.getByRole("link", { name: "View inventory" }).getAttribute("href")).toBe(
      "/inventory",
    );
    expect(screen.getByRole("link", { name: "Open grocery list" }).getAttribute("href")).toBe(
      "/grocery",
    );
  });
});
