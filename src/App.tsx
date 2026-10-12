import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { EventProvider, useEvents } from "./lib/EventContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { EventDetail } from "./pages/EventDetail";
import { ThisWeek } from "./pages/ThisWeek";
import { Categories } from "./pages/Categories";
import { Organizations } from "./pages/Organizations";
import { SubmitEvent } from "./pages/SubmitEvent";
function ScrollManager() {
  const { pathname, hash, search } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document.querySelector(hash)?.scrollIntoView({ behavior: "instant" }),
      );
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, hash]);
  useEffect(() => {
    const labels: Record<string, string> = {
      "/": "Discover",
      "/this-week": "This Week",
      "/categories": "Explore by Interest",
      "/organizations": "Organizations",
      "/submit": "Submit Event",
    };
    document.title = `${labels[pathname] || "Event Guide"} — CatCruxis`;
  }, [pathname, search]);
  return null;
}
function Content() {
  const { loading, error } = useEvents();
  if (loading)
    return (
      <div className="section loading-state" role="status">
        Opening up campus…
      </div>
    );
  if (error)
    return (
      <div className="section empty-state" role="alert">
        <h1>Something got in the way.</h1>
        <p>{error}</p>
      </div>
    );
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/this-week" element={<ThisWeek />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:category" element={<Categories />} />
      <Route path="/organizations" element={<Organizations />} />
      <Route path="/submit" element={<SubmitEvent />} />
      <Route
        path="*"
        element={
          <section className="section empty-state">
            <h1>A little off campus?</h1>
            <p>We couldn’t find that page.</p>
            <Link className="button red" to="/">
              Back to discovery
            </Link>
          </section>
        }
      />
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <EventProvider>
        <ScrollManager />
        <Header />
        <main id="main" className="min-h-[60vh] antialiased">
          <Content />
        </main>
        <Footer />
      </EventProvider>
    </BrowserRouter>
  );
}
