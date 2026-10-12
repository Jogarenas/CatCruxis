import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link to="/" className="brand-link" aria-label="Back to CatCruxis">
            <Logo />
          </Link>
          <p>One campus. Every event.</p>
        </div>
        <Link className="footer-cta" to="/submit">
          Something happening?
          <br />
          Let campus in on it. <ArrowUpRight />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>Made for Davidson. Made for you.</span>
        <span>Frontend demo · All events are fictional.</span>
        <span>THE CC © 2026</span>
      </div>
    </footer>
  );
}
