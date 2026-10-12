import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "../lib/EventContext";
export function Organizations() {
  const { events } = useEvents();
  const [query, setQuery] = useState("");
  const orgs = [
    ...new Map(
      events.flatMap((e) => e.organizers).map((o) => [o.id, o]),
    ).values(),
  ]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="section organizations-page">
      <div className="page-intro">
        <span className="eyebrow red-text">The people who make it happen</span>
        <h1>
          Find your people<span className="red-text">.</span>
        </h1>
        <p>Campus centers, student communities, and everyone in between.</p>
      </div>
      <label className="org-search">
        <Search size={18} />
        <input
          aria-label="Search organizations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find an organization…"
        />
      </label>
      <div className="org-grid">
        {orgs.map((o) => (
          <Link
            to={`/?organizer=${o.id}#discover`}
            key={o.id}
            className="org-card"
          >
            <span className="eyebrow">{o.type}</span>
            <h2>{o.name}</h2>
            <div>
              <span>
                {
                  events.filter((e) =>
                    e.organizers.some((org) => org.id === o.id),
                  ).length
                }{" "}
                upcoming demo events
              </span>
              <ArrowUpRight />
            </div>
          </Link>
        ))}
      </div>
      {!orgs.length && (
        <div className="empty-state">
          <h2>No organizations found.</h2>
          <button className="text-link" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
