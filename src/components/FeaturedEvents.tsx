import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CampusEvent } from "../data/types";
import { eventDate, eventTime } from "../lib/format";
export function FeaturedEvents({ events }: { events: CampusEvent[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const go = (direction: number) => {
    const target = Math.max(0, Math.min(events.length - 1, active + direction));
    rail.current?.children[target]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  return (
    <section className="featured-section" aria-labelledby="featured-title">
      <div className="feature-top">
        <span className="eyebrow" id="featured-title">
          <span className="live-dot" /> Featured events
        </span>
        <span className="feature-note">
          Good things happen when you show up.
        </span>
        <div className="rail-controls">
          <span>
            {String(active + 1).padStart(2, "0")}{" "}
            <span className="muted">
              / {String(events.length).padStart(2, "0")}
            </span>
          </span>
          <button
            className="circle-button"
            aria-label="Previous featured event"
            disabled={active === 0}
            onClick={() => go(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="circle-button"
            aria-label="Next featured event"
            disabled={active === events.length - 1}
            onClick={() => go(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div
        className="featured-rail"
        ref={rail}
        onScroll={() => {
          if (rail.current) {
            const element = rail.current;
            const width =
              (element.firstElementChild as HTMLElement)?.offsetWidth || 1;
            const gap = parseFloat(getComputedStyle(element).columnGap) || 16;
            const atEnd =
              element.scrollLeft >=
              element.scrollWidth - element.clientWidth - 2;
            setActive(
              atEnd
                ? events.length - 1
                : Math.min(
                    events.length - 1,
                    Math.round(element.scrollLeft / (width + gap)),
                  ),
            );
          }
        }}
      >
        {events.map((event, i) => (
          <Link
            to={`/events/${event.id}`}
            className="featured-card"
            key={event.id}
          >
            <img
              src={event.image}
              alt={event.imageAlt}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            <div className="feature-shade pointer-events-none" />
            <div className="feature-card-top">
              <span>{event.categories[0].name}</span>
              <span>
                {eventDate(event.startDateTime)} <span>·</span>{" "}
                {eventTime(event.startDateTime)}
              </span>
            </div>
            <div className="feature-card-bottom">
              <span className="eyebrow">
                {event.organizers.map((o) => o.name).join(" + ")}
              </span>
              <h2>{event.title}</h2>
              <p className="feature-description">{event.shortDescription}</p>
              <div className="feature-location">
                <span>
                  <MapPin size={14} />
                  {event.location.name}
                </span>
                <span className="feature-cta">
                  Explore event <ArrowUpRight size={22} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="feature-progress" aria-hidden="true">
        {events.map((e, i) => (
          <span key={e.id} className={i === active ? "active" : ""} />
        ))}
      </div>
    </section>
  );
}
