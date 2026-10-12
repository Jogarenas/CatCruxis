import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link to="/" className="wordmark">
            CatCruxis
            <span className="brand-star" aria-hidden="true">
              ✳
            </span>
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
