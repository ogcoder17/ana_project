import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setErr("");
      const res = await api.get("/analytics/summary");
      setData(res);
    } catch (e) {
      setErr(e?.message || "Failed to load analytics");
    }
  }

  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return (
    <div className="app">
      <Navbar />

      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">📊 Analytics Dashboard</h2>
          <div className="muted">
            {data?.role === "seller"
              ? "Seller performance, revenue and deal insights"
              : "Buyer negotiation performance and savings"}
          </div>
        </div>

        {err ? <div className="error">⚠️ {err}</div> : null}

        {!data && !err ? (
          <div className="card">Loading analytics...</div>
        ) : data ? (
          <>
            <div className="grid4">
              <div className="card">
                <div className="muted">Total Negotiations</div>
                <h2>{data.total_negotiations}</h2>
              </div>

              <div className="card">
                <div className="muted">Approved Deals</div>
                <h2>{data.approved_deals}</h2>
              </div>

              <div className="card">
                <div className="muted">Pending Deals</div>
                <h2>{data.pending_deals}</h2>
              </div>

              <div className="card">
                <div className="muted">Success Rate</div>
                <h2>{data.success_rate}%</h2>
              </div>
            </div>

            <div style={{ height: 20 }} />

            {data.role === "buyer" ? (
              <div className="grid4">
                <div className="card">
                  <div className="muted">Total Savings</div>
                  <h2>{money(data.total_savings)}</h2>
                </div>

                <div className="card">
                  <div className="muted">Average Final Price</div>
                  <h2>{money(data.average_final_price)}</h2>
                </div>

                <div className="card">
                  <div className="muted">Cancelled Deals</div>
                  <h2>{data.cancelled_deals}</h2>
                </div>

                <div className="card">
                  <div className="muted">Failed Negotiations</div>
                  <h2>{data.failed_deals}</h2>
                </div>
              </div>
            ) : (
              <div className="grid4">
                <div className="card">
                  <div className="muted">Total Revenue</div>
                  <h2>{money(data.total_revenue)}</h2>
                </div>

                <div className="card">
                  <div className="muted">Average Deal Value</div>
                  <h2>{money(data.average_deal_value)}</h2>
                </div>

                <div className="card">
                  <div className="muted">Total Products</div>
                  <h2>{data.total_products}</h2>
                </div>

                <div className="card">
                  <div className="muted">Active Products</div>
                  <h2>{data.active_products}</h2>
                </div>
              </div>
            )}

            <div style={{ height: 20 }} />

            <div className="card">
              <h3>📌 Summary</h3>
              <p className="muted" style={{ lineHeight: 1.7 }}>
                {data.role === "buyer"
                  ? `You have started ${data.total_negotiations} negotiations, completed ${data.approved_deals} approved deals, and saved ${money(data.total_savings)} through autonomous negotiation.`
                  : `You have received ${data.total_negotiations} negotiations, closed ${data.approved_deals} approved deals, and generated ${money(data.total_revenue)} in confirmed revenue.`}
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}