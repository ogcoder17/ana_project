import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function SellerHistory() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setErr("");
      const data = await api.get("/seller/history");
      setItems(data || []);
    } catch (e) {
      setErr(e?.message || e?.detail || "Failed to load seller history");
    }
  }

  const prettyStatus = (item) => {
    if (item.status === "APPROVED") return "✅ Fully Approved";
    if (item.status === "PENDING_APPROVALS") {
      if (item.buyer_approved && !item.seller_approved) return "🕒 Waiting for Seller Approval";
      if (!item.buyer_approved && item.seller_approved) return "🕒 Waiting for Buyer Approval";
      return "🤝 Waiting for Both Approvals";
    }
    if (item.status === "CANCELLED") return "❌ Cancelled";
    if (item.status === "FAILED") return "⚠️ Negotiation Failed";
    return item.status;
  };

  return (
    <div className="app">
      <Navbar />

      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🧾 Seller negotiation history</h2>
          <div className="muted">Your completed and pending deals</div>
        </div>

        {err ? <div className="error">⚠️ {err}</div> : null}

        {!items.length && !err ? (
          <div className="empty">
            <div className="empty__t">📭 No seller history yet</div>
            <div className="empty__s">Negotiations on your listed products will appear here.</div>
          </div>
        ) : (
          <div className="stack">
            {items.map((item) => (
              <div key={item.negotiation_id} className="card">
                <div className="rowBetween" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="h3" style={{ marginBottom: 6 }}>{item.product_title}</div>
                    <div className="muted">Buyer: {item.buyer_name}</div>
                  </div>
                  <div className="pill">{prettyStatus(item)}</div>
                </div>

                <div className="summaryRow">
                  <span>Listed price</span>
                  <b>₹{item.listed_price}</b>
                </div>

                <div className="summaryRow">
                  <span>Final price</span>
                  <b>{item.final_price != null ? `₹${item.final_price}` : "--"}</b>
                </div>

                <div className="summaryRow">
                  <span>Buyer approval</span>
                  <b>{item.buyer_approved ? "Approved" : "Pending"}</b>
                </div>

                <div className="summaryRow">
                  <span>Your approval</span>
                  <b>{item.seller_approved ? "Approved" : "Pending"}</b>
                </div>

                <div className="summaryRow">
                  <span>Started at</span>
                  <b>{item.started_at ? new Date(item.started_at).toLocaleString() : "--"}</b>
                </div>

                {item.status === "APPROVED" && item.contact ? (
                  <details className="miniContact">
                    <summary>📧 Contact Buyer</summary>

                    <div className="miniContactBox">
                      <div><b>{item.contact.name || "--"}</b></div>
                      <div>
                        {item.contact.email ? (
                          <a href={`mailto:${item.contact.email}`} className="miniContactLink">
                            {item.contact.email}
                          </a>
                        ) : (
                          "--"
                        )}
                      </div>
                    </div>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}