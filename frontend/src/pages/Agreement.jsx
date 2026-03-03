import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

export default function Agreement() {
  const nav = useNavigate();
  const stored = sessionStorage.getItem("ana_last_result");

  const data = useMemo(() => {
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  }, [stored]);

  if (!data) {
    return (
      <div className="app">
        <Navbar />
        <main className="wrap">
          <div className="empty">
            <div className="empty__t">📭 No recent negotiation</div>
            <div className="empty__s">Start a new negotiation from Search.</div>
            <div className="row" style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => nav("/search")}>🔎 Search Deals</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { deal, budget, result } = data;
  const listed = result.listed_price;
  const agreed = result.agreed_price;
  const savings = agreed ? (listed - agreed) : 0;

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🎉 Result</h2>
          <div className="muted">{deal.brand} • {deal.model} • {deal.seller}</div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="h3">🧾 Summary</div>
            <div className="summaryRow"><span>Budget</span><b>₹{budget}</b></div>
            <div className="summaryRow"><span>Listed price</span><b>₹{listed}</b></div>
            <div className="summaryRow"><span>Status</span><b>{result.status}</b></div>

            {result.status === "AGREED" ? (
              <>
                <div className="summaryRow"><span>Agreed price</span><b>₹{agreed}</b></div>
                <div className="pillRow" style={{ marginTop: 10 }}>
                  <div className="pill">💰 Savings: ₹{savings}</div>
                  <div className="pill pill--muted">✅ Ready to proceed</div>
                </div>
              </>
            ) : (
              <div className="pillRow" style={{ marginTop: 10 }}>
                <div className="pill pill--muted">🤝 Try another deal or adjust counter steps</div>
              </div>
            )}

            <div className="row" style={{ marginTop: 14 }}>
              <Button variant="primary" onClick={() => nav("/search")}>🔁 New negotiation</Button>
              <Button variant="ghost" onClick={() => nav("/history")}>🧾 History</Button>
            </div>
          </div>

 <div className="card">
  <div className="h3">🗂️ Transcript (Rounds)</div>

  <div className="transcript">
    {result.rounds?.map((r) => {
      const accepted = r.seller_action === "ACCEPT";
      const sellerLabel = accepted ? "accepted ✅" : "countered 🔁";

      return (
        <div key={r.round_no} className={`roundCard ${accepted ? "roundCard--accepted" : ""}`}>
          <div className="roundCard__head">
            <div className="roundPill">Round {r.round_no}</div>
            <div className={`roundStatus ${accepted ? "roundStatus--ok" : "roundStatus--mid"}`}>
              {accepted ? "AGREED ✅" : "Counter 💬"}
            </div>
          </div>

          <div className="roundCard__note">
            📝 {r.note || "Negotiation step"}
          </div>

          <div className="offerLine offerLine--buyer">
            <div className="offerLine__left">
              <span className="offerAvatar">👤</span>
              <span className="offerText">Buyer offered</span>
            </div>
            <div className="offerPrice">₹{r.buyer_offer}</div>
          </div>

          <div className="divider" />

          <div className="offerLine offerLine--seller">
            <div className="offerLine__left">
              <span className="offerAvatar">🏪</span>
              <span className="offerText">Seller {sellerLabel}</span>
            </div>
            <div className="offerPrice">₹{r.seller_offer}</div>
          </div>
        </div>
      );
    })}
  </div>

  {!result.rounds?.length ? (
    <div className="empty" style={{ marginTop: 12 }}>
      <div className="empty__t">No rounds found</div>
      <div className="empty__s">Try negotiating again to generate a transcript.</div>
    </div>
  ) : null}
</div>
        </div>
      </main>
    </div>
  );
}