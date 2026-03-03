import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import StatPill from "../components/StatPill";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="app">
      <Navbar />

      <main className="wrap hero">
        <section className="hero__left">
          <div className="badge">✨ Agentic AI • Buyer ↔ Seller • Fair deals</div>
          <h1 className="h1">
            ANA - Autonomous Negotiation Agent 🤝
          </h1>
          <h4>Negotiate your next price automatically </h4>
          <p className="p">
            Tell ANA your budget and model. Buyer Agent finds deals (mock for now),
            negotiates with Seller Agent, and brings you the best fair price — you approve every step ✅.
          </p>

          <div className="row">
            <Button variant="primary" onClick={() => nav("/search")}>🚀 Start</Button>
            <Button variant="ghost" onClick={() => nav("/history")}>🧾 View History</Button>
          </div>

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
              <div className="pill pill--muted">Mock deals</div>
            </div>

            <div className="preview">
              <div className="preview__row"><span>Buyer Agent:</span> “Budget ₹15,000 for ABC Phone X 📱”</div>
              <div className="preview__row"><span>System:</span> “Found 8 deals near your budget 🔎”</div>
              <div className="preview__row"><span>Seller Agent:</span> “Offer ₹15,900 with warranty ✅”</div>
              <div className="preview__row"><span>Buyer Agent:</span> “Counter ₹14,700 🙂”</div>
            </div>
            <br>
            </br>

            <div className="row">
              <Button variant="success" size="sm">✅ Accept</Button>
              <Button variant="ghost" size="sm">🔁 Counter</Button>
              <Button variant="danger" size="sm">❌ Cancel</Button>
            </div>
          </div>

          <div className="hint">Tip: Clear budget + must-haves = better negotiation 🎯</div>
        </section>
      </main>
    </div>
  );
}