import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import DealCard from "../components/DealCard";
import EmptyState from "../components/EmptyState";
import { api } from "../services/api";

export default function DealSearch() {
  const nav = useNavigate();
  const [brand, setBrand] = useState("ABC");
  const [model, setModel] = useState("ABC Phone X");
  const [budget, setBudget] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [err, setErr] = useState("");

  async function findDeals() {
    try {
      setErr("");
      setLoading(true);
      const data = await api.searchDeals(brand, model, Number(budget));
      setDeals(data);
    } catch (e) {
      setErr(e.message || "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }

  function selectDeal(deal) {
    sessionStorage.setItem("ana_selected_deal", JSON.stringify({ deal, brand, model, budget: Number(budget) }));
    nav("/deal");
  }

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🔎 Find deals near your budget</h2>
          <div className="muted">Mock deals for now (web scraping later)</div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="field">
              <label>Brand</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="field">
              <label>Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="field">
              <label>Budget (₹)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>

            <div className="row">
              <Button variant="primary" onClick={findDeals} disabled={loading}>
                {loading ? "⏳ Searching..." : "✨ Find Deals"}
              </Button>
              <Button variant="ghost" onClick={() => nav("/")}>⬅️ Back</Button>
            </div>

            {err ? <div className="error">⚠️ {err}</div> : null}
          </div>

          <div className="stack">
            {deals.length === 0 ? (
              <EmptyState
                title="📦 No deals yet"
                subtitle="Enter brand/model/budget and click “Find Deals”"
              />
            ) : (
              deals.map((d) => <DealCard key={d.deal_id} deal={d} onSelect={selectDeal} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}