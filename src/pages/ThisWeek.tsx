import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "../lib/EventContext";
import { filterEvents } from "../lib/events";
import { campusDay, eventTime } from "../lib/format";
export function ThisWeek() {
  const { events } = useEvents();
  const week = filterEvents(events, { date: "week" });
  return (
    <section className="section week-page">
      <div className="page-intro">
        <span className="eyebrow red-text">Your next seven days</span>
        <h1>
          This week
          <br />
          at Davidson<span className="red-text">.</span>
        </h1>
        <div className="page-intro-bottom">
          <p>Less scrolling. More showing up.</p>
          <span className="eyebrow">Demo week / October 12–18, 2026</span>
        </div>
      </div>
      <div className="week-list">
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day, i) => {
          const date = `2026-10-${12 + i}`;
          const daily = week.filter((e) => campusDay(e.startDateTime) === date);
          return (
            <section className="week-day" key={day}>
              <div className="week-day-label">
                <span>OCT</span>
                <strong>{12 + i}</strong>
                <h2>{day}</h2>
              </div>
              <div className="week-day-events">
                {daily.length ? (
                  daily.map((e) => (
                    <Link
                      to={`/events/${e.id}`}
                      className="week-event"
                      key={e.id}
                    >
                      <img src={e.image} alt={e.imageAlt} />
                      <div>
                        <span className="eyebrow red-text">
                          {e.categories.map((c) => c.name).join(" / ")}
                        </span>
                        <h3>{e.title}</h3>
                        <p>
                          {e.location.name} ·{" "}
                          {e.organizers.map((o) => o.name).join(" + ")}
                        </p>
                      </div>
                      <span className="week-time">
                        {eventTime(e.startDateTime)}
                      </span>
                      <ArrowUpRight size={23} />
                    </Link>
                  ))
                ) : (
                  <p className="muted">
                    A little breathing room.{" "}
                    <Link to="/submit">Add your plans.</Link>
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
