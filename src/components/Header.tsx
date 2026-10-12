import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SearchDialog } from "./SearchDialog";
const links = [
  { to: "/", label: "Discover" },
  { to: "/this-week", label: "This Week" },
  { to: "/categories", label: "Categories" },
  { to: "/organizations", label: "Organizations" },
];
export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  useEffect(() => {
    menu.current?.close();
  }, [location.pathname]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="CatCruxis home">
          CatCruxis
          <span className="brand-star" aria-hidden="true">
            ✳
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink to={link.to} end={link.to === "/"} key={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="search-trigger"
            aria-label="Search campus events (Command or Control K)"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} />
          </button>
          <Link to="/submit" className="submit-nav">
            Submit Event <ArrowUpRight size={17} />
          </Link>
          <button
            className="menu-trigger"
            aria-label="Open navigation"
            onClick={() => menu.current?.showModal()}
          >
            <Menu />
          </button>
        </div>
      </header>
      <dialog aria-label="Campus navigation" className="mobile-menu" ref={menu}>
        <div className="dialog-heading">
          <span className="wordmark">
            The CC
            <span className="brand-star" aria-hidden="true">
              ✳
            </span>
          </span>
          <button
            className="circle-button"
            aria-label="Close navigation"
            onClick={() => menu.current?.close()}
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <NavLink to={link.to} key={link.to}>
              {link.label}
              <ArrowUpRight />
            </NavLink>
          ))}
          <Link to="/submit">
            Submit Event
            <ArrowUpRight />
          </Link>
        </nav>
        <p>One campus. Every event.</p>
      </dialog>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
