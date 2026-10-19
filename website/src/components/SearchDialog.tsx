import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "../lib/EventContext";
import { filterEvents } from "../lib/events";
import { eventDate } from "../lib/format";
export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const { events } = useEvents();
  useEffect(() => {
    if (open && !dialog.current?.open) {
      setQuery("");
      dialog.current?.showModal();
    } else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  const results = filterEvents(events, { search: query });
  return (
    <dialog
      aria-label="Search campus events"
      className="search-dialog"
      ref={dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="dialog-heading">
        <span className="eyebrow">Your campus, at your fingertips</span>
        <button
          className="circle-button"
          onClick={onClose}
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </div>
      <label className="global-search">
        <Search size={26} />
        <input
          autoFocus
          aria-label="Search all campus events"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
        />
      </label>
      <div className="search-caption" aria-live="polite">
        {query
          ? `${results.length} matching events`
          : "A few things you might like"}
        <span>ESC to close</span>
      </div>
      <div className="search-results">
        {results.slice(0, 8).map((event) => (
          <Link to={`/events/${event.id}`} key={event.id} onClick={onClose}>
            <img src={event.image} alt="" />
            <div>
              <h3>{event.title}</h3>
              <p>
                {eventDate(event.startDateTime)} · {event.location.name}
              </p>
            </div>
            <ArrowUpRight size={19} />
          </Link>
        ))}
        {!results.length && (
          <div className="empty-state">
            <h3>No matches yet.</h3>
            <p>Try a topic, organizer, or campus location.</p>
          </div>
        )}
      </div>
    </dialog>
  );
}
