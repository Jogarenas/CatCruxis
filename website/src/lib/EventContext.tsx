import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CampusEvent } from "../data/types";
import { getEvents, addEvent } from "./events";
interface EventState {
  events: CampusEvent[];
  loading: boolean;
  error: string;
  submitEvent: (event: Omit<CampusEvent, "id">) => Promise<CampusEvent>;
}
const EventContext = createContext<EventState | null>(null);
export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getEvents()
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch(() => {
        if (active)
          setError("Events couldn’t load. Please refresh and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const submitEvent = async (event: Omit<CampusEvent, "id">) => {
    const created = await addEvent(event);
    setEvents((previous) => [...previous, created]);
    return created;
  };
  return (
    <EventContext.Provider value={{ events, loading, error, submitEvent }}>
      {children}
    </EventContext.Provider>
  );
}
export function useEvents() {
  const value = useContext(EventContext);
  if (!value) throw new Error("EventProvider is required");
  return value;
}
