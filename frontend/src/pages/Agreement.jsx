import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { api } from "../services/api";

export default function Agreement() {
  const nav = useNavigate();
  const { negotiationId } = useParams();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const stored = useMemo(() => {
    try {
      const raw = localStorage.getItem("ana_last_result");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const idFromStorage = localStorage.getItem("ana_current_negotiation_id");
    const finalId = negotiationId || idFromStorage || stored?.result?.negotiation_id;

    if (!finalId) {
      setData(stored || null);
      return;
    }

    loadNegotiation(finalId);
  }, [negotiationId]);

  async function loadNegotiation(id) {
    try {
      setErr("");

      const res = await api.get(`/db-negotiations/${id}`);

      const dealMetaRaw = localStorage.getItem("ana_current_deal_meta");
      const dealMeta = dealMetaRaw ? JSON.parse(dealMetaRaw) : null;

      const payload = {
        deal: dealMeta?.deal || stored?.deal || null,
        budget: dealMeta?.budget || stored?.budget || res.buyer_budget,
        result: res,
      };

      setData(payload);
      localStorage.setItem("ana_last_result", JSON.stringify(payload));
      localStorage.setItem("ana_current_negotiation_id", String(res.negotiation_id));
    } catch (e) {
      setErr(e?.message || "Failed to load approval");
    }
  }

  async function decide(action) {
    if (!data?.result?.negotiation_id) return;

    try {
      setBusy(true);
      setErr("");

      const res = await api.post(
        `/db-negotiations/${data.result.negotiation_id}/buyer-decision`,
        { action }
      );

      const updated = { ...data, result: res };
      setData(updated);
      localStorage.setItem("ana_last_result", JSON.stringify(updated));
      localStorage.setItem("ana_current_negotiation_id", String(res.negotiation_id));
    } catch (e) {
      setErr(e?.message || "Decision failed");
    } finally {
      setBusy(false);
    }
  }

  async function renegotiateAgain() {
    if (!data?.result?.negotiation_id) return;

    try {
      setBusy(true);
      setErr("");

      const res = await api.post(
        `/db-negotiations/${data.result.negotiation_id}/renegotiate`,
        {}
      );

      const updated = { ...data, result: res };
      setData(updated);
      localStorage.setItem("ana_last_result", JSON.stringify(updated));
      localStorage.setItem("ana_current_negotiation_id", String(res.negotiation_id));
    } catch (e) {
      setErr(e?.message || "Re-negotiation failed");
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className="app">
        <Navbar />
        <main className="wrap">
          <div className="empty">
            <div className="empty__t">📭 No active deal approval</div>
            <div className="empty__s">Open it again from History.</div>
            <div className="row" style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => nav("/history")}>
                🧾 Go to History
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { deal, budget, result } = data;

  const prettyStatus =
    result.status === "FAILED"
      ? "Negotiation did not conclude"
      : result.status;

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🤝 Deal Approval</h2>
          <div className="muted">
            {deal?.title || "Product"} • Seller {deal?.seller || "Seller"}
          </div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="h3">🧾 Summary</div>

            <div className="summaryRow"><span>Budget</span><b>₹{budget}</b></div>
            <div className="summaryRow"><span>Listed price</span><b>₹{result.listed_price}</b></div>
            <div className="summaryRow"><span>Negotiated price</span><b>₹{result.final_price ?? "--"}</b></div>
            <div className="summaryRow"><span>Status</span><b>{prettyStatus}</b></div>
            <div className="summaryRow"><span>Your approval</span><b>{result.buyer_approved ? "Approved" : "Pending"}</b></div>
            <div className="summaryRow"><span>Seller approval</span><b>{result.seller_approved ? "Approved" : "Pending"}</b></div>

            {err ? <div className="error" style={{ marginTop: 14 }}>⚠️ {err}</div> : null}

            {(result.status === "PENDING_APPROVALS" || result.status === "FAILED") && (
              <div className="row" style={{ marginTop: 16 }}>
                {result.status === "PENDING_APPROVALS" && !result.buyer_approved && (
                  <Button variant="success" disabled={busy} onClick={() => decide("APPROVE")}>
                    ✅ Approve Deal
                  </Button>
                )}

                <Button variant="ghost" disabled={busy} onClick={renegotiateAgain}>
                  🔁 Negotiate Again
                </Button>

                <Button variant="danger" disabled={busy} onClick={() => decide("CANCEL")}>
                  ❌ Cancel
                </Button>
              </div>
            )}

            {result.status === "APPROVED" && (
              <div className="pillRow" style={{ marginTop: 14 }}>
                <div className="pill">🎉 Both buyer and seller approved</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="h3">🗂️ Agent Negotiation Transcript</div>
            <div className="transcript">
              {(result.rounds || []).map((r) => (
                <div
                  key={r.round_no}
                  className={`roundCard ${r.seller_action === "ACCEPT" ? "roundCard--accepted" : ""}`}
                >
                  <div className="roundCard__head">
                    <div className="roundPill">Round {r.round_no}</div>
                    <div className="roundStatus">{r.seller_action}</div>
                  </div>

                  <div className="roundCard__note">{r.note}</div>

                  <div className="offerLine">
                    <div className="offerLine__left">
                      <div className="offerAvatar">🧑‍💼</div>
                      <span>Buyer Agent</span>
                    </div>
                    <span className="offerPrice">₹{r.buyer_offer}</span>
                  </div>

                  <div className="divider" />

                  <div className="offerLine">
                    <div className="offerLine__left">
                      <div className="offerAvatar">🏪</div>
                      <span>Seller Agent</span>
                    </div>
                    <span className="offerPrice">₹{r.seller_offer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}