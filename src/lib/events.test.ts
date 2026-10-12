import { describe, expect, it } from "vitest";
import { mockEvents } from "../data/events";
import {
  emptyFilters,
  filterEvents,
  getEventById,
  getEventsByCategory,
  getFeaturedEvents,
  searchEvents,
} from "./events";
describe("event discovery", () => {
  it("matches an organizer beyond the first organizer", () => {
    const results = filterEvents(mockEvents, { organizer: "4" });
    expect(results.map((e) => e.id)).toContain(1);
  });
  it("matches categories and sources anywhere in their arrays", () => {
    expect(
      filterEvents(mockEvents, {
        category: "entrepreneurship",
        source: "1",
      }).map((e) => e.id),
    ).toContain(1);
    expect(
      filterEvents(mockEvents, { category: "social" }).map((e) => e.id),
    ).toContain(3);
  });
  it("combines filters and returns no results for incompatible filters", () => {
    const results = filterEvents(mockEvents, {
      search: "soccer",
      status: "student-organized",
      location: "IMAC Fields",
      date: "week",
    });
    expect(results.map((e) => e.id)).toEqual([9]);
    expect(
      filterEvents(mockEvents, {
        category: "career",
        status: "student-organized",
      }),
    ).toEqual([]);
  });
  it("searches description, location, categories, and secondary organizers", () => {
    for (const search of [
      "bold beginnings",
      "The Hurt Hub",
      "entrepreneurship",
      "Entrepreneurship Club",
    ]) {
      expect(filterEvents(mockEvents, { search }).map((e) => e.id)).toContain(
        1,
      );
    }
    expect(
      filterEvents(mockEvents, { search: "   SOCCER   " }).length,
    ).toBeGreaterThan(0);
  });
  it("restricts the demo week and specific dates in campus time", () => {
    const week = filterEvents(mockEvents, { date: "week" });
    expect(week).toHaveLength(24);
    expect(
      week.every(
        (e) =>
          e.startDateTime.slice(0, 10) >= "2026-10-12" &&
          e.startDateTime.slice(0, 10) <= "2026-10-18",
      ),
    ).toBe(true);
    expect(filterEvents(mockEvents, { date: "2026-10-12" })).toHaveLength(3);
  });
  it("filters UTC events by their Davidson date", () => {
    const lateNight = {
      ...mockEvents[0],
      startDateTime: "2026-10-14T01:00:00Z",
    };
    expect(filterEvents([lateNight], { date: "2026-10-13" })).toHaveLength(1);
    expect(filterEvents([lateNight], { date: "2026-10-14" })).toHaveLength(0);
  });
  it("resetting includes all 30 events, sorted by start time", () => {
    const all = filterEvents(mockEvents, emptyFilters);
    expect(all).toHaveLength(30);
    expect(all.map((e) => e.startDateTime)).toEqual(
      all.map((e) => e.startDateTime).sort(),
    );
  });
  it("exposes async data access with ID and slug lookup", async () => {
    expect((await getFeaturedEvents()).length).toBe(4);
    expect((await getEventById(1))?.title).toBe(mockEvents[0].title);
    expect((await getEventById(mockEvents[0].slug))?.id).toBe(1);
    expect(await getEventById("missing")).toBeUndefined();
    expect((await getEventsByCategory("technology")).length).toBeGreaterThan(0);
    expect((await searchEvents("soccer")).length).toBeGreaterThan(0);
  });
  it("has valid event dates and many-to-many fixture relationships", () => {
    expect(new Set(mockEvents.map((e) => e.id)).size).toBe(30);
    expect(new Set(mockEvents.map((e) => e.slug)).size).toBe(30);
    for (const event of mockEvents) {
      expect(Number.isNaN(Date.parse(event.startDateTime))).toBe(false);
      expect(Date.parse(event.endDateTime!)).toBeGreaterThan(
        Date.parse(event.startDateTime),
      );
      expect(event.organizers.length).toBeGreaterThan(0);
      expect(event.categories.length).toBeGreaterThan(0);
      expect(event.sources.length).toBeGreaterThan(0);
    }
  });
});
