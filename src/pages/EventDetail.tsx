import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  Check,
  Clock,
  MapPin,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEvents } from "../lib/EventContext";
import { downloadCalendar, eventDate, eventTime } from "../lib/format";
import { EventGrid } from "../components/EventCard";
export function EventDetail() {
  const { id } = useParams();
  const { events } = useEvents();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    setAdded(false);
  }, [id]);
  const event = events.find((e) => String(e.id) === id || e.slug === id);
  if (!event)
    return (
      <section className="section empty-state">
        <h1>That event isn’t here.</h1>
        <p>There’s still plenty happening around campus.</p>
        <Link className="button red" to="/">
          Back to discovery <ArrowLeft size={17} />
        </Link>
      </section>
    );
  const related = events
    .filter(
      (e) =>
        e.id !== event.id &&
        e.categories.some((c) =>
          event.categories.some((cat) => cat.id === c.id),
        ),
    )
    .slice(0, 4);
  return (
    <article className="detail-page">
      <div className="detail-heading">
        <Link className="text-link" to="/#discover">
          <ArrowLeft size={17} />
          Back to discovery
        </Link>
        <div className="detail-topline">
          <span className="eyebrow red-text">
            {event.categories.map((c) => c.name).join(" / ")}
          </span>
          <span className="eyebrow">
            {event.officialStatus === "official"
              ? "Official campus event"
              : "Student submitted"}
          </span>
        </div>
        <h1>{event.title}</h1>
        <p>{event.shortDescription}</p>
      </div>
      <div className="detail-image">
        <img src={event.image} alt={event.imageAlt} />
        <span className="detail-image-tag">THE CC / EVENT GUIDE</span>
      </div>
      <div className="detail-body">
        <div className="detail-description">
          <span className="eyebrow red-text">Make time for this</span>
          <h2>A little more about it.</h2>
          {event.description.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="detail-organizers">
            <span className="eyebrow">Brought to you by</span>
            {event.organizers.map((o) => (
              <Link to={`/?organizer=${o.id}#discover`} key={o.id}>
                {o.name}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </div>
        <aside className="event-info">
          <div className="info-row">
            <CalendarPlus size={21} />
            <div>
              <span>Date</span>
              <strong>{eventDate(event.startDateTime, true)}</strong>
              <small>2026 · Davidson campus time</small>
            </div>
          </div>
          <div className="info-row">
            <Clock size={21} />
            <div>
              <span>Time</span>
              <strong>
                {eventTime(event.startDateTime)}
                {event.endDateTime && ` – ${eventTime(event.endDateTime)}`}
              </strong>
              <small>Eastern Time</small>
            </div>
          </div>
          <div className="info-row">
            <MapPin size={21} />
            <div>
              <span>Meet us at</span>
              <strong>{event.location.name}</strong>
              {event.location.room && <small>{event.location.room}</small>}
            </div>
          </div>
          <button
            className="button red"
            onClick={() => {
              downloadCalendar(event);
              setAdded(true);
            }}
          >
            {added ? (
              <>
                <Check size={18} />
                Calendar file downloaded
              </>
            ) : (
              <>
                <CalendarPlus size={18} />
                Add to Calendar
              </>
            )}
          </button>
          <p role="status" className="calendar-note">
            {added
              ? "Open the .ics file in your calendar app to add this demo event."
              : "A fictional event for the prototype."}
          </p>
          <div className="found-on">
            <span className="eyebrow">Found on</span>
            {event.sources.map((s) => (
              <div key={s.id}>
                <span>{s.name}</span>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View original mock event on ${s.name}`}
                  >
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </div>
            ))}
            {event.sources.find((s) => s.url) && (
              <a
                className="text-link"
                target="_blank"
                rel="noreferrer"
                href={event.sources.find((s) => s.url)?.url}
              >
                View Original Event <ArrowUpRight size={16} />
              </a>
            )}
            <small>Original links use placeholder URLs in this demo.</small>
          </div>
        </aside>
      </div>
      <section className="section related-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow red-text">Keep exploring</span>
            <h2>More your kind of thing.</h2>
          </div>
        </div>
        <EventGrid events={related} />
      </section>
    </article>
  );
}
