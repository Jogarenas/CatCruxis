import { useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CampusEvent, EventFilters as Filters } from "../data/types";
import { categories } from "../data/categories";
import { sources } from "../data/sources";
import { campusDay } from "../lib/format";
export function EventFilters({
  value,
  onChange,
  events,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
  events: CampusEvent[];
}) {
  const sheet = useRef<HTMLDialogElement>(null);
  const update = (key: keyof Filters, next: string) =>
    onChange({ ...value, [key]: next });
  const orgs = [
    ...new Map(
      events.flatMap((e) => e.organizers).map((o) => [o.id, o]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const locations = [...new Set(events.map((e) => e.location.name))].sort();
  const active = Object.values(value).filter(Boolean).length;
  const fields = (
    <>
      <label>
        Date
        <select
          value={value.date}
          onChange={(e) => update("date", e.target.value)}
        >
          <option value="">Any date</option>
          <option value="week">This week · Oct 12–18</option>
          {[...new Set(events.map((e) => campusDay(e.startDateTime)))]
            .sort()
            .map((day) => (
              <option value={day} key={day}>
                {new Date(`${day}T12:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                })}
              </option>
            ))}
        </select>
      </label>
      <label>
        Category
        <select
          value={value.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All interests</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Organizer
        <select
          value={value.organizer}
          onChange={(e) => update("organizer", e.target.value)}
        >
          <option value="">Anyone</option>
          {orgs.map((o) => (
            <option value={o.id} key={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Location
        <select
          value={value.location}
          onChange={(e) => update("location", e.target.value)}
        >
          <option value="">Anywhere</option>
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
      <label>
        Source
        <select
          value={value.source}
          onChange={(e) => update("source", e.target.value)}
        >
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Organized by
        <select
          value={value.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">Everyone</option>
          <option value="official">Official</option>
          <option value="student-organized">Students</option>
        </select>
      </label>
    </>
  );
  return (
    <div className="filters">
      <div className="filter-search">
        <Search size={18} />
        <input
          aria-label="Search events"
          placeholder="Find your next thing…"
          value={value.search}
          onChange={(e) => update("search", e.target.value)}
        />
        {value.search && (
          <button
            aria-label="Clear search"
            onClick={() => update("search", "")}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="desktop-filters">{fields}</div>
      <button
        className="filter-mobile-button"
        onClick={() => sheet.current?.showModal()}
      >
        <SlidersHorizontal size={17} />
        Filters {active > 0 && <span>{active}</span>}
      </button>
      <dialog
        aria-label="Filter campus events"
        ref={sheet}
        className="filter-sheet"
      >
        <div className="dialog-heading">
          <h2>Find your thing.</h2>
          <button
            className="circle-button"
            aria-label="Close filters"
            onClick={() => sheet.current?.close()}
          >
            <X />
          </button>
        </div>
        <div className="sheet-fields">{fields}</div>
        <button className="button red" onClick={() => sheet.current?.close()}>
          Show events
        </button>
      </dialog>
    </div>
  );
}
