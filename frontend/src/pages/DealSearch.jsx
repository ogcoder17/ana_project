import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { api } from "../services/api";

export default function DealSearch() {
  const nav = useNavigate();
  const [query, setQuery] = useState("Iphone");
  const [budget, setBudget] = useState(60000);
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [err, setErr] = useState("");

  async function findDeals() {
    try {
      setErr("");
      setLoading(true);

      const data = await api.post("/search-real-deals", {
        query,
        budget: Number(budget),
        limit: 12,
      });

      setDeals(data);
    } catch (e) {
      setErr(e.message || "Failed to fetch real deals");
    } finally {
      setLoading(false);
    }
  }

  function selectDeal(deal) {
    sessionStorage.setItem(
      "ana_selected_deal",
      JSON.stringify({
        deal,
        budget: Number(budget),
      })
    );
    nav("/deal");
  }

  return (
    <div className="app">
      <Navbar />

      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🔎 Search real e-commerce deals</h2>
          <div className="muted">Live product search</div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="field">
              <label>What are you looking for?</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. iphone 13, nike shoes, laptop, tv"
              />
            </div>

            <div className="field">
              <label>Budget (optional)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="row">
              <Button variant="primary" onClick={findDeals} disabled={loading}>
                {loading ? "⏳ Searching..." : "✨ Find Real Deals"}
              </Button>
              <Button variant="ghost" onClick={() => nav("/")}>
                ⬅️ Back
              </Button>
            </div>

            {err ? <div className="error">⚠️ {err}</div> : null}
          </div>

          <div className="stack">
            {deals.length === 0 ? (
              <EmptyState
                title="🛒 No real deals yet"
                subtitle="Try a broader keyword like phone, shoes, laptop, or perfume."
              />
            ) : (
              deals.map((d) => (
                <div key={d.deal_id} className="card card--deal">
                  <div className="deal__top">
                    <div className="deal__title">🛍️ {d.title}</div>
                    <div className="pill">{d.source.toUpperCase()}</div>
                  </div>

                  <div className="deal__priceRow">
                    <div className="deal__price">
                      {d.currency} {d.price}
                    </div>
                    <div className="deal__meta">{d.highlights}</div>
                  </div>

                  {d.image_url ? (
                    <img
                      src={d.image_url}
                      alt={d.title}
                      style={{
                        width: "100%",
                        maxHeight: 220,
                        objectFit: "contain",
                        marginTop: 12,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        padding: 10,
                      }}
                    />
                  ) : null}

                  <div className="deal__actions">
                    <a className="link" href={d.url} target="_blank" rel="noreferrer">
                      🔗 View listing
                    </a>
                    <Button variant="primary" onClick={() => selectDeal(d)}>
                      ✅ Select
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}