import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function Negotiation() {
  const nav = useNavigate();
  const stored = sessionStorage.getItem("ana_deal_for_negotiation");
  const hasStartedRef = useRef(false);


  const base = useMemo(() => {
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [stored]);

  const [err, setErr] = useState("");

  useEffect(() => {
    if (!base) return;
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;

    const { budget, product_offer_id, deal, starting_offer } = base;

    (async () => {
      try {
        const res = await api.post("/db-negotiations/start", {
          product_offer_id,
          budget: Number(budget),
          starting_offer: starting_offer ? Number(starting_offer) : null,
        });

        const payload = { deal, budget, result: res };

        localStorage.setItem("ana_last_result", JSON.stringify(payload));
        localStorage.setItem("ana_current_negotiation_id", String(res.negotiation_id));
        localStorage.setItem("ana_current_deal_meta", JSON.stringify({ deal, budget }));

        nav(`/agreement/${res.negotiation_id}`);
      } catch (e) {
        setErr(e?.message || "Start negotiation failed");
        hasStartedRef.current = false;
      }
    })();
  }, [base, nav]);

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🤖 Auto Negotiation In Progress</h2>
          <div className="muted">Buyer agent and seller agent are negotiating automatically</div>
        </div>

        <div className="card">
          {err ? (
            <div className="error">⚠️ {err}</div>
          ) : (
            <div className="empty">
              <div className="empty__t">⏳ Please wait...</div>
              <div className="empty__s">
                The agents are negotiating the best possible deal for you.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}