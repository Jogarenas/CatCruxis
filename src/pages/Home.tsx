import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { FeaturedEvents } from "../components/FeaturedEvents";
import { EventGrid, EventCard } from "../components/EventCard";
import { EventFilters } from "../components/EventFilters";
import { CategoryCard } from "../components/CategoryCard";
import { useEvents } from "../lib/EventContext";
import { emptyFilters, filterEvents } from "../lib/events";
import { categories } from "../data/categories";
import type { EventFilters as Filters } from "../data/types";
export function Home() {
  const { events } = useEvents();
  const [params, setParams] = useSearchParams();
  const filters: Filters = {
    ...emptyFilters,
    ...Object.fromEntries(
      Object.keys(emptyFilters).map((key) => [key, params.get(key) || ""]),
    ),
  };
  const [visible, setVisible] = useState(8);
  const key = params.toString();
  useEffect(() => {
    setVisible(8);
  }, [key]);
  const update = (next: Filters) =>
    setParams(
      Object.fromEntries(Object.entries(next).filter(([, value]) => value)),
      { replace: true, preventScrollReset: true },
    );
  const filtered = useMemo(() => filterEvents(events, filters), [events, key]);
  const activeFilters = Object.entries(filters).filter(([, v]) => v);
  return (
    <>
      <section className="home-intro">
        <div>
          <div className="eyebrow intro-kicker">
            Davidson’s unofficial campus guide
          </div>
          <h1>
            Your campus.
            <br />
            <span>Wide open.</span>
            <span className="heading-star" aria-hidden="true">
              ✳
            </span>
          </h1>
        </div>
        <div className="intro-aside">
          <p>One campus. Every event.</p>
          <span>
            The big nights. The small gatherings.
            <br />
            And everything worth showing up for.
          </span>
          <a href="#discover" className="text-link">
            Find your next thing <ArrowDown size={17} />
          </a>
        </div>
      </section>
      <FeaturedEvents events={events.filter((e) => e.featured)} />
      <div className="demo-strip">
        <span className="tiny-square" /> A glimpse of what’s possible{" "}
        <span className="demo-strip-note">
          Demo edition · Fictional events · October 2026
        </span>
      </div>
      <section
        className="discovery section"
        id="discover"
        aria-labelledby="discover-heading"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow red-text">The campus, in one place</span>
            <h2 id="discover-heading">
              What’s happening
              <br className="mobile-only" /> at Davidson
              <span className="red-text">.</span>
            </h2>
          </div>
          <Link className="text-link" to="/this-week">
            This week’s lineup <ArrowUpRight size={18} />
          </Link>
        </div>
        <EventFilters value={filters} onChange={update} events={events} />
        <div className="results-bar">
          <span aria-live="polite">
            {filtered.length} events{" "}
            <span className="muted">· A little something for everyone</span>
          </span>
          {activeFilters.length > 0 ? (
            <button
              className="reset-button"
              onClick={() => update(emptyFilters)}
            >
              Clear filters <X size={14} />
            </button>
          ) : (
            <span className="sort-label">
              Soonest first <ArrowDown size={12} />
            </span>
          )}
        </div>
        <EventGrid
          events={filtered.slice(0, visible)}
          emptyAction={() => update(emptyFilters)}
        />
        {visible < filtered.length && (
          <div className="load-more">
            <button
              className="button outline"
              onClick={() => setVisible((v) => v + 8)}
            >
              More to discover <ArrowDown size={17} />
            </button>
            <span>
              {Math.min(visible, filtered.length)} of {filtered.length} events
            </span>
          </div>
        )}
      </section>
      <section className="interest-section section">
        <div className="section-heading">
          <div>
            <span className="eyebrow red-text">Follow your curiosity</span>
            <h2>
              Explore by interest<span className="red-text">.</span>
            </h2>
          </div>
          <Link to="/categories" className="text-link">
            All interests <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {categories
            .filter((c) => c.name !== "Community")
            .map((c) => (
              <CategoryCard
                category={c}
                count={
                  events.filter((e) =>
                    e.categories.some((cat) => cat.id === c.id),
                  ).length
                }
                key={c.id}
              />
            ))}
        </div>
      </section>
      <section className="around-section section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">By students. For students.</span>
            <h2>
              Around campus
              <span className="hand-star" aria-hidden="true">
                ✳
              </span>
            </h2>
            <p>The plans that don’t always make the campus calendar.</p>
          </div>
          <Link to="/?status=student-organized#discover" className="text-link">
            See what’s going on <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="around-grid">
          {events
            .filter((e) => e.officialStatus === "student-organized")
            .slice(0, 3)
            .map((e) => (
              <EventCard key={e.id} event={e} compact />
            ))}
        </div>
        <div className="around-bottom">
          <span>Pickup games. Study groups. Your kind of people.</span>
          <Link to="/submit">
            Make a plan. Put it here. <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
