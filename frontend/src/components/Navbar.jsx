import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const loc = useLocation();
  const active = (p) => (loc.pathname === p ? "nav__link nav__link--active" : "nav__link");

  return (
    <header className="nav">
      <div className="nav__brand">
        <div className="nav__logo">🤝</div>
        <div>
          <div className="nav__name">ANA</div>
          <div className="nav__tag">Autonomous Negotiation Agent</div>
        </div>
      </div>

      <nav className="nav__links">
        <Link className={active("/")} to="/">🏠 Home</Link>
        <Link className={active("/search")} to="/search">🔎 Search</Link>
        <Link className={active("/history")} to="/history">🧾 History</Link>
      </nav>
    </header>
  );
}