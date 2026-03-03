import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import { api } from "../services/api";
import { saveToHistory } from "../store/history";

export default function Negotiation() {
  const nav = useNavigate();
  const stored = sessionStorage.getItem("ana_deal_for_negotiation");

  const base = useMemo(() => {
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  }, [stored]);

  const [sessionId, setSessionId] = useState(null);
  const [state, setState] = useState(null);
  const [counter, setCounter] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!base) return;
    const { deal, budget } = base;
    setCounter(Math.min(budget, deal.price));

    (async () => {
      try {
        setErr("");
        setBusy(true);
        const res = await api.startNegotiation({
          deal_id: deal.deal_id,
          brand: deal.brand,
          model: deal.model,
          seller: deal.seller,
          listed_price: deal.price,
          budget: Number(budget),
        });
        setSessionId(res.session_id);
        setState(res);
      } catch (e) {
        setErr(e.message);
      } finally {
        setBusy(false);
      }
    })();
  }, [base]);

  if (!base) {
    return (
      <div className="app">
        <Navbar />
        <main className="wrap">
          <div className="empty">
            <div className="empty__t">😅 No deal selected</div>
            <div className="empty__s">Select a deal first.</div>
            <div className="row" style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => nav("/search")}>🔎 Go to Search</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { deal, budget } = base;

  async function step(action, price) {
    if (!sessionId) return;
    try {
      setErr("");
      setBusy(true);
      const res = await api.negotiateStep(sessionId, action, price);
      setState(res);

      if (res.status !== "IN_PROGRESS") {
        saveToHistory({
          at: new Date().toISOString(),
          session_id: res.session_id,
          brand: deal.brand,
          model: deal.model,
          seller: deal.seller,
          listed_price: res.listed_price,
          agreed_price: res.agreed_price,
          status: res.status,
        });
        sessionStorage.setItem("ana_last_result", JSON.stringify({ deal, budget, result: res }));
        nav("/agreement");
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const rounds = state?.rounds || [];
  const lastSellerOffer = state?.last_seller_offer;

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">💬 Negotiation chat</h2>
          <div className="muted">
            Budget ₹{budget} • Listed ₹{deal.price} • Seller {deal.seller}
          </div>
        </div>

        <div className="card chatCard">
          <div className="chat">
            <ChatBubble
              side="system"
              text={`🔎 Negotiating for ${deal.brand} ${deal.model} • Budget ₹${budget}`}
            />

            {rounds.map((r) => (
              <div key={r.round_no}>
                <ChatBubble
                  side="buyer"
                  text={`Buyer Agent: Counter ₹${r.buyer_offer} 🙂`}
                  meta={`Round ${r.round_no}`}
                />
                <ChatBubble
                  side="seller"
                  text={`Seller Agent: ${r.seller_action === "ACCEPT" ? "✅ Accept" : "🔁 Counter"} ₹${r.seller_offer}`}
                  meta={`Seller • ${r.note}`}
                />
              </div>
            ))}

            {state?.status === "IN_PROGRESS" ? (
              <ChatBubble
                side="system"
                text={`Current seller offer: ₹${lastSellerOffer} — choose: ✅ Accept, 🔁 Counter, ❌ Cancel`}
              />
            ) : null}
          </div>

          {err ? <div className="error">⚠️ {err}</div> : null}

          <div className="chatActions">
            <Button variant="success" disabled={busy || !state || state.status !== "IN_PROGRESS"} onClick={() => step("ACCEPT")}>
              ✅ Accept (₹{lastSellerOffer ?? "--"})
            </Button>

            <div className="counterBox">
              <label>Your counter (₹)</label>
              <input
                type="number"
                value={counter}
                onChange={(e) => setCounter(Number(e.target.value))}
                min={1}
              />
              <Button variant="ghost" disabled={busy || !state || state.status !== "IN_PROGRESS"} onClick={() => step("COUNTER", counter)}>
                🔁 Send Counter
              </Button>
            </div>

            <Button variant="danger" disabled={busy || !state || state.status !== "IN_PROGRESS"} onClick={() => step("CANCEL")}>
              ❌ Cancel
            </Button>
          </div>

          {busy ? <div className="muted" style={{ padding: "0 14px 14px" }}>⏳ Talking to agents…</div> : null}
        </div>
      </main>
    </div>
  );
}