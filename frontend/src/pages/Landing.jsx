import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import StatPill from "../components/StatPill";
import { useAuth } from "../auth/AuthContext";

export default function Landing() {
  const nav = useNavigate();
  const { isAuthed, user } = useAuth();

  return (
    <div className="app">
      <Navbar />

      <main className="wrap hero">
        <section className="hero__left">
          <div className="badge">✨ Agentic AI • Buyer ↔ Seller • Fair deals</div>
          <h1 className="h1">Negotiate your next product price — automatically 🤝</h1>
          <p className="p">
            Tell ANA your budget and product. Buyer Agent finds deals, negotiates with Seller Agent,
            and brings you a fair outcome with full transparency.
          </p>

          {isAuthed ? (
            <div className="row">
              <Button variant="primary" onClick={() => nav("/search")}>
                🚀 Continue as {user?.role}
              </Button>
              <Button variant="ghost" onClick={() => nav("/history")}>
                🧾 My History
              </Button>
            </div>
          ) : (
            <div className="row">
              <Button variant="primary" onClick={() => nav("/login")}>🔐 Login</Button>
              <Button variant="ghost" onClick={() => nav("/signup")}>✨ Sign up</Button>
            </div>
          )}

          <div className="stats">
            <StatPill icon="⚡" title="Fast" subtitle="Multi-round negotiation in seconds" />
            <StatPill icon="🧠" title="Smart" subtitle="Budget + constraints aware offers" />
            <StatPill icon="⚖️" title="Fair" subtitle="Transparent rounds + audit trail" />
          </div>
        </section>

        <section className="hero__right">
          <div className="card card--glow">
            <div className="card__head">
              <div className="pill">💬 Live preview</div>
              <div className="pill pill--muted">Backend auth ready</div>
            </div>

            <div className="preview">
              <div className="preview__row"><span>Buyer:</span> Searches product + budget</div>
              <div className="preview__row"><span>System:</span> Finds best deals</div>
              <div className="preview__row"><span>Seller:</span> Negotiates fair counter offer</div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}