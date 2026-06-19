import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { apiFetch } from "../services/api";

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [actionBusyId, setActionBusyId] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Active");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setErr("");
      const res = await apiFetch("/seller/dashboard");
      setData(res);
    } catch (e) {
      setErr(e.message || "Failed to load seller dashboard");
    }
  }

  async function uploadImage() {
    if (!imageFile) return null;

    const token = localStorage.getItem("ana_token");
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await fetch("http://127.0.0.1:8000/api/uploads/image", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Image upload failed");
    }

    return data.image_url;
  }

  async function saveProduct() {
    try {
      setErr("");
      setUploading(true);

      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImage();
      }

      await apiFetch("/seller/products", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          brand: brand || null,
          description: description || null,
          price: Number(price),
          currency: "INR",
          image_url: uploadedImageUrl,
          status,
        }),
      });

      setTitle("");
      setCategory("General");
      setBrand("");
      setDescription("");
      setPrice("");
      setStatus("Active");
      setImageFile(null);
      setShowForm(false);

      await loadDashboard();
    } catch (e) {
      setErr(e.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  }

  async function sellerDecision(id, action) {
    try {
      setErr("");
      setActionBusyId(id);

      await apiFetch(`/seller/negotiations/${id}/decision`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });

      await loadDashboard();
    } catch (e) {
      setErr(e.message || "Seller action failed");
    } finally {
      setActionBusyId(null);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🏪 Seller Dashboard</h2>
          <div className="muted">Manage your products & approvals</div>
        </div>

        {err ? <div className="error">⚠️ {err}</div> : null}

        {!data ? (
          <div className="card">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid4">
              <div className="card">
                <div className="muted">Products</div>
                <h2>{data.total_products}</h2>
              </div>

              <div className="card">
                <div className="muted">Active Listings</div>
                <h2>{data.active_products}</h2>
              </div>

              <div className="card">
                <div className="muted">Pending Approvals</div>
                <h2>{data.total_negotiations}</h2>
              </div>

              <div className="card">
                <div className="muted">Revenue Potential</div>
                <h2>₹{data.revenue}</h2>
              </div>
            </div>

            <div style={{ height: 20 }} />

            <div className="card">
              <h3>🔔 Incoming Deal Approvals</h3>
              {!data.pending_approvals?.length ? (
                <div className="muted">No pending approvals right now.</div>
              ) : (
                <div className="stack">
                  {data.pending_approvals.map((n) => (
                    <div className="roundCard" key={n.negotiation_id}>
                      <div className="summaryRow"><span>Product</span><b>{n.title}</b></div>
                      <div className="summaryRow"><span>Buyer Budget</span><b>₹{n.buyer_budget}</b></div>
                      <div className="summaryRow"><span>Negotiated Price</span><b>₹{n.final_price}</b></div>
                      <div className="summaryRow"><span>Buyer Approval</span><b>{n.buyer_approved ? "Approved" : "Pending"}</b></div>
                      <div className="summaryRow"><span>Your Approval</span><b>{n.seller_approved ? "Approved" : "Pending"}</b></div>

                      <div className="row" style={{ marginTop: 14 }}>
                        <Button
                          variant="success"
                          disabled={actionBusyId === n.negotiation_id || n.seller_approved}
                          onClick={() => sellerDecision(n.negotiation_id, "APPROVE")}
                        >
                          ✅ Approve
                        </Button>

                        <Button
                          variant="ghost"
                          disabled={actionBusyId === n.negotiation_id}
                          onClick={() => sellerDecision(n.negotiation_id, "RENEGOTIATE")}
                        >
                          🔁 Negotiate Again
                        </Button>

                        <Button
                          variant="danger"
                          disabled={actionBusyId === n.negotiation_id}
                          onClick={() => sellerDecision(n.negotiation_id, "CANCEL")}
                        >
                          ❌ Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: 20 }} />

            <div className="card">
              <div className="rowBetween">
                <h3>Your Listings</h3>
                <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                  ➕ Add Product
                </Button>
              </div>

              {showForm && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="field">
                    <label>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Category</label>
                    <input value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Brand</label>
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Description</label>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Price (₹)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Upload Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  <div className="row">
                    <Button variant="primary" onClick={saveProduct} disabled={uploading}>
                      {uploading ? "⏳ Saving..." : "✅ Save Product"}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products?.map((p) => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>₹{p.price}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}