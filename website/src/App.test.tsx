// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  window.history.replaceState({}, "", "/");
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(cleanup);
async function open(path: string) {
  window.history.replaceState({}, "", path);
  render(<App />);
  await screen.findByRole("link", { name: /CatCruxis home/ });
  await waitFor(() =>
    expect(screen.queryByText("Opening up campus…")).toBeNull(),
  );
}
describe("frontend user journeys", () => {
  it("searches discovery, resets filters, and reveals all events", async () => {
    const user = userEvent.setup();
    await open("/");
    await user.type(
      screen.getByRole("textbox", { name: "Search events" }),
      "soccer",
    );
    expect(screen.getByText("2 events")).toBeTruthy();
    expect(document.querySelectorAll(".event-grid .event-card")).toHaveLength(
      2,
    );
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("30 events")).toBeTruthy();
    while (screen.queryByRole("button", { name: "More to discover" }))
      await user.click(
        screen.getByRole("button", { name: "More to discover" }),
      );
    expect(document.querySelectorAll(".event-grid .event-card")).toHaveLength(
      30,
    );
  });
  it("combines dropdown filters and opens a matching event", async () => {
    const user = userEvent.setup();
    await open("/");
    const desktop = document.querySelector(".desktop-filters") as HTMLElement;
    await user.selectOptions(
      within(desktop).getByRole("combobox", { name: "Category" }),
      "sports",
    );
    await user.selectOptions(
      within(desktop).getByRole("combobox", { name: "Organized by" }),
      "student-organized",
    );
    expect(document.querySelectorAll(".event-grid .event-card")).toHaveLength(
      4,
    );
    await user.click(
      within(document.querySelector(".event-grid") as HTMLElement).getByRole(
        "link",
        { name: /Pickup Soccer/ },
      ),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Pickup Soccer at IMAC",
      }),
    ).toBeTruthy();
  });
  it("handles multiple organizers, categories, sources, and related event links", async () => {
    await open("/events/1");
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Hurt Hub Startup Pitch Night",
      }),
    ).toBeTruthy();
    const orgs = document.querySelector(".detail-organizers") as HTMLElement;
    expect(
      within(orgs).getByRole("link", { name: "The Hurt Hub" }),
    ).toBeTruthy();
    expect(
      within(orgs).getByRole("link", { name: "Entrepreneurship Club" }),
    ).toBeTruthy();
    const sources = document.querySelector(".found-on") as HTMLElement;
    expect(within(sources).getByText("WildcatSync")).toBeTruthy();
    expect(within(sources).getByText("Hurt Hub")).toBeTruthy();
    expect(
      within(
        document.querySelector(".detail-topline") as HTMLElement,
      ).getByText("Technology / Entrepreneurship"),
    ).toBeTruthy();
    expect(
      document.querySelectorAll(".related-section .event-card"),
    ).toHaveLength(4);
  });
  it("shows a seven-day week, categories, organization links, and missing-page states", async () => {
    await open("/this-week");
    expect(document.querySelectorAll(".week-day")).toHaveLength(7);
    expect(document.querySelectorAll(".week-event")).toHaveLength(24);
    cleanup();
    await open("/categories/technology");
    expect(
      screen.getByRole("heading", { level: 1, name: "Technology" }),
    ).toBeTruthy();
    expect(
      document.querySelectorAll(".event-grid .event-card").length,
    ).toBeGreaterThan(0);
    cleanup();
    await open("/organizations");
    expect(document.querySelectorAll(".org-card")).toHaveLength(22);
    cleanup();
    await open("/events/999");
    expect(
      screen.getByRole("heading", { name: "That event isn’t here." }),
    ).toBeTruthy();
    cleanup();
    await open("/missing");
    expect(
      screen.getByRole("heading", { name: "A little off campus?" }),
    ).toBeTruthy();
  });
  it("filters site-wide search and navigates to a result", async () => {
    const user = userEvent.setup();
    await open("/");
    await user.click(
      screen.getByRole("button", { name: /Search campus events/ }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Search all campus events" }),
      "startup",
    );
    const dialog = document.querySelector(".search-dialog") as HTMLElement;
    expect(within(dialog).getByText("2 matching events")).toBeTruthy();
    await user.click(
      within(dialog).getByRole("link", {
        name: /Hurt Hub Startup Pitch Night/,
      }),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Hurt Hub Startup Pitch Night",
      }),
    ).toBeTruthy();
    expect(dialog.hasAttribute("open")).toBe(false);
  });
  it("validates categories and end time, then adds a submitted event to the guide", async () => {
    const user = userEvent.setup();
    await open("/submit");
    await user.type(
      screen.getByRole("textbox", { name: "Event title *" }),
      "Campus Sketch Walk",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Description *" }),
      "Bring a notebook and meet new creative friends.",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Location *" }),
      "Chambers Lawn",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Organizer *" }),
      "Sketch Club",
    );
    fireEvent.change(screen.getByLabelText("Start time *"), {
      target: { value: "18:00" },
    });
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "17:00" },
    });
    fireEvent.submit(document.querySelector("form")!);
    expect(screen.getByRole("alert").textContent).toContain(
      "End time must be later",
    );
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "19:00" },
    });
    fireEvent.submit(document.querySelector("form")!);
    expect(screen.getByRole("alert").textContent).toContain(
      "Choose at least one category",
    );
    await user.click(screen.getByRole("checkbox", { name: "Arts & Culture" }));
    await user.click(screen.getByRole("checkbox", { name: "Wellness" }));
    fireEvent.submit(document.querySelector("form")!);
    await screen.findByRole("heading", { level: 1, name: /You’re on/ });
    await user.click(screen.getByRole("link", { name: "See your event" }));
    expect(
      await screen.findByRole("heading", { name: "Campus Sketch Walk" }),
    ).toBeTruthy();
    expect(screen.getByText("Arts & Culture / Wellness")).toBeTruthy();
    expect(screen.getByText("6:00 PM – 7:00 PM")).toBeTruthy();
  });
});
