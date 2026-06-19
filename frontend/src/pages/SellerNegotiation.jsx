import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function SellerNegotiation() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [counter, setCounter] = useState("");

  async function load() {
    const res = await api.get(`/seller/negotiation/${id}`);
    setData(res);
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(action) {
    await api.post(`/seller/negotiation/${id}/respond`, {
      action,
      counter_price: Number(counter),
    });

    load();
  }

  if (!data) return <div>Loading...</div>;

  return (
    <div className="app">
      <Navbar />

      <main className="wrap">
        <h2 className="h2">💬 Seller Negotiation</h2>

        <div className="card">
          <div>Status: {data.status}</div>
          <div>Listed Price: ₹{data.listed_price}</div>

          {data.rounds.map((r) => (
            <div key={r.round_no} className="pill">
              Round {r.round_no}: {r.seller_action} ₹{r.seller_offer}
            </div>
          ))}

          <input
            type="number"
            value={counter}
            onChange={(e) => setCounter(e.target.value)}
            placeholder="Counter price"
          />

          <div className="row">
            <button onClick={() => respond("ACCEPT")}>✅ Accept</button>
            <button onClick={() => respond("COUNTER")}>🔁 Counter</button>
            <button onClick={() => respond("REJECT")}>❌ Reject</button>
          </div>
        </div>
      </main>
    </div>
  );
}