import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "./Button";
import { useAuth } from "../auth/AuthContext";
import { api } from "../services/api";

export default function Navbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const { isAuthed, user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  const active = (path) =>
    loc.pathname === path ? "nav__link nav__link--active" : "nav__link";

  useEffect(() => {
    if (!isAuthed || !user?.role) return;

    let stopped = false;

    async function loadNotifications() {
      try {
        if (user.role === "buyer") {
          const history = await api.get("/db-negotiations/history");
          if (stopped) return;
          const count = (history || []).filter(
            (h) => h.status === "PENDING_APPROVALS" && !h.buyer_approved
          ).length;
          setNotifCount(count);
        } else if (user.role === "seller") {
          const dashboard = await api.get("/seller/dashboard");
          if (stopped) return;
          const count = (dashboard.pending_approvals || []).filter(
            (n) => !n.seller_approved
          ).length;
          setNotifCount(count);
        } else {
          setNotifCount(0);
        }
      } catch {
        if (!stopped) setNotifCount(0);
      }
    }

    loadNotifications();
    const t = setInterval(loadNotifications, 10000);

    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [isAuthed, user?.role]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("ana_selected_deal");
    sessionStorage.removeItem("ana_deal_for_negotiation");
    sessionStorage.removeItem("ana_last_result");
    nav("/");
  };

  const NotificationBadge = () =>
    notifCount > 0 ? <span className="nav__notif">{notifCount}</span> : null;

  return (
    <header className="nav">
      <div className="nav__brand" onClick={() => nav("/")} style={{ cursor: "pointer" }}>
        <div className="nav__logo">🤝</div>
        <div>
          <div className="nav__name">ANA</div>
          <div className="nav__tag">Autonomous Negotiation Agent</div>
        </div>
      </div>

      <nav className="nav__links">
        <Link className={active("/")} to="/">🏠 Home</Link>

        {isAuthed && user?.role === "buyer" && (
          <>
            <Link className={active("/search")} to="/search">🔎 Buy Products</Link>
            <Link className={active("/history")} to="/history">
              🧾 History <NotificationBadge />
            </Link>
            <Link className={active("/analytics")} to="/analytics">📊 Analytics</Link>
            {/* <Link className={active("/ai-assistant")} to="/ai-assistant">🧠 AI Assistant</Link> */}
          </>
        )}

        {isAuthed && user?.role === "seller" && (
          <>
            <Link className={active("/seller")} to="/seller">
              🏪 Seller Portal <NotificationBadge />
            </Link>
            <Link className={active("/seller-history")} to="/seller-history">
              🧾 History
            </Link>
            <Link className={active("/analytics")} to="/analytics">📊 Analytics</Link>
            {/* <Link className={active("/ai-assistant")} to="/ai-assistant">🧠 AI Assistant</Link> */}
          </>
        )}
      </nav>

      <div className="nav__right">
        {isAuthed ? (
          <>
            <div className="nav__user">
              👋 {user?.name}
              <span className="nav__roleBadge">{user?.role}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>🚪 Logout</Button>
          </>
        ) : (
          <div className="nav__authBtns">
            <Link to="/login" className="nav__link nav__link--pill">🔐 Login</Link>
            <Link to="/signup" className="nav__link nav__link--pill">✨ Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}