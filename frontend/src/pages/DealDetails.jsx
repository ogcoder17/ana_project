import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

export default function DealDetails() {
  const nav = useNavigate();
  const stored = sessionStorage.getItem("ana_selected_deal");

  const data = useMemo(() => {
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  }, [stored]);

  if (!data) {
    return (
      <div className="app">
        <Navbar />
        <main className="wrap">
          <div className="empty">
            <div className="empty__t">😅 No deal selected</div>
            <div className="empty__s">Go back and select a deal first.</div>
            <div className="row" style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => nav("/search")}>🔎 Go to Search</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { deal, budget } = data;

  function start() {
    sessionStorage.setItem("ana_deal_for_negotiation", JSON.stringify({ deal, budget }));
    nav("/negotiate");
  }

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🧾 Deal details</h2>
          <div className="muted">Review before starting negotiation</div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="dealBig__title">📱 {deal.brand} • {deal.model}</div>
            <div className="dealBig__seller">🛍️ Seller: <b>{deal.seller}</b></div>

            <div className="dealBig__price">₹{deal.price}</div>
            <div className="muted">Your budget: ₹{budget} 💰</div>

            <div className="pillRow">
              <div className="pill">✅ {deal.highlights}</div>
              <div className="pill pill--muted">🚚 Est. delivery: 2–5 days</div>
              <div className="pill pill--muted">↩️ Return: 7 days</div>
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <a className="link" href={deal.url} target="_blank" rel="noreferrer">🔗 Open link</a>
              <Button variant="primary" onClick={start}>🤝 Start Negotiation</Button>
            </div>
          </div>

          <div className="card">
            <div className="h3">✨ Suggested negotiation strategy</div>
            <ul className="list">
              <li>Start slightly below budget 😌</li>
              <li>Counter in small steps (₹200–₹500) 🔁</li>
              <li>Stop if seller exceeds budget 🚫</li>
              <li>Accept if price is fair + within budget ✅</li>
            </ul>

            <div className="row">
              <Button variant="ghost" onClick={() => nav("/search")}>⬅️ Change deal</Button>
              <Button variant="ghost" onClick={() => nav("/history")}>🧾 History</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}