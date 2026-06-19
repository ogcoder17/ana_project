import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { api } from "../services/api";

export default function DealDetails() {
  const nav = useNavigate();
  const stored = sessionStorage.getItem("ana_selected_deal");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [startingOffer, setStartingOffer] = useState("");

  const data = useMemo(() => {
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
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
              <Button variant="primary" onClick={() => nav("/search")}>
                🔎 Go to Search
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { deal, budget } = data;

  async function startNegotiation() {
    try {
      setErr("");
      setSaving(true);

      const saveRes = await api.post("/products/save-offer", {
        title: deal.title,
        category: deal.category || "General",
        brand: deal.brand || null,
        model: deal.model || null,
        seller_user_id: deal.seller_user_id || null,
        source_name: deal.source || "dummyjson",
        source_product_id: deal.deal_id,
        seller_name: deal.seller,
        listed_price: Number(deal.price),
        currency: deal.currency,
        product_url: deal.url,
        image_url: deal.image_url,
        stock_status: deal.stock_status || null,
        condition: deal.condition || null,
        shipping: deal.shipping || null,
        highlights: deal.highlights || null,
      });

      sessionStorage.setItem(
        "ana_deal_for_negotiation",
        JSON.stringify({
          deal,
          budget,
          product_offer_id: saveRes.product_offer_id,
          starting_offer: startingOffer ? Number(startingOffer) : null,
        })
      );

      nav("/negotiate");
    } catch (e) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🧾 Deal details</h2>
          <div className="muted">Live product listing</div>
        </div>

        

        <div className="grid2">
          <div className="card">
            <div className="dealBig__title">🛍️ {deal.title}</div>
            <div className="dealBig__seller">🏪 Seller: <b>{deal.seller}</b></div>

            <div className="dealBig__price">₹{deal.price}</div>
            <div className="muted">Your budget: ₹{budget}</div>

            <div className="field">
              <label>Your Starting Offer (₹)</label>
              <input
                type="number"
                value={startingOffer}
                onChange={(e) => setStartingOffer(e.target.value)}
                placeholder="Enter amount to start negotiation"
              />
            </div>

            <div className="pillRow">
              {deal.condition ? <div className="pill">📦 {deal.condition}</div> : null}
              {deal.shipping ? <div className="pill">🚚 {deal.shipping}</div> : null}
              <div className="pill pill--muted">🌐 Source: {deal.source}</div>
            </div>

            {deal.image_url ? (
              <img
                src={deal.image_url}
                alt={deal.title}
                style={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "contain",
                  marginTop: 16,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  padding: 12,
                }}
              />
            ) : null}

            {err ? <div className="error" style={{ marginTop: 14 }}>⚠️ {err}</div> : null}

            <div className="row" style={{ marginTop: 16 }}>
              <a className="nav__link nav__link--pill" href={deal.url} target="_blank" rel="noreferrer">
                🔗 Open listing
              </a>
              <Button variant="primary" onClick={startNegotiation} disabled={saving}>
                {saving ? "⏳ Starting..." : "🤖 Start Auto Negotiation"}
              </Button>
            </div>
          </div>

          <div className="card">
            <div className="h3">✨ Deal highlights</div>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              {deal.highlights || "No highlights available."}
            </p>

            <div className="row" style={{ marginTop: 18 }}>
              <Button variant="ghost" onClick={() => nav("/search")}>
                ⬅️ Change Deal
              </Button>
              <Button variant="ghost" onClick={() => nav("/history")}>
                🧾 History
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}