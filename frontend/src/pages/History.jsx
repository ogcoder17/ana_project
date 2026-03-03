import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { clearHistory, loadHistory } from "../store/history";

export default function History() {
  const [tick, setTick] = useState(0);
  const items = useMemo(() => loadHistory(), [tick]);

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🧾 Negotiation history</h2>
          <div className="muted">Saved locally in your browser (demo)</div>
        </div>

        <div className="row" style={{ marginBottom: 12 }}>
          <Button variant="danger" onClick={() => { clearHistory(); setTick((t) => t + 1); }}>
            🧹 Clear history
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState title="🕊️ No history yet" subtitle="Complete a negotiation to see it here." />
        ) : (
          <div className="stack">
            {items.map((it) => (
              <div className="card" key={it.session_id}>
                <div className="deal__top">
                  <div className="deal__title">📱 {it.brand} • {it.model}</div>
                  <div className="pill">🧾 {it.status}</div>
                </div>

                <div className="deal__priceRow">
                  <div className="muted">Seller: <b>{it.seller}</b></div>
                  <div className="muted">Listed: ₹{it.listed_price} • Agreed: {it.agreed_price ? `₹${it.agreed_price}` : "—"}</div>
                </div>

                <div className="muted">🕒 {new Date(it.at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}