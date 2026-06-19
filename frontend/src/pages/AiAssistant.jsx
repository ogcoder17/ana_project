import { useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { api } from "../services/api";

export default function AiAssistant() {
  const [listedPrice, setListedPrice] = useState(50000);
  const [budget, setBudget] = useState(45000);
  const [buyerStrategy, setBuyerStrategy] = useState("balanced");
  const [sellerStrategy, setSellerStrategy] = useState("balanced");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  async function generate() {
    try {
      setErr("");
      const res = await api.post("/ai/strategy", {
        listed_price: Number(listedPrice),
        budget: Number(budget),
        buyer_strategy: buyerStrategy,
        seller_strategy: sellerStrategy,
      });
      setResult(res);
    } catch (e) {
      setErr(e.message || "AI assistant failed");
    }
  }

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🧠 AI Assistant</h2>
          <div className="muted">Generate buyer and seller strategies</div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="field">
              <label>Listed Price (₹)</label>
              <input value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} />
            </div>

            <div className="field">
              <label>Your Budget (₹)</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>

            <div className="field">
              <label>Buyer Strategy</label>
              <select value={buyerStrategy} onChange={(e) => setBuyerStrategy(e.target.value)}>
                <option value="aggressive">Aggressive</option>
                <option value="balanced">Balanced</option>
                <option value="conservative">Conservative</option>
              </select>
            </div>

            <div className="field">
              <label>Seller Strategy</label>
              <select value={sellerStrategy} onChange={(e) => setSellerStrategy(e.target.value)}>
                <option value="strict">Strict</option>
                <option value="balanced">Balanced</option>
                <option value="discount-heavy">Discount-heavy</option>
              </select>
            </div>

            {err ? <div className="error">⚠️ {err}</div> : null}

            <Button variant="primary" onClick={generate}>
              ✨ Generate Strategy
            </Button>
          </div>

          <div className="card">
            <div className="h3">Generated Output</div>
            {!result ? (
              <div className="muted">No output yet. Generate a strategy.</div>
            ) : (
              <div className="transcript">
                <div className="roundCard">
                  <div className="roundCard__head">
                    <div className="roundPill">Buyer Strategy</div>
                  </div>
                  <div className="summaryRow"><span>Strategy</span><b>{result.buyer.strategy}</b></div>
                  <div className="summaryRow"><span>First Offer</span><b>₹{result.buyer.first_offer}</b></div>
                  <div className="summaryRow"><span>Concession Step</span><b>₹{result.buyer.concession_step}</b></div>
                  <div className="summaryRow"><span>Tone</span><b>{result.buyer.tone}</b></div>
                </div>

                <div className="roundCard">
                  <div className="roundCard__head">
                    <div className="roundPill">Seller Strategy</div>
                  </div>
                  <div className="summaryRow"><span>Strategy</span><b>{result.seller.strategy}</b></div>
                  <div className="summaryRow"><span>Floor Price</span><b>₹{result.seller.floor_price}</b></div>
                  <div className="summaryRow"><span>Concession Step</span><b>₹{result.seller.concession_step}</b></div>
                  <div className="summaryRow"><span>Tone</span><b>{result.seller.tone}</b></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}