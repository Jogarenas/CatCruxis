import { mockEvents, DEMO_WEEK } from "../data/events";
import { campusDay } from "./format";
import type { CampusEvent, EventFilters } from "../data/types";
export const emptyFilters: EventFilters = {
  search: "",
  date: "",
  category: "",
  organizer: "",
  location: "",
  source: "",
  status: "",
};
export function filterEvents(
  events: CampusEvent[],
  filters: Partial<EventFilters>,
): CampusEvent[] {
  const query = filters.search?.trim().toLocaleLowerCase() || "";
  return events
    .filter((event) => {
      const text = [
        event.title,
        event.description,
        event.location.name,
        ...event.organizers.map((o) => o.name),
        ...event.categories.map((c) => c.name),
      ]
        .join(" ")
        .toLocaleLowerCase();
      const day = campusDay(event.startDateTime);
      return (
        (!query || text.includes(query)) &&
        (!filters.category ||
          event.categories.some((c) => c.slug === filters.category)) &&
        (!filters.organizer ||
          event.organizers.some((o) => String(o.id) === filters.organizer)) &&
        (!filters.source ||
          event.sources.some((s) => String(s.id) === filters.source)) &&
        (!filters.location || event.location.name === filters.location) &&
        (!filters.status || event.officialStatus === filters.status) &&
        (!filters.date ||
          (filters.date === "week"
            ? day >= DEMO_WEEK && day <= "2026-10-18"
            : day === filters.date))
      );
    })
    .sort((a, b) => Date.parse(a.startDateTime) - Date.parse(b.startDateTime));
}
// Promise-based boundary: replace this repository implementation with API requests later.
const sessionEvents: CampusEvent[] = [...mockEvents];
export async function getEvents(): Promise<CampusEvent[]> {
  return [...sessionEvents];
}
export async function getEventById(
  id: string | number,
): Promise<CampusEvent | undefined> {
  return sessionEvents.find(
    (e) => String(e.id) === String(id) || e.slug === id,
  );
}
export async function getFeaturedEvents(): Promise<CampusEvent[]> {
  return sessionEvents.filter((e) => e.featured);
}
export async function getEventsByCategory(
  category: string,
): Promise<CampusEvent[]> {
  return filterEvents(sessionEvents, { category });
}
export async function searchEvents(search: string): Promise<CampusEvent[]> {
  return filterEvents(sessionEvents, { search });
}
export async function addEvent(
  event: Omit<CampusEvent, "id">,
): Promise<CampusEvent> {
  const created = {
    ...event,
    id: Math.max(...sessionEvents.map((e) => e.id)) + 1,
  };
  sessionEvents.push(created);
  return created;
}
