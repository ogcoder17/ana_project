const API_BASE = "http://127.0.0.1:8000";

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  searchDeals: (brand, model, budget) =>
    post("/search-deals", { brand, model, budget }),

  startNegotiation: (payload) =>
    post("/start-negotiation", payload),

  negotiateStep: (sessionId, action, counter_price) =>
    post(`/negotiate/${sessionId}`, { action, counter_price }),
};