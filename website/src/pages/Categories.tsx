import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { categories } from "../data/categories";
import { useEvents } from "../lib/EventContext";
import { filterEvents } from "../lib/events";
import { CategoryCard } from "../components/CategoryCard";
import { EventGrid } from "../components/EventCard";
export function Categories() {
  const { category } = useParams();
  const { events } = useEvents();
  const current = categories.find((c) => c.slug === category);
  if (category && !current)
    return (
      <section className="section empty-state">
        <h1>Interest not found.</h1>
        <Link to="/categories" className="text-link">
          Explore all interests <ArrowLeft size={17} />
        </Link>
      </section>
    );
  return (
    <section className="section categories-page">
      <div className="page-intro">
        {current && (
          <Link to="/categories" className="text-link">
            <ArrowLeft size={17} />
            All interests
          </Link>
        )}
        <span className="eyebrow red-text">Follow your curiosity</span>
        <h1>
          {current ? (
            current.name
          ) : (
            <>
              Find your
              <br />
              kind of thing<span className="red-text">.</span>
            </>
          )}
        </h1>
        <p>
          {current
            ? "A new idea. A familiar passion. A reason to show up."
            : "There’s more to campus than your usual routine."}
        </p>
      </div>
      {current ? (
        <EventGrid events={filterEvents(events, { category })} />
      ) : (
        <div className="category-grid full-category-grid">
          {categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              count={
                events.filter((e) =>
                  e.categories.some((cat) => cat.id === c.id),
                ).length
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
