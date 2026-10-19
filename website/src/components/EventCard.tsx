import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CampusEvent } from "../data/types";
import { datePart, eventDate, eventTime } from "../lib/format";
export function EventCard({
  event,
  compact = false,
}: {
  event: CampusEvent;
  compact?: boolean;
}) {
  return (
    <Link
      to={`/events/${event.id}`}
      className={`event-card group ${compact ? "compact" : ""}`}
    >
      <div className="card-image">
        <img src={event.image} alt={event.imageAlt} loading="lazy" />
        <span className="date-square">
          <span>{datePart(event.startDateTime, "month")}</span>
          <strong>{datePart(event.startDateTime, "day")}</strong>
        </span>
        <span className="image-arrow">
          <ArrowUpRight size={21} />
        </span>
        {event.officialStatus === "student-organized" && (
          <span className="student-label">Student submitted</span>
        )}
      </div>
      <div className="card-copy">
        <div className="eyebrow card-category">
          {event.categories.map((c) => c.name).join(" / ")}
        </div>
        <h3>{event.title}</h3>
        <p className="card-time">
          {eventDate(event.startDateTime)} <span>·</span>{" "}
          {eventTime(event.startDateTime)}
        </p>
        <p className="card-location">
          <MapPin size={13} />
          {event.location.name}
        </p>
        <div className="card-bottom">
          <span>{event.organizers.map((o) => o.name).join(" + ")}</span>
          <span className="card-source">
            {event.sources.map((s) => s.name).join(" + ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
export function EventGrid({
  events,
  emptyAction,
}: {
  events: CampusEvent[];
  emptyAction?: () => void;
}) {
  if (!events.length)
    return (
      <div className="empty-state">
        <span className="eyebrow">A little too specific?</span>
        <h3>No events found.</h3>
        <p>Try another search or open up your filters.</p>
        {emptyAction && (
          <button className="button dark" onClick={emptyAction}>
            Clear filters <ArrowUpRight size={17} />
          </button>
        )}
      </div>
    );
  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </div>
  );
}
